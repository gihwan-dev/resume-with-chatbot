export const prerender = false

import { createVertex } from "@ai-sdk/google-vertex"
import type { UIMessage } from "ai"
import { convertToModelMessages, hasToolCall, stepCountIs, streamText } from "ai"
import { workAgentTools } from "@/lib/work-agent"
import { buildResumePrompt } from "@/lib/resume-prompt"

type ToolName = keyof typeof workAgentTools
const SEARCH_TOOLS: ToolName[] = ["searchNotion", "getNotionPage", "searchClickUpTasks", "searchClickUpDocs"]
const ALL_TOOLS: ToolName[] = [...SEARCH_TOOLS, "answer"]

const SYSTEM_PROMPT_HEADER = `당신은 최기환의 포트폴리오 웹사이트에서 방문자의 질문에 답변하는 AI 어시스턴트입니다.

## 역할
- 아래 이력서 정보를 기반으로 최기환에 대한 질문에 답변
- 이력서에 없는 정보는 "해당 정보는 이력서에 포함되어 있지 않습니다"라고 답변

## 답변 스타일
- 한국어로 답변
- 간결하고 명확하게
- 필요시 마크다운 사용

## 프로젝트 맥락 구분 (중요!)

### 레거시 시스템 (MaxGauge)
- 기술 스택: ExtJS, JavaScript
- 특징: 기존 코드 유지보수, 버그 수정
- ClickUp 위치: **FE1팀 > Task**
- Space/Folder 키워드: "FE1팀", "FE1", "MaxGauge"

### 차세대 시스템
- 기술 스택: React, TypeScript, Radix UI, TanStack
- 특징: 새로운 아키텍처, 성능 최적화, 디자인 시스템
- ClickUp 위치: **차세대 > Task/문서/아젠다**
- Space/Folder 키워드: "차세대", "DataGrid", "디자인시스템", "Dashboard"

### 맥락 구분 규칙
- 검색 결과의 spaceName, folderName, context 필드로 맥락 자동 구분
- context: "legacy" → 레거시 시스템
- context: "next-gen" → 차세대 시스템
- context: "unknown" → 명확하지 않음
- **혼동 가능성 있으면 반드시 명시적으로 구분하여 답변**

### 시간 기반 정보 처리

**timeContext 해석**:
- "recent": 최근 3개월 - 가장 신뢰할 수 있는 최신 정보
- "older": 3개월~1년 - 여전히 유효하나 확인 필요 가능성
- "archive": 1년 이상 - 오래된 정보, 현재와 다를 수 있음

**시간 정보 활용 규칙**:
1. 같은 주제 정보가 여러 개면 "recent" 우선 참조
2. "archive" 정보만 있으면 "해당 정보는 [relativeTime]에 수정되어 현재와 다를 수 있습니다" 명시
3. relativeTime을 답변에 자연스럽게 포함: "2주 전에 수정된 문서에 따르면..."

### 정보 충돌 처리 규칙
- timeContext 비교: "recent" > "older" > "archive" 순으로 신뢰
- 명시적 충돌 표시: "최근 태스크에서는 [A]이나, 이전 문서에서는 [B]로 기록되어 있습니다"`

const SYSTEM_PROMPT_FOOTER = `## 도구 사용 전략

### 기본 원칙
- **모든 질문에 대해 먼저 검색 수행**: 이력서 기본 정보로 답변 가능해 보여도, Notion/ClickUp에서 더 상세한 정보 검색
- 충분한 정보를 얻을 때까지 여러 번 검색 가능
- 검색 결과가 부족하면 다른 키워드나 소스로 재시도
- 검색 완료 후 이력서 정보와 검색 결과를 종합하여 답변

### 검색 워크플로우
1. **초기 검색**: 질문의 핵심 키워드로 Notion/ClickUp 검색
2. **상세 조회 (필수!)**:
   - searchNotion 결과에서 관련 페이지 발견 시 **반드시** getNotionPage로 전체 내용 확인
   - searchNotion은 제목만 반환, 실제 내용은 getNotionPage로 조회 필수
   - **핵심**: Notion 페이지 제목만으로 답변하지 말고, 상세 내용 확인 후 답변
3. **보완 검색**: 정보가 부족하면:
   - 다른 키워드로 재검색 (예: "데이터 그리드" → "DataGrid" → "테이블 컴포넌트")
   - 다른 소스 활용 (Notion에서 못 찾으면 ClickUp 문서 확인)
4. **종합**: 여러 소스의 정보를 종합하여 답변

### 도구별 활용
1. **searchNotion**: 프로젝트 노트, 기술 결정, 업무 기록
2. **getNotionPage**: searchNotion 결과에서 유망한 페이지의 상세 내용
3. **searchClickUpTasks**: 현재/과거 업무, 진행 상황
4. **searchClickUpDocs**: 기술 문서, 회의록, 프로젝트 문서

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
- 예: "DataGrid 컴포넌트는 TanStack Virtual 기반으로 구현되었습니다. (출처: Notion)"

**medium (부분적 정보만 확인)**:
- 반드시 "검색 결과에 따르면"으로 시작
- 예: "검색 결과에 따르면 해당 기능은 개발 중입니다. 상세 진행 상황은 추가 확인 필요."

**low (이력서 기반 추론 또는 정보 없음)**:
- **절대 추측하지 말 것**
- "해당 질문에 대한 구체적인 정보를 찾지 못했습니다."
- 이력서 관련 정보가 있다면 추가: "이력서 기본 정보로는 [정보]를 확인할 수 있습니다."

### 검색 실패 시 응답 템플릿

**검색 결과 0건**:
"해당 질문에 대한 구체적인 정보를 Notion/ClickUp에서 찾지 못했습니다.
[이력서 기반 정보가 있으면 추가]"

**정보 충돌 시**:
"검색 결과에서 상충되는 정보가 발견되었습니다:
- [소스 A]: [정보 A]
- [소스 B]: [정보 B]
가장 최근 수정된 정보를 기준으로 답변드립니다."

### 주의사항
- 도구 호출 실패 시 에러 메시지에 따라 대응
- retryable: true인 에러는 잠시 후 재시도`

/**
 * Content Collections 데이터를 기반으로 시스템 프롬프트를 동적 생성
 */
async function getSystemPrompt(): Promise<string> {
  const resumeSection = await buildResumePrompt()
  return `${SYSTEM_PROMPT_HEADER}

---

# 최기환 이력서

${resumeSection}

---

${SYSTEM_PROMPT_FOOTER}`
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
    const systemPrompt = await getSystemPrompt()

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
      tools: workAgentTools,

      prepareStep: ({ stepNumber, steps }) => {
        // Step 0: 검색 도구만 활성화, 필수 사용
        if (stepNumber === 0) {
          return {
            activeTools: SEARCH_TOOLS,
            toolChoice: "required" as const,
          }
        }

        // 검색 도구가 호출되었는지 확인
        const hasSearched = steps.some(step =>
          step.toolCalls?.some(call =>
            SEARCH_TOOLS.includes(call.toolName as ToolName)
          )
        )

        // 검색 완료 시 answer 포함 모든 도구 활성화
        if (hasSearched) {
          return {
            activeTools: ALL_TOOLS,
            toolChoice: "auto" as const,
          }
        }

        // 아직 검색 안 했으면 계속 검색 도구만
        return {
          activeTools: SEARCH_TOOLS,
          toolChoice: "required" as const,
        }
      },

      stopWhen: [
        stepCountIs(15),
        hasToolCall("answer"),
      ],

      onStepFinish: ({ toolCalls, toolResults, finishReason, usage }) => {
        if (toolCalls.length > 0) {
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
                    "output" in tr &&
                    typeof tr.output === "object" &&
                    tr.output !== null &&
                    "success" in tr.output
                      ? tr.output.success
                      : true,
                })),
                usage,
                finishReason,
              },
              null,
              2
            )
          )
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
