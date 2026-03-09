export const prerender = false

import { createVertex } from "@ai-sdk/google-vertex"
import * as Sentry from "@sentry/astro"
import type { UIMessage } from "ai"
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  hasToolCall,
  stepCountIs,
  streamText,
} from "ai"
import { buildResumePrompt } from "@/lib/resume-prompt"
import { parseResumeVariant, type ResumeVariantId } from "@/lib/resume/variant"
import { createToolInputDeltaFilter } from "@/lib/stream/filter-tool-input-delta"
import {
  analyzeToolCallPattern,
  buildDynamicSystemPrompt,
  buildSearchContextFromSteps,
  classifyIntent,
  createAnswerTool,
  createSearchContext,
  resolveThinkingLevel,
  type SearchContext,
  workAgentTools,
} from "@/lib/work-agent"
import { buildCatalogSummary } from "@/lib/work-agent/obsidian.server"
import { WorkAgentError } from "@/lib/work-agent/types"

type ToolName = keyof typeof workAgentTools
const SEARCH_TOOLS: ToolName[] = ["searchDocuments", "readDocument"]
const ALL_TOOLS: ToolName[] = [...SEARCH_TOOLS, "answer"]

const SYSTEM_PROMPT_HEADER = `당신은 최기환의 이력서 웹사이트에서 방문자의 질문에 답변하는 AI 어시스턴트입니다.

## 핵심 원칙
- 제공된 이력서/Obsidian 볼트 근거만 사용하세요.
- 근거가 없으면 "해당 정보는 확인되지 않았습니다"라고 답하세요.
- 한국어로 간결하고 직접적으로 답하세요.
- 사실성 질문은 searchDocuments/readDocument 결과를 확인한 뒤 답하세요.`

const SYSTEM_PROMPT_FOOTER = `## 도구 사용 전략

- searchDocuments는 후보 탐색, readDocument는 본문 검증 용도입니다.
- 문서 제목만으로 단정하지 말고 필요한 문서는 readDocument로 확인하세요.
- 반복 검색이면 키워드/접근을 바꿔 재시도하세요.
- 최종 응답은 반드시 answer 도구로 작성하고, sources에는 실제 검색 결과 ID만 포함하세요.
- confidence 규칙:
  - high: 검색 결과로 직접 확인됨
  - medium: 일부만 확인됨("검색 결과에 따르면"으로 시작)
  - low: 근거 부족(추측 금지, 확인되지 않았다고 답변)`

/**
 * Content Collections 데이터를 기반으로 시스템 프롬프트를 동적 생성
 * @param dynamicPrompt - 의도 분류 및 반복 호출 분석에 기반한 동적 프롬프트
 */
async function getSystemPrompt(
  resumeVariant: ResumeVariantId,
  dynamicPrompt?: string
): Promise<string> {
  const resumeSection = await buildResumePrompt(resumeVariant)
  const catalogSummary = buildCatalogSummary()
  const dynamicSection = dynamicPrompt ? `\n\n---\n\n${dynamicPrompt}` : ""
  return `${SYSTEM_PROMPT_HEADER}

---

# 최기환 이력서

${resumeSection}

---

# Obsidian 볼트 문서 카탈로그

${catalogSummary}

---

${SYSTEM_PROMPT_FOOTER}${dynamicSection}`
}

function appendDynamicPrompt(basePrompt: string, dynamicPrompt: string): string {
  return `${basePrompt}\n\n---\n\n${dynamicPrompt}`
}

// Lazy initialization: Vertex AI 인스턴스를 요청 시점에 생성
const getVertex = () => {
  const privateKey = import.meta.env.FIREBASE_PRIVATE_KEY
  const clientEmail = import.meta.env.FIREBASE_CLIENT_EMAIL
  const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error(
      "Missing FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, or PUBLIC_FIREBASE_PROJECT_ID env vars"
    )
  }

  // private_key의 \n 문자열을 실제 줄바꿈으로 변환
  const formattedPrivateKey = privateKey.replace(/\\n/g, "\n")

  return createVertex({
    project: projectId,
    location: "global",
    googleAuthOptions: {
      credentials: {
        client_email: clientEmail,
        private_key: formattedPrivateKey,
      },
    },
  })
}

function hasAnswerToolCall(
  steps: Array<{ toolCalls?: Array<{ toolName: string; args?: unknown }> }>
): boolean {
  return steps.some((step) => step.toolCalls?.some((call) => call.toolName === "answer"))
}

export const POST = async ({ request }: { request: Request }) => {
  try {
    const resumeVariant = parseResumeVariant(new URL(request.url).searchParams.get("variant"))
    const { messages } = (await request.json()) as { messages: UIMessage[] }
    const modelMessages = await convertToModelMessages(messages)

    const vertex = getVertex()

    // 마지막 사용자 메시지에서 의도 분류
    const lastUserMessage = messages.filter((m) => m.role === "user").pop()
    const userMessageText = lastUserMessage
      ? lastUserMessage.parts
          .filter((part): part is { type: "text"; text: string } => part.type === "text")
          .map((part) => part.text)
          .join(" ")
      : ""
    const intentClassification = classifyIntent(userMessageText)

    console.log(
      "[Intent Classification]",
      JSON.stringify({
        message: userMessageText.slice(0, 100),
        intent: intentClassification.intent,
        confidence: intentClassification.confidence,
        keywords: intentClassification.keywords,
      })
    )

    // 초기 동적 프롬프트 생성 (의도 기반)
    const initialDynamicPrompt = buildDynamicSystemPrompt({
      intent: intentClassification.intent,
    })
    const baseSystemPrompt = await getSystemPrompt(resumeVariant)
    const systemPrompt = appendDynamicPrompt(baseSystemPrompt, initialDynamicPrompt)
    const thinkingLevel = resolveThinkingLevel(intentClassification.intent)

    // SearchContext 추적: 검색된 모든 ID를 누적
    let currentSearchContext: SearchContext = createSearchContext()

    // 동적 answer 도구 생성 (출처 검증 포함)
    const dynamicAnswerTool = createAnswerTool(() => currentSearchContext)

    // 도구 객체 구성 (answer만 동적으로 교체)
    const tools = {
      searchDocuments: workAgentTools.searchDocuments,
      readDocument: workAgentTools.readDocument,
      answer: dynamicAnswerTool,
    }

    const result = streamText({
      model: vertex("gemini-3.1-pro-preview"),
      providerOptions: {
        google: {
          thinkingConfig: {
            includeThoughts: true,
            thinkingLevel,
          },
        },
      },
      system: systemPrompt,
      messages: modelMessages,
      tools,

      prepareStep: ({ stepNumber, steps }) => {
        // SearchContext 업데이트: 이전 step들의 검색 결과 ID 누적
        const stepsForContext = steps.map((step) => ({
          toolResults: step.toolResults?.map((tr) => ({
            toolName: tr.toolName,
            result: tr.output,
          })),
        }))
        currentSearchContext = buildSearchContextFromSteps(stepsForContext)

        // 도구 호출 패턴 분석
        const analysis = analyzeToolCallPattern(steps)
        const dynamicPrompt = buildDynamicSystemPrompt({
          intent: intentClassification.intent,
          analysis,
          includeReflexion: true,
        })
        const stepSystemPrompt = appendDynamicPrompt(baseSystemPrompt, dynamicPrompt)

        if (analysis.consecutiveSameToolCount >= 3 && analysis.lastToolName) {
          console.warn(
            "[Repetitive Tool Call]",
            JSON.stringify({
              tool: analysis.lastToolName,
              consecutiveCount: analysis.consecutiveSameToolCount,
              lastQueries: analysis.lastQueries,
            })
          )
        }

        // Step 0: 검색 도구만 활성화, 필수 사용
        if (stepNumber === 0) {
          return {
            system: stepSystemPrompt,
            activeTools: SEARCH_TOOLS,
            toolChoice: "required" as const,
          }
        }

        const answered = hasAnswerToolCall(steps)
        if (!answered && stepNumber >= 2) {
          return {
            system: stepSystemPrompt,
            activeTools: ["answer"],
            toolChoice: "required" as const,
          }
        }

        // Step 1+: answer 포함 모든 도구 자동 선택
        return {
          system: stepSystemPrompt,
          activeTools: ALL_TOOLS,
          toolChoice: "auto" as const,
        }
      },

      stopWhen: [stepCountIs(15), hasToolCall("answer")],

      onStepFinish: ({ toolCalls, toolResults, finishReason, usage }) => {
        if (toolCalls.length > 0) {
          // answer 도구 호출 시 validation 결과 추출
          const answerResult = toolResults.find((tr) => tr.toolName === "answer")
          const validation =
            answerResult &&
            "result" in answerResult &&
            typeof answerResult.result === "object" &&
            answerResult.result !== null &&
            "validation" in answerResult.result
              ? (answerResult.result as { validation?: { warnings?: string[]; isValid?: boolean } })
                  .validation
              : undefined

          console.log(
            "[Tool Calls]",
            JSON.stringify(
              {
                timestamp: new Date().toISOString(),
                calls: toolCalls.map((tc) => ({
                  name: tc.toolName,
                  args: "input" in tc ? tc.input : undefined,
                })),
                results: toolResults.map((tr) => ({
                  name: tr.toolName,
                  success:
                    "result" in tr &&
                    typeof tr.result === "object" &&
                    tr.result !== null &&
                    "success" in tr.result
                      ? (tr.result as { success?: boolean }).success
                      : true,
                })),
                usage,
                finishReason,
                // 출처 검증 결과 로깅
                ...(validation && {
                  sourceValidation: {
                    isValid: validation.isValid,
                    warningCount: validation.warnings?.length ?? 0,
                  },
                }),
              },
              null,
              2
            )
          )

          // 출처 검증 경고가 있으면 별도 로깅
          if (validation?.warnings && validation.warnings.length > 0) {
            console.warn("[Source Validation Warnings]", validation.warnings.join("\n"))
          }
        }
      },
    })

    const stream = result.toUIMessageStream()
    const filtered = stream.pipeThrough(createToolInputDeltaFilter())
    return createUIMessageStreamResponse({ stream: filtered })
  } catch (error) {
    if (error instanceof WorkAgentError) {
      Sentry.captureException(error, {
        tags: { "api.route": "/api/chat", "work_agent.error_code": error.code },
        fingerprint: ["work-agent", error.code],
      })
    } else {
      Sentry.captureException(error, { tags: { "api.route": "/api/chat" } })
    }
    await Sentry.flush(2000)
    console.error("Error in chat API:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
