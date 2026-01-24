export const prerender = false

import { createVertex } from "@ai-sdk/google-vertex"
import type { UIMessage } from "ai"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
} from "ai"
import {
  AGENT_SYSTEM_PROMPT,
  createRAGAgent,
  type Source,
} from "@/lib/rag-agent"

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

    // Create RAG Agent with tools
    const agent = createRAGAgent(vertex, {
      maxSteps: 5,
      relevanceThreshold: 0.7,
      initialFetchLimit: 10,
      maxResults: 5,
    })

    // Clear any previous sources
    agent.clearSources()

    // Track if sources have been sent
    let sourcesSent = false
    const collectedSources: Source[] = []

    // Stream Response with Agent tools
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          model: vertex("gemini-2.5-pro"),
          system: AGENT_SYSTEM_PROMPT,
          messages: modelMessages,
          tools: agent.tools,
          stopWhen: stepCountIs(5),
          onStepFinish: ({ toolResults }) => {
            // Check if searchKnowledge was called and collect sources
            if (toolResults && Array.isArray(toolResults)) {
              for (const toolResult of toolResults) {
                // Use 'output' for tool result value (AI SDK v6)
                const output = "output" in toolResult ? toolResult.output : null
                if (
                  toolResult.toolName === "searchKnowledge" &&
                  Array.isArray(output) &&
                  output.length > 0
                ) {
                  // Convert to client-compatible sources
                  const sources = agent.toClientSources(output)

                  // Accumulate sources (in case of multiple searches)
                  for (const source of sources) {
                    if (!collectedSources.some((s) => s.id === source.id)) {
                      collectedSources.push(source)
                    }
                  }

                  // Send sources immediately after first search
                  if (!sourcesSent && collectedSources.length > 0) {
                    console.log(
                      "[Agent] Sending sources to client:",
                      collectedSources.length
                    )
                    writer.write({
                      type: "data-sources",
                      id: "sources",
                      data: collectedSources,
                    })
                    sourcesSent = true
                  }
                }
              }
            }

            // Log tool calls for debugging
            if (toolResults && Array.isArray(toolResults)) {
              for (const toolResult of toolResults) {
                const output = "output" in toolResult ? toolResult.output : null
                console.log(
                  `[Agent] Tool: ${toolResult.toolName}`,
                  typeof output === "object"
                    ? JSON.stringify(output).slice(0, 200)
                    : output
                )
              }
            }
          },
        })

        writer.merge(result.toUIMessageStream())
      },
    })

    return createUIMessageStreamResponse({ stream })
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
