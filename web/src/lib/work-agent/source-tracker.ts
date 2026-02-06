/**
 * Source Tracker
 * 검색 결과 ID 추적 및 출처 검증 유틸리티
 * Obsidian 볼트 기반 아키텍처
 */

import type { AnswerSource, ObsidianDocument, SearchContext, SourceValidationResult } from "./types"

// Step 타입 (Vercel AI SDK 호환 - 유연한 타입)
interface ToolResultLike {
  toolName: string
  result?: unknown
}

interface StepLike {
  toolResults?: ToolResultLike[]
}

// searchDocuments 결과 타입
interface SearchDocumentsResult {
  success: true
  data: {
    documents: ObsidianDocument[]
  }
}

// readDocument 결과 타입
interface ReadDocumentResult {
  success: true
  data: {
    document: { id: string }
  }
}

/**
 * 빈 SearchContext 생성
 */
export function createSearchContext(): SearchContext {
  return {
    obsidianDocIds: new Set(),
  }
}

/**
 * searchDocuments 결과에서 ID 추출
 */
export function extractDocumentIds(result: unknown): string[] {
  if (!result || typeof result !== "object") return []
  const typedResult = result as { success?: boolean; data?: SearchDocumentsResult["data"] }
  if (!typedResult.success || !typedResult.data?.documents) return []

  return typedResult.data.documents.map((doc) => doc.id)
}

/**
 * readDocument 결과에서 ID 추출
 */
export function extractDocumentId(result: unknown): string | null {
  if (!result || typeof result !== "object") return null
  const typedResult = result as { success?: boolean; data?: ReadDocumentResult["data"] }
  if (!typedResult.success || !typedResult.data?.document?.id) return null
  return typedResult.data.document.id
}

/**
 * 전체 steps에서 SearchContext 구축
 */
export function buildSearchContextFromSteps(steps: StepLike[]): SearchContext {
  const context = createSearchContext()

  for (const step of steps) {
    if (!step.toolResults) continue

    for (const toolResult of step.toolResults) {
      switch (toolResult.toolName) {
        case "searchDocuments": {
          const ids = extractDocumentIds(toolResult.result)
          for (const id of ids) context.obsidianDocIds.add(id)
          break
        }
        case "readDocument": {
          const id = extractDocumentId(toolResult.result)
          if (id) context.obsidianDocIds.add(id)
          break
        }
      }
    }
  }

  return context
}

/**
 * 출처 검증
 * - resume 타입: 항상 유효 (ID 불필요)
 * - ID 없는 출처: 경고 추가, 유효로 처리
 * - 검색된 ID와 일치: 유효
 * - 검색되지 않은 ID: 무효, 경고 생성
 */
export function validateSources(
  sources: AnswerSource[],
  context: SearchContext
): SourceValidationResult {
  const validSources: AnswerSource[] = []
  const invalidSources: AnswerSource[] = []
  const warnings: string[] = []

  for (const source of sources) {
    // resume 타입은 항상 유효
    if (source.type === "resume") {
      validSources.push(source)
      continue
    }

    // ID가 없는 경우
    if (!source.id) {
      warnings.push(
        `출처 "${source.title}" (${source.type})에 ID가 없습니다. 검색 결과의 실제 ID를 포함해주세요.`
      )
      validSources.push(source) // 경고만 추가, 유효로 처리
      continue
    }

    // ID 검증
    const isValidId = context.obsidianDocIds.has(source.id)

    if (isValidId) {
      validSources.push(source)
    } else {
      invalidSources.push(source)
      warnings.push(
        `출처 "${source.title}" (${source.type})의 ID "${source.id}"가 검색 결과에 존재하지 않습니다.`
      )
    }
  }

  return {
    isValid: invalidSources.length === 0,
    validSources,
    invalidSources,
    warnings,
  }
}
