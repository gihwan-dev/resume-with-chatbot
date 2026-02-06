/**
 * Work Agent 모듈
 * Obsidian 볼트 기반 문서 검색 및 에이전트 도구 제공
 */

// Obsidian Vault Client
export {
  buildCatalogSummary,
  getDocumentCatalog,
  readDocumentContent,
  searchDocuments,
} from "./obsidian.server"
// Prompts (의도 분류, 반복 분석, 동적 프롬프트, 검색 충분성)
export {
  analyzeToolCallPattern,
  buildDynamicSystemPrompt,
  classifyIntent,
  type DynamicPromptOptions,
  INTENT_KEYWORDS,
  type IntentClassification,
  MIN_SEARCH_COUNT,
  PERSONA_PROMPTS,
  REFLEXION_PROTOCOL,
  type SearchSufficiencyCheck,
  type StepAnalysis,
  shouldAllowAnswer,
  type ToolCallHistory,
  type UserIntent,
} from "./prompts"
// Source Tracker (출처 검증)
export {
  buildSearchContextFromSteps,
  createSearchContext,
  extractDocumentId,
  extractDocumentIds,
  validateSources,
} from "./source-tracker"
// AI Tools
export {
  answer,
  createAnswerTool,
  readDocument,
  searchDocuments as searchDocumentsTool,
  workAgentTools,
} from "./tools"
// Types
export {
  type AnswerSource,
  type ObsidianDocument,
  type ObsidianDocumentContent,
  type SearchContext,
  type SourceValidationResult,
  WorkAgentError,
  type WorkAgentErrorCode,
} from "./types"
