/**
 * Obsidian Vault 서버 모듈
 * 사전 빌드된 vault-data.json에서 문서 카탈로그를 로드하고,
 * 검색 및 문서 읽기 기능 제공
 *
 * JSON 데이터는 scripts/build-vault.mjs에 의해 빌드 타임에 생성됨
 */

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
 * 문서 키워드 검색
 * 제목, 카테고리, 태그, 요약에서 키워드 매칭 (점수 기반 랭킹)
 */
export function searchDocuments(query: string, limit = 20): ObsidianDocument[] {
  const catalog = getDocumentCatalog()
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0)

  if (tokens.length === 0) return []

  const scored = catalog.map((doc) => {
    let score = 0
    const titleLower = doc.title.toLowerCase()
    const categoryLower = doc.category.toLowerCase()
    const summaryLower = doc.summary.toLowerCase()
    const tagsLower = doc.tags.map((t) => t.toLowerCase())

    for (const token of tokens) {
      if (titleLower.includes(token)) score += 3
      if (categoryLower.includes(token)) score += 2
      if (tagsLower.some((t) => t.includes(token))) score += 2
      if (summaryLower.includes(token)) score += 1
    }

    return { doc, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.doc)
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
