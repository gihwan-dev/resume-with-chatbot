/**
 * Source Tracker
 * 검색 결과 ID 추적 및 출처 검증 유틸리티
 */

import { decode } from "@toon-format/toon"
import type {
  AnswerSource,
  ClickUpDocSlim,
  ClickUpTaskSlim,
  NotionPageSlim,
  SearchContext,
  SourceValidationResult,
} from "./types"

// Tool result 타입 정의
interface SearchNotionResult {
  success: true
  data: {
    format: "json" | "toon"
    pages: string | NotionPageSlim[]
  }
}

interface GetNotionPageResult {
  success: true
  data: {
    page: { id: string }
  }
}

interface SearchClickUpTasksResult {
  success: true
  data: {
    format: "json" | "toon"
    tasks: string | ClickUpTaskSlim[]
  }
}

interface SearchClickUpDocsResult {
  success: true
  data: {
    format: "json" | "toon"
    docs: string | ClickUpDocSlim[]
  }
}

// Step 타입 (Vercel AI SDK 호환 - 유연한 타입)
interface ToolResultLike {
  toolName: string
  result?: unknown
}

interface StepLike {
  toolResults?: ToolResultLike[]
}

/**
 * 빈 SearchContext 생성
 */
export function createSearchContext(): SearchContext {
  return {
    notionPageIds: new Set(),
    clickupTaskIds: new Set(),
    clickupDocIds: new Set(),
  }
}

/**
 * TOON 또는 JSON 데이터에서 ID 추출
 */
function extractIdsFromData<T extends { id: string }>(
  data: string | T[],
  format: "json" | "toon"
): string[] {
  try {
    if (format === "json") {
      return (data as T[]).map((item) => item.id)
    }
    // TOON 디코딩
    const decoded = decode(data as string) as T[]
    return decoded.map((item) => item.id)
  } catch (error) {
    console.warn("[source-tracker] Failed to extract IDs:", error)
    return []
  }
}

/**
 * searchNotion 결과에서 ID 추출
 */
export function extractNotionPageIds(result: unknown): string[] {
  if (!result || typeof result !== "object") return []
  const typedResult = result as { success?: boolean; data?: SearchNotionResult["data"] }
  if (!typedResult.success || !typedResult.data) return []

  const { format, pages } = typedResult.data
  return extractIdsFromData(pages, format)
}

/**
 * getNotionPage 결과에서 ID 추출
 */
export function extractNotionPageId(result: unknown): string | null {
  if (!result || typeof result !== "object") return null
  const typedResult = result as { success?: boolean; data?: GetNotionPageResult["data"] }
  if (!typedResult.success || !typedResult.data?.page?.id) return null
  return typedResult.data.page.id
}

/**
 * searchClickUpTasks 결과에서 ID 추출
 */
export function extractClickUpTaskIds(result: unknown): string[] {
  if (!result || typeof result !== "object") return []
  const typedResult = result as { success?: boolean; data?: SearchClickUpTasksResult["data"] }
  if (!typedResult.success || !typedResult.data) return []

  const { format, tasks } = typedResult.data
  return extractIdsFromData(tasks, format)
}

/**
 * searchClickUpDocs 결과에서 ID 추출
 */
export function extractClickUpDocIds(result: unknown): string[] {
  if (!result || typeof result !== "object") return []
  const typedResult = result as { success?: boolean; data?: SearchClickUpDocsResult["data"] }
  if (!typedResult.success || !typedResult.data) return []

  const { format, docs } = typedResult.data
  return extractIdsFromData(docs, format)
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
        case "searchNotion": {
          const ids = extractNotionPageIds(toolResult.result)
          ids.forEach((id) => context.notionPageIds.add(id))
          break
        }
        case "getNotionPage": {
          const id = extractNotionPageId(toolResult.result)
          if (id) context.notionPageIds.add(id)
          break
        }
        case "searchClickUpTasks": {
          const ids = extractClickUpTaskIds(toolResult.result)
          ids.forEach((id) => context.clickupTaskIds.add(id))
          break
        }
        case "searchClickUpDocs": {
          const ids = extractClickUpDocIds(toolResult.result)
          ids.forEach((id) => context.clickupDocIds.add(id))
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
    let isValidId = false
    switch (source.type) {
      case "notion":
        isValidId = context.notionPageIds.has(source.id)
        break
      case "clickup_task":
        isValidId = context.clickupTaskIds.has(source.id)
        break
      case "clickup_doc":
        isValidId = context.clickupDocIds.has(source.id)
        break
    }

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
