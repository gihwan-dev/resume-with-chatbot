export const prerender = false

import * as Sentry from "@sentry/astro"
import { createVertex } from "@ai-sdk/google-vertex"
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

const SYSTEM_PROMPT = `You are a helpful assistant that generates follow-up questions based on the previous answer about a developer's resume/portfolio.

Generate exactly 3 concise follow-up questions that a recruiter might want to ask next.
Each question should be:
- In Korean
- Relevant to the previous answer
- Concise (under 30 characters if possible)
- End with a question mark

Output format:
1. [질문1]
2. [질문2]
3. [질문3]

Do not include any other text or explanation.`

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
    console.error("Error in followup API:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
