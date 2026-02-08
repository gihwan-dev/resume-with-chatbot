/**
 * Obsidian Vault 서버 모듈
 * 사전 빌드된 vault-data.json에서 문서 카탈로그를 로드하고,
 * 검색 및 문서 읽기 기능 제공
 *
 * JSON 데이터는 scripts/build-vault.mjs에 의해 빌드 타임에 생성됨
 */

import MiniSearch from "minisearch"
import searchIndexData from "../../generated/search-index.json"
import vaultData from "../../generated/vault-data.json"
import type { ObsidianDocument } from "./types"

interface VaultDocument {
  id: string
  title: string
  category: string
  path: string
  summary: string
  tags: string[]
  content: string
}

interface VaultData {
  documents: VaultDocument[]
}

const data = vaultData as VaultData

// 메타데이터 카탈로그 (content 제외)
let _catalog: ObsidianDocument[] | null = null

// content 맵 (ID → 전체 내용)
let _contentMap: Map<string, VaultDocument> | null = null

// MiniSearch 인덱스 (레이지 초기화)
let _searchIndex: MiniSearch | null = null

const MINISEARCH_OPTIONS = {
  fields: ["title", "category", "tagsText", "summary", "content"],
  storeFields: ["title", "category", "path", "summary", "tags"],
}

function getSearchIndex(): MiniSearch {
  if (!_searchIndex) {
    _searchIndex = MiniSearch.loadJSON(JSON.stringify(searchIndexData), MINISEARCH_OPTIONS)
  }
  return _searchIndex
}

function ensureLoaded(): void {
  if (_catalog && _contentMap) return

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

  const index = getSearchIndex()
  const results = index.search(trimmed, {
    boost: { title: 3, category: 2, tagsText: 2, summary: 1.5, content: 1 },
    prefix: true,
    fuzzy: 0.2,
    combineWith: "OR",
  })

  return results.slice(0, limit).map((result) => ({
    id: result.id as string,
    title: result.title as string,
    category: result.category as string,
    path: result.path as string,
    summary: (result.summary as string) ?? "",
    tags: (result.tags as string[]) ?? [],
  }))
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
