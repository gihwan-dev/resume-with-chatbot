/**
 * Work Agent 모듈
 * Notion 및 ClickUp API 클라이언트 제공
 */

// ClickUp Client
export {
  getClickUpTask,
  searchClickUpDocs,
  searchClickUpTasks,
} from "./clickup.server"

// Notion Client
export {
  getNotionPageContent,
  type NotionPageContentSlim,
  searchNotionPages,
} from "./notion.server"
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
  validateSources,
} from "./source-tracker"
// AI Tools
export {
  answer,
  createAnswerTool,
  getNotionPage,
  searchClickUpDocs as searchClickUpDocsTool,
  searchClickUpTasks as searchClickUpTasksTool,
  searchNotion,
  workAgentTools,
} from "./tools"

// TOON Encoder
export {
  createFormatHint,
  type EncodedResult,
  encodeArrayResult,
  type FormatType,
} from "./toon-encoder"
// Types
export {
  type AnswerSource,
  type ClickUpDoc,
  type ClickUpDocSearchOptions,
  type ClickUpDocSlim,
  type ClickUpDocsResult,
  type ClickUpTask,
  type ClickUpTaskSearchOptions,
  // Slim types (토큰 최적화)
  type ClickUpTaskSlim,
  type ClickUpTasksResult,
  type NotionBlock,
  type NotionBlockSlim,
  type NotionPage,
  type NotionPageContent,
  type NotionPageSlim,
  type NotionSearchOptions,
  type NotionSearchResult,
  // Source tracking types (출처 검증)
  type SearchContext,
  type SourceValidationResult,
  WorkAgentError,
  type WorkAgentErrorCode,
} from "./types"
