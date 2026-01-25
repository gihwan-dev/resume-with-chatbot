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
} from "./tools"

// TOON Encoder
export {
  encodeArrayResult,
  createFormatHint,
  type FormatType,
  type EncodedResult,
} from "./toon-encoder"
