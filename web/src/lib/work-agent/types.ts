/**
 * Work Agent 공통 타입 정의
 */

// Error Types
export type WorkAgentErrorCode =
  | "NOTION_API_ERROR"
  | "CLICKUP_API_ERROR"
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

// Notion Types
export interface NotionPage {
  id: string
  title: string
  url: string
  createdTime: string
  lastEditedTime: string
  parentType: "database" | "page" | "workspace"
  parentId?: string
}

export interface NotionBlock {
  id: string
  type: string
  content: string
  hasChildren: boolean
  children?: NotionBlock[]
}

export interface NotionSearchResult {
  pages: NotionPage[]
  hasMore: boolean
  nextCursor?: string
}

export interface NotionPageContent {
  page: NotionPage
  blocks: NotionBlock[]
}

export interface NotionSearchOptions {
  query: string
  pageSize?: number
  startCursor?: string
}

// ClickUp Types
export interface ClickUpTask {
  id: string
  name: string
  description?: string
  status: {
    status: string
    color: string
  }
  priority?: {
    priority: string
    color: string
  }
  dueDate?: string
  startDate?: string
  url: string
  dateCreated: string
  dateUpdated: string
  listId: string
  listName?: string
  folderId?: string
  folderName?: string
  spaceId: string
  spaceName?: string
  assignees: Array<{
    id: number
    username: string
    email: string
  }>
  tags: Array<{
    name: string
    tagFg: string
    tagBg: string
  }>
}

export interface ClickUpDoc {
  id: string
  name: string
  content?: string
  dateCreated: string
  dateUpdated: string
  creator: {
    id: number
  }
  workspaceId: string
  parentId?: string
}

export interface ClickUpTasksResult {
  tasks: ClickUpTask[]
  lastPage: boolean
}

export interface ClickUpDocsResult {
  docs: ClickUpDoc[]
  hasMore: boolean
}

export interface ClickUpTaskSearchOptions {
  query?: string
  statuses?: string[]
  includeCompleted?: boolean
  page?: number
}

export interface ClickUpDocSearchOptions {
  query?: string
  page?: number
}

// LLM 전달용 경량 타입 (토큰 최적화)
export interface ClickUpTaskSlim {
  id: string
  name: string
  description?: string
  status: string
  priority?: string
  dueDate?: string
  url: string
  listName?: string
  folderName?: string
  spaceName?: string
  tags: string[]
}

export interface ClickUpDocSlim {
  id: string
  name: string
  content?: string
}

export interface NotionPageSlim {
  id: string
  title: string
  url: string
  lastEditedTime: string
}

export interface NotionBlockSlim {
  type: string
  content: string
  children?: NotionBlockSlim[]
}
