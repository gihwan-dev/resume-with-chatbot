export const prerender = false

import { createVertex } from "@ai-sdk/google-vertex"
import * as Sentry from "@sentry/astro"
import { streamText } from "ai"

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

const SYSTEM_PROMPT = `당신은 개발자 이력서 답변을 보고, 채용 담당자 관점의 후속 질문을 생성하는 어시스턴트입니다.

정확히 3개의 후속 질문을 생성하세요.

핵심 역량 축:
1. 접근성(WCAG) 작업
2. TypeScript 안정성/품질 개선
3. AI 도구 활용 경험
4. 디자인 시스템/컴포넌트 설계 경험
5. 메타 프레임워크/SSR/서버리스 경험

질문 생성 규칙:
- 이전 답변에서 아직 드러나지 않은 핵심 역량을 우선 질문
- 이전 답변에 정량 성과(숫자, 퍼센트, 시간, 건수)가 부족하면 최소 1개는 정량 성과를 묻는 질문 생성
- 모호한 표현은 채용 관점의 구체적 표현으로 리라이팅해서 질문 생성
- 질문은 한국어로 작성
- 각 질문은 가능한 한 간결하게 작성
- 모든 질문은 반드시 물음표(?)로 끝낼 것

출력 형식(반드시 준수):
1. [질문1]
2. [질문2]
3. [질문3]

설명이나 여분 텍스트는 출력하지 마세요.`

export const POST = async ({ request }: { request: Request }) => {
  try {
    const { prompt } = (await request.json()) as { prompt: string }

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const vertex = getVertex()

    // Use a fast model for quick response
    const result = streamText({
      model: vertex("gemini-2.0-flash"),
      system: SYSTEM_PROMPT,
      prompt: `이전 답변:\n${prompt}\n\n위 답변을 바탕으로 후속 질문 3개를 생성해주세요.`,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    Sentry.captureException(error, { tags: { "api.route": "/api/followup" } })
    await Sentry.flush(2000)
    console.error("Error in followup API:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
