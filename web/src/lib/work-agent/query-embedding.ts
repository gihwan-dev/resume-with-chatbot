/**
 * 쿼리 임베딩 모듈
 * 런타임에 Vertex AI text-embedding-005로 쿼리 벡터화
 * LRU 캐시로 동일 쿼리 반복 시 호출 절약
 */

import { createVertex } from "@ai-sdk/google-vertex"
import type { EmbeddingModel } from "ai"
import { embed } from "ai"

const EMBEDDING_MODEL_ID = "text-embedding-005"
const LRU_MAX_ENTRIES = 100
const QUERY_CHAR_LIMIT = 4000

const cache = new Map<string, number[]>()
let cachedModel: EmbeddingModel | null = null

export async function embedQuery(text: string): Promise<number[]> {
  const normalized = text.trim()
  if (!normalized) throw new Error("embedQuery: empty query")

  const cacheKey =
    normalized.length > QUERY_CHAR_LIMIT ? normalized.slice(0, QUERY_CHAR_LIMIT) : normalized

  const cached = cache.get(cacheKey)
  if (cached) {
    cache.delete(cacheKey)
    cache.set(cacheKey, cached)
    return cached
  }

  const model = getEmbeddingModel()
  const { embedding } = await embed({ model, value: cacheKey })

  if (cache.size >= LRU_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value
    if (oldestKey !== undefined) cache.delete(oldestKey)
  }
  cache.set(cacheKey, embedding)

  return embedding
}

function getEmbeddingModel(): EmbeddingModel {
  if (cachedModel) return cachedModel

  const privateKey = import.meta.env.FIREBASE_PRIVATE_KEY
  const clientEmail = import.meta.env.FIREBASE_CLIENT_EMAIL
  const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error(
      "embedQuery: missing FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, or PUBLIC_FIREBASE_PROJECT_ID"
    )
  }

  const vertex = createVertex({
    project: projectId,
    location: "global",
    googleAuthOptions: {
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
    },
  })

  cachedModel = vertex.textEmbeddingModel(EMBEDDING_MODEL_ID)
  return cachedModel
}

export function resetQueryEmbeddingCache(): void {
  cache.clear()
  cachedModel = null
}
