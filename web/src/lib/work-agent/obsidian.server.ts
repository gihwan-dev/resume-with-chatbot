/**
 * Obsidian Vault 서버 모듈
 * 사전 빌드된 vault-data.json에서 문서 카탈로그를 로드하고,
 * 검색 및 문서 읽기 기능 제공
 *
 * JSON 데이터는 scripts/build-vault.mjs에 의해 빌드 타임에 생성됨
 */

import MiniSearch from "minisearch"
import type { LiveResumeFeedItem, ObsidianDocument } from "./types"

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
}

interface VaultData {
  documents: VaultDocument[]
}

const GENERATED_VAULT_DATA_KEY = "../../generated/vault-data.json"
const GENERATED_SEARCH_INDEX_KEY = "../../generated/search-index.json"
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
  if (_catalog && _contentMap) return

  const data = getVaultData()
  _catalog = data.documents.map(({ content: _, ...meta }) => meta)
  _contentMap = new Map(data.documents.map((doc) => [doc.id, doc]))

  console.log(`[obsidian] Catalog loaded: ${_catalog.length} documents`)
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
}

/**
 * 검색 인덱스 초기화 (테스트용)
 */
export function resetSearchIndex(): void {
  _searchIndex = null
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
export function readDocumentContent(
  docId: string
): (ObsidianDocument & { content: string }) | null {
  ensureLoaded()
  const doc = _contentMap?.get(docId)
  if (!doc) return null
  return { ...doc }
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
