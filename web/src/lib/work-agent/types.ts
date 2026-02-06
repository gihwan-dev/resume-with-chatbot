/**
 * Work Agent 공통 타입 정의
 * Obsidian 볼트 기반 아키텍처
 */

// Error Types
export type WorkAgentErrorCode =
  | "VAULT_ERROR"
  | "INVALID_CONFIG"
  | "RATE_LIMIT"
  | "NOT_FOUND"
  | "UNAUTHORIZED"

export class WorkAgentError extends Error {
  constructor(
    message: string,
    public code: WorkAgentErrorCode,
    public status?: number,
    public cause?: unknown
  ) {
    super(message)
    this.name = "WorkAgentError"
  }
}

// Obsidian Document Types
export interface ObsidianDocument {
  id: string
  title: string
  category: string
  path: string
  summary: string
  tags: string[]
}

export interface ObsidianDocumentContent {
  document: ObsidianDocument
  content: string
}

// 검색 결과 추적 컨텍스트
export interface SearchContext {
  obsidianDocIds: Set<string>
}

// answer 도구 출처 타입
export interface AnswerSource {
  type: "obsidian" | "resume"
  title: string
  id?: string
}

// 출처 검증 결과
export interface SourceValidationResult {
  isValid: boolean
  validSources: AnswerSource[]
  invalidSources: AnswerSource[]
  warnings: string[]
}
