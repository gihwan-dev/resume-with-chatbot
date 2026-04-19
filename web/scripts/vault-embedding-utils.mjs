import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"

const EMBED_INPUT_CHAR_LIMIT = 8000
const DEFAULT_BATCH_SIZE = 100
const RETRY_DELAYS_MS = [1000, 2000, 4000]

export function computeContentHash(doc) {
  return crypto.createHash("sha1").update(`${doc.title}\n${doc.content}`).digest("hex")
}

export function buildEmbeddingInput(doc) {
  const body =
    doc.content.length > EMBED_INPUT_CHAR_LIMIT
      ? doc.content.slice(0, EMBED_INPUT_CHAR_LIMIT)
      : doc.content
  return `${doc.title}\n\n${body}`
}

export function loadEmbeddingCache(cachePath) {
  try {
    const raw = fs.readFileSync(cachePath, "utf-8")
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === "object") return parsed
  } catch {
    // 파일 없음/손상은 캐시 미스로 처리
  }
  return {}
}

export function saveEmbeddingCache(cachePath, cache) {
  fs.mkdirSync(path.dirname(cachePath), { recursive: true })
  fs.writeFileSync(cachePath, JSON.stringify(cache))
}

export function normalizeVector(vector) {
  let norm = 0
  for (const value of vector) norm += value * value
  norm = Math.sqrt(norm)
  if (norm === 0) return vector.slice()
  const normalized = new Array(vector.length)
  for (let i = 0; i < vector.length; i++) normalized[i] = vector[i] / norm
  return normalized
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function embedBatchWithRetry(values, embedMany, model) {
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const { embeddings } = await embedMany({ model, values })
      return embeddings
    } catch (error) {
      if (attempt === RETRY_DELAYS_MS.length) {
        throw error
      }
      const delay = RETRY_DELAYS_MS[attempt]
      console.warn(
        `[embedding] Batch failed (attempt ${attempt + 1}/${RETRY_DELAYS_MS.length + 1}): ${
          error?.message ?? error
        }. Retrying in ${delay}ms.`
      )
      await sleep(delay)
    }
  }
  throw new Error("embedBatchWithRetry exhausted")
}

export async function generateEmbeddings({
  documents,
  cache,
  embedMany,
  model,
  batchSize = DEFAULT_BATCH_SIZE,
}) {
  const results = new Map()
  const freshCache = { ...cache }
  const pending = []

  for (const doc of documents) {
    const hash = computeContentHash(doc)
    const cached = cache[doc.id]
    if (
      cached &&
      cached.hash === hash &&
      Array.isArray(cached.embedding) &&
      cached.embedding.length > 0
    ) {
      results.set(doc.id, cached.embedding)
      continue
    }
    pending.push({ doc, hash })
  }

  if (pending.length === 0) {
    return { embeddings: results, cache: freshCache, regenerated: 0, failed: 0 }
  }

  let regenerated = 0
  let failed = 0

  for (let i = 0; i < pending.length; i += batchSize) {
    const batch = pending.slice(i, i + batchSize)
    const values = batch.map(({ doc }) => buildEmbeddingInput(doc))
    try {
      const vectors = await embedBatchWithRetry(values, embedMany, model)
      batch.forEach(({ doc, hash }, index) => {
        const vector = vectors[index]
        if (!Array.isArray(vector) || vector.length === 0) {
          failed += 1
          return
        }
        const normalized = normalizeVector(vector)
        results.set(doc.id, normalized)
        freshCache[doc.id] = { hash, embedding: normalized }
        regenerated += 1
      })
    } catch (error) {
      failed += batch.length
      console.error(
        `[embedding] Batch ${i / batchSize + 1} failed permanently: ${
          error?.message ?? error
        }. Affected documents will fall back to BM25-only.`
      )
    }
  }

  return { embeddings: results, cache: freshCache, regenerated, failed }
}
