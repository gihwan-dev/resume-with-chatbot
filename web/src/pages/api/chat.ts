export const prerender = false

import { createVertex } from "@ai-sdk/google-vertex"
import type { UIMessage } from "ai"
import { convertToModelMessages, hasToolCall, stepCountIs, streamText } from "ai"
import { buildResumePrompt } from "@/lib/resume-prompt"
import {
  analyzeToolCallPattern,
  buildDynamicSystemPrompt,
  buildSearchContextFromSteps,
  classifyIntent,
  createAnswerTool,
  createSearchContext,
  type SearchContext,
  shouldAllowAnswer,
  workAgentTools,
} from "@/lib/work-agent"
import { buildCatalogSummary } from "@/lib/work-agent/obsidian.server"

type ToolName = keyof typeof workAgentTools
const SEARCH_TOOLS: ToolName[] = ["searchDocuments", "readDocument"]
const ALL_TOOLS: ToolName[] = [...SEARCH_TOOLS, "answer"]

const SYSTEM_PROMPT_HEADER = `당신은 최기환의 포트폴리오 웹사이트에서 방문자의 질문에 답변하는 AI 어시스턴트입니다.

## 역할
- 아래 이력서 정보와 Obsidian 볼트 문서를 기반으로 최기환에 대한 질문에 답변
- 이력서와 볼트에 없는 정보는 "해당 정보는 확인되지 않았습니다"라고 답변

## 답변 스타일
- 한국어로 답변
- 간결하고 명확하게
- 필요시 마크다운 사용

## 데이터 소스
모든 정보는 로컬 Obsidian 볼트에서 검색됩니다. 외부 API 호출이 없으므로 빠르고 안정적입니다.

### 업무 기록 (Exem 디렉토리)
- Exem 카테고리의 문서에는 실제 업무 기록이 담겨 있습니다
- Projects: 프로젝트별 TODO, 설계, 아키텍처
- Daily: 일일 업무 기록, 회의록
- Knowledge: 업무 중 습득한 지식
- Snippets: 재사용 코드 스니펫
- Archive: 과거 프로젝트 기록

### 기술 지식
- React.js, JavaScript, TypeScript, CSS, HTML 등 프론트엔드 기술
- Browser, Network 등 시스템 지식
- Clean Code, FSD, Design System 등 아키텍처/패턴
- AI, Algorithm, Test 등 기타 기술`

const SYSTEM_PROMPT_FOOTER = `## 도구 사용 전략

### 기본 원칙
- **모든 질문에 대해 먼저 검색 수행**: 이력서 기본 정보로 답변 가능해 보여도, 볼트에서 더 상세한 정보 검색
- 충분한 정보를 얻을 때까지 여러 번 검색 가능
- 검색 결과가 부족하면 다른 키워드로 재시도
- 검색 완료 후 이력서 정보와 검색 결과를 종합하여 답변

### 검색 워크플로우
1. **초기 검색**: 질문의 핵심 키워드로 searchDocuments 검색
2. **상세 조회 (필수!)**:
   - searchDocuments 결과에서 관련 문서 발견 시 **반드시** readDocument로 전체 내용 확인
   - searchDocuments는 메타데이터만 반환, 실제 내용은 readDocument로 조회 필수
   - **핵심**: 문서 제목만으로 답변하지 말고, 상세 내용 확인 후 답변
3. **보완 검색**: 정보가 부족하면:
   - 다른 키워드로 재검색 (예: "데이터 그리드" → "DataGrid" → "테이블 컴포넌트")
   - Exem 업무 기록과 기술 지식 카테고리를 함께 검색
4. **종합**: 여러 문서의 정보를 종합하여 답변

### 도구별 활용
1. **searchDocuments**: 키워드로 볼트 문서 검색 (제목, 카테고리, 태그, 요약에서 매칭)
2. **readDocument**: searchDocuments에서 찾은 문서의 전체 내용 조회

### 검색 품질 기준
- 질문에 직접 답변할 수 있는 구체적 정보를 찾을 때까지 검색
- 검색 결과가 0건이거나 관련성이 낮으면 반드시 재검색
- "정보를 찾을 수 없다"고 답변하기 전에 최소 2-3가지 다른 접근 시도

### answer 도구 사용 가이드
- **반드시 검색 후 사용**: 최소 1회 이상 검색을 수행한 후에만 answer 도구 사용
- **출처 명시**: 검색 결과에서 정보를 찾았다면 sources에 포함

### confidence 기반 답변 포맷 (필수!)

**high (검색 결과에서 직접 확인)**:
- 그대로 답변하되 출처를 명시
- 예: "DataGrid 컴포넌트는 TanStack Virtual 기반으로 구현되었습니다."

**medium (부분적 정보만 확인)**:
- 반드시 "검색 결과에 따르면"으로 시작
- 예: "검색 결과에 따르면 해당 기능은 개발 중입니다."

**low (이력서 기반 추론 또는 정보 없음)**:
- **절대 추측하지 말 것**
- "해당 질문에 대한 구체적인 정보를 찾지 못했습니다."

### answer 도구 출처 규칙 (중요!)
- sources에는 검색 결과에서 받은 **실제 ID**를 반드시 포함
  - Obsidian 문서: searchDocuments/readDocument에서 받은 id
  - resume 타입만 id 없이 사용 가능
- 시스템이 자동으로 출처 ID가 실제 검색 결과와 일치하는지 검증
- 검색되지 않은 ID를 출처로 지정하면 경고 발생

### 출처 작성 예시

**올바른 예시:**
{
  "sources": [
    { "type": "obsidian", "title": "위젯 빌더 리팩토링", "id": "Exem--01-Projects--차세대-대시보드--위젯빌더--위젯-빌더-리팩토링" },
    { "type": "resume", "title": "이력서 기본 정보" }
  ]
}

### 주의사항
- 도구 호출 실패 시 에러 메시지에 따라 대응
- 같은 검색을 반복하지 마세요`

/**
 * Content Collections 데이터를 기반으로 시스템 프롬프트를 동적 생성
 * @param dynamicPrompt - 의도 분류 및 반복 호출 분석에 기반한 동적 프롬프트
 */
async function getSystemPrompt(dynamicPrompt?: string): Promise<string> {
  const resumeSection = await buildResumePrompt()
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
    location: "us-central1",
    googleAuthOptions: {
      credentials: {
        client_email: clientEmail,
        private_key: formattedPrivateKey,
      },
    },
  })
}

export const POST = async ({ request }: { request: Request }) => {
  try {
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
    const systemPrompt = await getSystemPrompt(initialDynamicPrompt)

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
      model: vertex("gemini-2.5-pro"),
      providerOptions: {
        google: {
          thinkingConfig: {
            includeThoughts: true,
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

        // Step 0: 검색 도구만 활성화, 필수 사용
        if (stepNumber === 0) {
          return {
            activeTools: SEARCH_TOOLS,
            toolChoice: "required" as const,
          }
        }

        // 3회 연속 동일 도구 호출 시 해당 도구 제외 (ReAct + Reflexion)
        if (analysis.consecutiveSameToolCount >= 3 && analysis.lastToolName) {
          console.warn(
            "[Repetitive Tool Call]",
            JSON.stringify({
              tool: analysis.lastToolName,
              consecutiveCount: analysis.consecutiveSameToolCount,
              lastQueries: analysis.lastQueries,
            })
          )

          // 반복된 도구를 제외한 대안 도구 목록
          const alternativeTools = ALL_TOOLS.filter((t) => t !== analysis.lastToolName)

          return {
            activeTools: alternativeTools,
            toolChoice: "required" as const,
          }
        }

        // 검색 충분성 확인: 의도별 최소 검색 횟수 충족 여부
        const sufficiency = shouldAllowAnswer(intentClassification.intent, analysis)

        if (!sufficiency.isReady) {
          // 최소 검색 미달 → 검색 도구만, 필수 사용
          console.log("[Search Sufficiency]", sufficiency.reason)
          return {
            activeTools: SEARCH_TOOLS,
            toolChoice: "required" as const,
          }
        }

        // 최소 검색 충족 → answer 포함 모든 도구 활성화
        return {
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

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
