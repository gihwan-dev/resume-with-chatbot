/**
 * Obsidian Vault 서버 모듈
 * 사전 빌드된 vault-data.json에서 문서 카탈로그를 로드하고,
 * 검색 및 문서 읽기 기능 제공
 *
 * JSON 데이터는 scripts/build-vault.mjs에 의해 빌드 타임에 생성됨
 */

import MiniSearch from "minisearch"
import { bfsRelatedNodes, type LinkGraphNode } from "./link-graph"
import { reciprocalRankFusion } from "./rrf"
import type {
  LiveResumeFeedItem,
  ObsidianDocument,
  ObsidianLinkRef,
  RelatedObsidianDocument,
} from "./types"

interface VaultDocument {
  id: string
  title: string
  category: string
  path: string
  summary: string
  tags: string[]
  content: string
  eventDate?: string
  updatedAt?: string
  activityAt?: string
  outLinks?: string[]
  inLinks?: string[]
  imageLinks?: string[]
}

interface VaultData {
  documents: VaultDocument[]
}

type EmbeddingsData = Record<string, number[]>

const GENERATED_VAULT_DATA_KEY = "../../generated/vault-data.json"
const GENERATED_SEARCH_INDEX_KEY = "../../generated/search-index.json"
const GENERATED_EMBEDDINGS_KEY = "../../generated/vault-embeddings.json"
const GENERATED_JSON_MODULES = import.meta.glob("../../generated/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>

function isVaultData(value: unknown): value is VaultData {
  return Boolean(
    value &&
      typeof value === "object" &&
      "documents" in value &&
      Array.isArray((value as { documents?: unknown }).documents)
  )
}

function readGeneratedModule<T>(moduleKey: string, label: string): T | null {
  const moduleValue = GENERATED_JSON_MODULES[moduleKey]
  if (moduleValue !== undefined) {
    return moduleValue as T
  }

  if (import.meta.env.PROD) {
    throw new Error(`[obsidian] Missing generated ${label}: ${moduleKey}`)
  }

  return null
}

// 메타데이터 카탈로그 (content 제외)
let _catalog: ObsidianDocument[] | null = null

// content 맵 (ID → 전체 내용)
let _contentMap: Map<string, VaultDocument> | null = null

// vault 데이터 캐시
let _vaultData: VaultData | null = null

// MiniSearch 인덱스 (레이지 초기화)
let _searchIndex: MiniSearch | null = null

// 임베딩 맵 (ID → unit-normalized vector)
let _embeddingsMap: Map<string, number[]> | null = null

// 문서 카탈로그 인덱스 (ID로 빠른 조회)
let _catalogMap: Map<string, ObsidianDocument> | null = null

const MINISEARCH_OPTIONS = {
  fields: ["title", "category", "tagsText", "summary", "content"],
  storeFields: [
    "title",
    "category",
    "path",
    "summary",
    "tags",
    "eventDate",
    "updatedAt",
    "activityAt",
  ],
}

function getVaultData(): VaultData {
  if (_vaultData) {
    return _vaultData
  }

  const loadedVaultData = readGeneratedModule<unknown>(GENERATED_VAULT_DATA_KEY, "vault data")
  if (!loadedVaultData) {
    _vaultData = { documents: [] }
    return _vaultData
  }

  if (!isVaultData(loadedVaultData)) {
    if (import.meta.env.PROD) {
      throw new Error("[obsidian] Invalid generated vault data shape")
    }

    _vaultData = { documents: [] }
    return _vaultData
  }

  _vaultData = loadedVaultData
  return _vaultData
}

function getSearchIndex(): MiniSearch {
  if (!_searchIndex) {
    const serializedIndex = readGeneratedModule<unknown>(GENERATED_SEARCH_INDEX_KEY, "search index")

    if (!serializedIndex) {
      _searchIndex = new MiniSearch(MINISEARCH_OPTIONS)
      return _searchIndex
    }

    try {
      _searchIndex = MiniSearch.loadJSON(JSON.stringify(serializedIndex), MINISEARCH_OPTIONS)
    } catch {
      if (import.meta.env.PROD) {
        throw new Error("[obsidian] Invalid generated search index")
      }

      _searchIndex = new MiniSearch(MINISEARCH_OPTIONS)
    }
  }
  return _searchIndex
}

function ensureLoaded(): void {
  if (_catalog && _contentMap && _catalogMap) return

  const data = getVaultData()
  _catalog = data.documents.map(({ content: _content, ...meta }) => ({
    id: meta.id,
    title: meta.title,
    category: meta.category,
    path: meta.path,
    summary: meta.summary,
    tags: meta.tags,
    ...(meta.eventDate ? { eventDate: meta.eventDate } : {}),
    ...(meta.updatedAt ? { updatedAt: meta.updatedAt } : {}),
    ...(meta.activityAt ? { activityAt: meta.activityAt } : {}),
  }))
  _contentMap = new Map(data.documents.map((doc) => [doc.id, doc]))
  _catalogMap = new Map(_catalog.map((doc) => [doc.id, doc]))

  console.log(`[obsidian] Catalog loaded: ${_catalog.length} documents`)
}

function getEmbeddingsMap(): Map<string, number[]> {
  if (_embeddingsMap) return _embeddingsMap

  const loadedEmbeddings = readGeneratedModule<unknown>(GENERATED_EMBEDDINGS_KEY, "embeddings")
  const map = new Map<string, number[]>()

  if (!loadedEmbeddings || typeof loadedEmbeddings !== "object") {
    _embeddingsMap = map
    return map
  }

  for (const [id, vector] of Object.entries(loadedEmbeddings as EmbeddingsData)) {
    if (Array.isArray(vector) && vector.length > 0) {
      map.set(id, vector)
    }
  }

  _embeddingsMap = map
  return map
}

/**
 * 문서 카탈로그 반환 (메타데이터만, content 미포함)
 */
export function getDocumentCatalog(): ObsidianDocument[] {
  ensureLoaded()
  return _catalog ?? []
}

/**
 * 카탈로그 캐시 초기화 (테스트용)
 */
export function resetCatalogCache(): void {
  _catalog = null
  _contentMap = null
  _vaultData = null
  _catalogMap = null
}

/**
 * 검색 인덱스 초기화 (테스트용)
 */
export function resetSearchIndex(): void {
  _searchIndex = null
}

/**
 * 임베딩 캐시 초기화 (테스트용)
 */
export function resetEmbeddingsCache(): void {
  _embeddingsMap = null
}

/**
 * 문서 풀텍스트 검색
 * MiniSearch 기반 BM25 스코어링, 퍼지매칭, 접두어 검색 지원
 */
export function searchDocuments(query: string, limit = 20): ObsidianDocument[] {
  const trimmed = query.trim()
  if (trimmed.length === 0) return []
  const safeLimit = Math.max(0, limit)

  const index = getSearchIndex()
  const results = index.search(trimmed, {
    boost: { title: 3, category: 2, tagsText: 2, summary: 1.5, content: 1 },
    prefix: true,
    fuzzy: 0.2,
    combineWith: "OR",
  })

  return results.slice(0, safeLimit).map((result) => {
    const mappedResult: ObsidianDocument = {
      id: result.id as string,
      title: result.title as string,
      category: result.category as string,
      path: result.path as string,
      summary: (result.summary as string) ?? "",
      tags: (result.tags as string[]) ?? [],
    }

    const eventDate = result.eventDate as string | undefined
    const updatedAt = result.updatedAt as string | undefined
    const activityAt = result.activityAt as string | undefined
    if (eventDate) mappedResult.eventDate = eventDate
    if (updatedAt) mappedResult.updatedAt = updatedAt
    if (activityAt) mappedResult.activityAt = activityAt

    return mappedResult
  })
}

/**
 * 문서 ID로 전체 내용 읽기
 */
export function readDocumentContent(docId: string):
  | (ObsidianDocument & {
      content: string
      outLinks: ObsidianLinkRef[]
      inLinks: ObsidianLinkRef[]
    })
  | null {
  ensureLoaded()
  const doc = _contentMap?.get(docId)
  if (!doc) return null
  return {
    id: doc.id,
    title: doc.title,
    category: doc.category,
    path: doc.path,
    summary: doc.summary,
    tags: doc.tags,
    ...(doc.eventDate ? { eventDate: doc.eventDate } : {}),
    ...(doc.updatedAt ? { updatedAt: doc.updatedAt } : {}),
    ...(doc.activityAt ? { activityAt: doc.activityAt } : {}),
    content: doc.content,
    outLinks: toLinkRefs(doc.outLinks ?? []),
    inLinks: toLinkRefs(doc.inLinks ?? []),
  }
}

function toLinkRefs(ids: readonly string[]): ObsidianLinkRef[] {
  ensureLoaded()
  const map = _catalogMap
  if (!map) return []
  const refs: ObsidianLinkRef[] = []
  for (const id of ids) {
    const doc = map.get(id)
    if (doc) refs.push({ id: doc.id, title: doc.title })
  }
  return refs
}

/**
 * 벡터 유사도 기반 의미 검색
 * 빌드 타임에 unit-normalize된 벡터 가정 → dot product만 수행
 */
export function semanticSearch(queryEmbedding: readonly number[], limit = 20): ObsidianDocument[] {
  const safeLimit = Math.max(0, limit)
  if (safeLimit === 0 || queryEmbedding.length === 0) return []

  ensureLoaded()
  const catalog = _catalog
  const catalogMap = _catalogMap
  if (!catalog || !catalogMap) return []

  const embeddings = getEmbeddingsMap()
  if (embeddings.size === 0) return []

  const normalizedQuery = normalizeVector(queryEmbedding)

  const scored: Array<{ doc: ObsidianDocument; score: number }> = []
  for (const [docId, vector] of embeddings) {
    if (vector.length !== normalizedQuery.length) continue
    const doc = catalogMap.get(docId)
    if (!doc) continue
    let score = 0
    for (let i = 0; i < vector.length; i++) score += vector[i] * normalizedQuery[i]
    scored.push({ doc, score })
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, safeLimit).map(({ doc }) => doc)
}

/**
 * BM25 + 벡터 하이브리드 검색 (Reciprocal Rank Fusion)
 */
export function hybridSearch(
  query: string,
  queryEmbedding: readonly number[] | null,
  limit = 20,
  rrfK = 60
): ObsidianDocument[] {
  const bm25Results = searchDocuments(query, Math.max(limit, 30))

  if (!queryEmbedding || queryEmbedding.length === 0) return bm25Results.slice(0, limit)

  const vectorResults = semanticSearch(queryEmbedding, Math.max(limit, 30))
  if (vectorResults.length === 0) return bm25Results.slice(0, limit)

  return reciprocalRankFusion([bm25Results, vectorResults], rrfK, limit)
}

function normalizeVector(vector: readonly number[]): number[] {
  let norm = 0
  for (const value of vector) norm += value * value
  norm = Math.sqrt(norm)
  if (norm === 0) return vector.slice()
  const normalized = new Array<number>(vector.length)
  for (let i = 0; i < vector.length; i++) normalized[i] = vector[i] / norm
  return normalized
}

/**
 * 문서 ID와 연결된 outLinks / inLinks 조회
 */
export function getOutLinks(docId: string): ObsidianLinkRef[] {
  ensureLoaded()
  const doc = _contentMap?.get(docId)
  return doc ? toLinkRefs(doc.outLinks ?? []) : []
}

export function getInLinks(docId: string): ObsidianLinkRef[] {
  ensureLoaded()
  const doc = _contentMap?.get(docId)
  return doc ? toLinkRefs(doc.inLinks ?? []) : []
}

/**
 * BFS로 링크 연결된 관련 문서 탐색
 * depth=1: 직접 연결된 outLinks ∪ inLinks
 * depth=2: 1단계 이웃에서 한 번 더 확장 (원본 제외, 중복은 짧은 distance 유지)
 */
export function findRelatedDocs(docId: string, depth: 1 | 2 = 1): RelatedObsidianDocument[] {
  ensureLoaded()
  const contentMap = _contentMap
  const catalogMap = _catalogMap
  if (!contentMap || !catalogMap || !contentMap.has(docId)) return []

  const graph = new Map<string, LinkGraphNode>()
  for (const [id, doc] of contentMap) {
    graph.set(id, {
      outLinks: doc.outLinks ?? [],
      inLinks: doc.inLinks ?? [],
    })
  }

  const bfsResults = bfsRelatedNodes(docId, graph, depth)
  const results: RelatedObsidianDocument[] = []
  for (const { id, relation, distance } of bfsResults) {
    const doc = catalogMap.get(id)
    if (!doc) continue
    results.push({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      path: doc.path,
      relation,
      distance,
    })
  }

  return results
}

function toActivityTimestamp(activityAt: string | undefined): number | null {
  if (!activityAt) return null
  const parsedTimestamp = Date.parse(activityAt)
  if (Number.isNaN(parsedTimestamp)) return null
  return parsedTimestamp
}

export function buildLiveResumeFeedItems(
  documents: readonly ObsidianDocument[],
  limit = 5
): LiveResumeFeedItem[] {
  const safeLimit = Math.max(0, limit)

  return documents
    .map((doc) => ({
      doc,
      activityTimestamp: toActivityTimestamp(doc.activityAt),
    }))
    .filter(
      (
        item
      ): item is {
        doc: ObsidianDocument
        activityTimestamp: number
      } =>
        Boolean(
          item.activityTimestamp !== null &&
            item.doc.activityAt &&
            item.doc.summary &&
            typeof item.doc.summary === "string" &&
            item.doc.summary.trim().length > 0
        )
    )
    .sort((a, b) => b.activityTimestamp - a.activityTimestamp)
    .slice(0, safeLimit)
    .map(({ doc }) => ({
      id: doc.id,
      title: doc.title,
      activityAt: doc.activityAt as string,
      summary: doc.summary,
      tags: doc.tags,
      promptText: `최근 업데이트 "${doc.title}"에 대해 문제, 해결, 성과를 자세히 설명해줘.`,
    }))
}

export function getLiveResumeFeedItems(limit = 5): LiveResumeFeedItem[] {
  return buildLiveResumeFeedItems(getDocumentCatalog(), limit)
}

/**
 * 시스템 프롬프트용 카탈로그 요약 생성
 * 카테고리별로 문서를 그룹화하여 컴팩트한 요약 생성
 */
export function buildCatalogSummary(): string {
  const catalog = getDocumentCatalog()

  const groups = new Map<string, ObsidianDocument[]>()
  for (const doc of catalog) {
    const existing = groups.get(doc.category) || []
    existing.push(doc)
    groups.set(doc.category, existing)
  }

  const parts: string[] = [`총 ${catalog.length}개 문서가 Obsidian 볼트에 있습니다.\n`]

  const exemDocs = groups.get("Exem")
  if (exemDocs) {
    parts.push("### 업무 기록 (Exem)")
    for (const doc of exemDocs) {
      parts.push(
        `- **${doc.title}** (${doc.path})${doc.summary ? `: ${doc.summary.substring(0, 80)}` : ""}`
      )
    }
    parts.push("")
    groups.delete("Exem")
  }

  parts.push("### 기술 지식 카테고리")
  const sortedCategories = [...groups.entries()].sort((a, b) => b[1].length - a[1].length)
  for (const [category, docs] of sortedCategories) {
    const sampleTitles = docs.slice(0, 5).map((d) => d.title)
    const more = docs.length > 5 ? ` 외 ${docs.length - 5}개` : ""
    parts.push(`- **${category}** (${docs.length}개): ${sampleTitles.join(", ")}${more}`)
  }

  return parts.join("\n")
}
