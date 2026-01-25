/**
 * Work Agent 모듈
 * Notion 및 ClickUp API 클라이언트 제공
 */

// Types
export {
  WorkAgentError,
  type WorkAgentErrorCode,
  type NotionPage,
  type NotionBlock,
  type NotionSearchResult,
  type NotionPageContent,
  type NotionSearchOptions,
  type ClickUpTask,
  type ClickUpDoc,
  type ClickUpTasksResult,
  type ClickUpDocsResult,
  type ClickUpTaskSearchOptions,
  type ClickUpDocSearchOptions,
  // Slim types (토큰 최적화)
  type ClickUpTaskSlim,
  type ClickUpDocSlim,
  type NotionPageSlim,
  type NotionBlockSlim,
  // Source tracking types (출처 검증)
  type SearchContext,
  type AnswerSource,
  type SourceValidationResult,
} from "./types"

// Notion Client
export {
  searchNotionPages,
  getNotionPageContent,
  type NotionPageContentSlim,
} from "./notion.server"

// ClickUp Client
export {
  searchClickUpTasks,
  searchClickUpDocs,
  getClickUpTask,
} from "./clickup.server"

// AI Tools
export {
  searchNotion,
  getNotionPage,
  searchClickUpTasks as searchClickUpTasksTool,
  searchClickUpDocs as searchClickUpDocsTool,
  answer,
  workAgentTools,
  createAnswerTool,
} from "./tools"

// Source Tracker (출처 검증)
export {
  createSearchContext,
  buildSearchContextFromSteps,
  validateSources,
  extractNotionPageIds,
  extractNotionPageId,
  extractClickUpTaskIds,
  extractClickUpDocIds,
} from "./source-tracker"

// TOON Encoder
export {
  encodeArrayResult,
  createFormatHint,
  type FormatType,
  type EncodedResult,
} from "./toon-encoder"

// Prompts (의도 분류, 반복 분석, 동적 프롬프트, 검색 충분성)
export {
  classifyIntent,
  analyzeToolCallPattern,
  buildDynamicSystemPrompt,
  shouldAllowAnswer,
  INTENT_KEYWORDS,
  PERSONA_PROMPTS,
  REFLEXION_PROTOCOL,
  MIN_SEARCH_COUNT,
  type UserIntent,
  type IntentClassification,
  type ToolCallHistory,
  type StepAnalysis,
  type DynamicPromptOptions,
  type SearchSufficiencyCheck,
} from "./prompts"
