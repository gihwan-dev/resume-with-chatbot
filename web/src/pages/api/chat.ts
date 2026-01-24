export const prerender = false

import { createVertex } from "@ai-sdk/google-vertex"
import type { TextPart, UIMessage } from "ai"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  embed,
  streamText,
} from "ai"
import { FieldValue } from "firebase-admin/firestore"
import { db } from "@/lib/firebase.server"

// Relevance filtering constants
const RELEVANCE_THRESHOLD = 0.7
const INITIAL_FETCH_LIMIT = 10
const MAX_RESULTS = 5

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

interface KnowledgeDocument {
  content: string
  title?: string
  category?: string
  embedding_field?: number[]
}

interface Source {
  id: string
  title: string
  content: string
  category: string
  relevanceScore: number
}

export const POST = async ({ request }: { request: Request }) => {
  try {
    const { messages } = (await request.json()) as { messages: UIMessage[] }
    const modelMessages = await convertToModelMessages(messages)
    const lastMessage = modelMessages[modelMessages.length - 1]

    // Extract text content from the last message safely
    let userQuery = ""
    if (typeof lastMessage.content === "string") {
      userQuery = lastMessage.content
    } else if (Array.isArray(lastMessage.content)) {
      userQuery = lastMessage.content
        .filter((part): part is TextPart => part.type === "text")
        .map((part) => part.text)
        .join("")
    }

    const vertex = getVertex()

    // 1. Generate Embedding for the user query
    const { embedding } = await embed({
      model: vertex.embeddingModel("text-embedding-004"),
      value: userQuery,
    })

    // 2. Vector Search in Firestore (with graceful degradation)
    const sources: Source[] = []
    let contextText = ""

    try {
      const knowledgeBaseRef = db.collection("knowledge_base")

      // Use type assertion for distanceResultField (available in newer Firestore versions)
      const vectorQuery = knowledgeBaseRef.findNearest(
        "embedding_field",
        FieldValue.vector(embedding),
        {
          limit: INITIAL_FETCH_LIMIT,
          distanceMeasure: "COSINE",
          distanceResultField: "vector_distance",
        } as { limit: number; distanceMeasure: "COSINE"; distanceResultField?: string }
      )

      const vectorSnapshot = await vectorQuery.get()

      // 3. Extract and filter results by relevance
      interface VectorResult extends KnowledgeDocument {
        vector_distance?: number
      }

      const rawResults: {
        id: string
        data: VectorResult
        similarity: number
      }[] = []

      vectorSnapshot.forEach((doc) => {
        const data = doc.data() as VectorResult
        // Convert cosine distance to similarity (cosine distance = 1 - cosine similarity)
        // So similarity = 1 - distance
        const distance = data.vector_distance ?? 0
        const similarity = 1 - distance
        rawResults.push({ id: doc.id, data, similarity })
      })

      console.log(
        "[Vector Search] Raw results count:",
        rawResults.length,
        "similarities:",
        rawResults.map((r) => r.similarity.toFixed(3))
      )

      // Filter by relevance threshold, sort by similarity, take top MAX_RESULTS
      const filteredResults = rawResults
        .filter((r) => r.similarity >= RELEVANCE_THRESHOLD)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, MAX_RESULTS)

      console.log(
        "[Vector Search] Filtered results count:",
        filteredResults.length,
        "(threshold:",
        RELEVANCE_THRESHOLD,
        ")"
      )

      // Build sources and context from filtered results
      for (const result of filteredResults) {
        sources.push({
          id: result.id,
          title: result.data.title || "경험",
          content: result.data.content.slice(0, 200),
          category: result.data.category || "기타",
          relevanceScore: Math.round(result.similarity * 100) / 100,
        })
        contextText += `\n---\n${result.data.content}`
      }

      // Vector Search 결과 로깅
      console.log("[Vector Search] Query:", userQuery.slice(0, 100))
      console.log("[Vector Search] Final sources count:", sources.length)
      console.log(
        "[Vector Search] Sources:",
        sources.map((s) => ({
          id: s.id,
          title: s.title,
          category: s.category,
          relevanceScore: s.relevanceScore,
        }))
      )
    } catch (vectorError: unknown) {
      console.warn(
        "Vector search failed, proceeding without RAG context:",
        vectorError
      )
      // NOT_FOUND 에러 (code 5) - 인덱스 미생성
      if (
        vectorError &&
        typeof vectorError === "object" &&
        "code" in vectorError &&
        vectorError.code === 5
      ) {
        console.error(
          "Firestore Vector Index가 생성되지 않았습니다. " +
            "gcloud CLI 또는 Firebase Console에서 knowledge_base 컬렉션의 " +
            "embedding_field에 대한 Vector Index를 생성해주세요."
        )
      }
    }

    // 4. Construct System Prompt with Context
    const systemPrompt = `You are an AI assistant for a developer's portfolio/resume website.
Your name is "Resume Bot".
Use the following context to answer the user's question.
If the answer is not in the context, politely say you don't know, but try to be helpful based on general knowledge if appropriate, while clarifying it's not in the resume.
Always respond in Korean.

Context:
${contextText}
`

    // 5. Stream Response with data annotations
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Send sources as data part at the start
        if (sources.length > 0) {
          writer.write({ type: "data-sources", id: "sources", data: sources })
        }

        const result = streamText({
          model: vertex("gemini-2.5-pro"),
          system: systemPrompt,
          messages: modelMessages,
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
