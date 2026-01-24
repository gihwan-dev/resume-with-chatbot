/**
 * ClickUp API 클라이언트
 * 서버 사이드 전용 - API 토큰 보호
 */

import {
  WorkAgentError,
  type ClickUpDoc,
  type ClickUpDocSearchOptions,
  type ClickUpDocsResult,
  type ClickUpTask,
  type ClickUpTaskSearchOptions,
  type ClickUpTasksResult,
} from "./types"

const CLICKUP_BASE_URL = "https://api.clickup.com/api/v2"

interface ClickUpConfig {
  apiToken: string
  teamId: string
  workspaceId: string
  userId: string
}

function getClickUpConfig(): ClickUpConfig {
  const apiToken = import.meta.env.CLICKUP_API_TOKEN
  const teamId = import.meta.env.CLICKUP_TEAM_ID
  const workspaceId = import.meta.env.CLICKUP_WORKSPACE_ID
  const userId = import.meta.env.CLICKUP_USER_ID

  if (!apiToken) {
    throw new WorkAgentError(
      "CLICKUP_API_TOKEN is not configured",
      "INVALID_CONFIG"
    )
  }
  if (!teamId) {
    throw new WorkAgentError(
      "CLICKUP_TEAM_ID is not configured",
      "INVALID_CONFIG"
    )
  }
  if (!workspaceId) {
    throw new WorkAgentError(
      "CLICKUP_WORKSPACE_ID is not configured",
      "INVALID_CONFIG"
    )
  }
  if (!userId) {
    throw new WorkAgentError(
      "CLICKUP_USER_ID is not configured",
      "INVALID_CONFIG"
    )
  }

  return { apiToken, teamId, workspaceId, userId }
}

function getHeaders(): Record<string, string> {
  const config = getClickUpConfig()
  return {
    Authorization: config.apiToken,
    "Content-Type": "application/json",
  }
}

async function clickUpFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${CLICKUP_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options?.headers || {}),
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      let errorMessage = `ClickUp API error: ${response.status}`

      try {
        const errorJson = JSON.parse(errorBody)
        errorMessage = errorJson.err || errorJson.error || errorMessage
      } catch {
        // Use default error message
      }

      if (response.status === 401) {
        throw new WorkAgentError(errorMessage, "UNAUTHORIZED", response.status)
      }
      if (response.status === 429) {
        throw new WorkAgentError(errorMessage, "RATE_LIMIT", response.status)
      }
      if (response.status === 404) {
        throw new WorkAgentError(errorMessage, "NOT_FOUND", response.status)
      }

      throw new WorkAgentError(
        errorMessage,
        "CLICKUP_API_ERROR",
        response.status
      )
    }

    return response.json()
  } catch (error) {
    if (error instanceof WorkAgentError) {
      throw error
    }
    throw new WorkAgentError(
      `Failed to fetch from ClickUp: ${error instanceof Error ? error.message : "Unknown error"}`,
      "CLICKUP_API_ERROR",
      undefined,
      error
    )
  }
}

/**
 * API 응답을 ClickUpTask로 변환
 */
function mapApiTaskToClickUpTask(task: ClickUpApiTask): ClickUpTask {
  return {
    id: task.id,
    name: task.name,
    description: task.description || undefined,
    status: {
      status: task.status?.status || "unknown",
      color: task.status?.color || "#808080",
    },
    priority: task.priority
      ? {
          priority: task.priority.priority || "none",
          color: task.priority.color || "#808080",
        }
      : undefined,
    dueDate: task.due_date || undefined,
    startDate: task.start_date || undefined,
    url: task.url,
    dateCreated: task.date_created,
    dateUpdated: task.date_updated,
    listId: task.list?.id || "",
    listName: task.list?.name,
    folderId: task.folder?.id,
    folderName: task.folder?.name,
    spaceId: task.space?.id || "",
    spaceName: task.space?.name,
    assignees: (task.assignees || []).map((a) => ({
      id: a.id,
      username: a.username,
      email: a.email,
    })),
    tags: (task.tags || []).map((t) => ({
      name: t.name,
      tagFg: t.tag_fg,
      tagBg: t.tag_bg,
    })),
  }
}

/**
 * 본인에게 할당된 태스크 검색
 */
export async function searchClickUpTasks(
  options: ClickUpTaskSearchOptions = {}
): Promise<ClickUpTasksResult> {
  const config = getClickUpConfig()
  const { query, statuses, includeCompleted = false, page = 0 } = options

  const params = new URLSearchParams()
  params.append("page", page.toString())
  params.append("assignees[]", config.userId)
  params.append("include_closed", includeCompleted.toString())

  if (statuses && statuses.length > 0) {
    for (const status of statuses) {
      params.append("statuses[]", status)
    }
  }

  // ClickUp API의 경우 query는 서버 사이드 필터링이 제한적이므로
  // 클라이언트 사이드에서 필터링 필요
  const response = await clickUpFetch<ClickUpApiTasksResponse>(
    `/team/${config.teamId}/task?${params.toString()}`
  )

  let tasks = response.tasks.map(mapApiTaskToClickUpTask)

  // 쿼리가 있으면 클라이언트 사이드 필터링
  if (query) {
    const lowerQuery = query.toLowerCase()
    tasks = tasks.filter(
      (task) =>
        task.name.toLowerCase().includes(lowerQuery) ||
        task.description?.toLowerCase().includes(lowerQuery)
    )
  }

  return {
    tasks,
    lastPage: response.last_page ?? tasks.length === 0,
  }
}

/**
 * 본인이 작성한 문서 검색
 */
export async function searchClickUpDocs(
  options: ClickUpDocSearchOptions = {}
): Promise<ClickUpDocsResult> {
  const config = getClickUpConfig()
  const { query, page = 0 } = options

  // ClickUp Docs API 엔드포인트
  // 워크스페이스의 모든 문서 조회
  const response = await clickUpFetch<ClickUpApiDocsResponse>(
    `/workspaces/${config.workspaceId}/docs?page=${page}`
  )

  let docs: ClickUpDoc[] = (response.docs || [])
    .filter((doc) => doc.creator?.id?.toString() === config.userId)
    .map((doc) => ({
      id: doc.id,
      name: doc.name,
      content: doc.content,
      dateCreated: doc.date_created,
      dateUpdated: doc.date_updated,
      creator: {
        id: doc.creator.id,
        username: doc.creator.username,
        email: doc.creator.email,
      },
      workspaceId: config.workspaceId,
      parentId: doc.parent?.id,
    }))

  // 쿼리가 있으면 클라이언트 사이드 필터링
  if (query) {
    const lowerQuery = query.toLowerCase()
    docs = docs.filter(
      (doc) =>
        doc.name.toLowerCase().includes(lowerQuery) ||
        doc.content?.toLowerCase().includes(lowerQuery)
    )
  }

  return {
    docs,
    hasMore: response.has_more ?? false,
  }
}

/**
 * 태스크 상세 조회
 */
export async function getClickUpTask(taskId: string): Promise<ClickUpTask> {
  const response = await clickUpFetch<ClickUpApiTask>(`/task/${taskId}`)
  return mapApiTaskToClickUpTask(response)
}

// ClickUp API 응답 타입 (내부 사용)
interface ClickUpApiTask {
  id: string
  name: string
  description?: string | null
  status?: {
    status: string
    color: string
  }
  priority?: {
    priority: string
    color: string
  } | null
  due_date?: string | null
  start_date?: string | null
  url: string
  date_created: string
  date_updated: string
  list?: {
    id: string
    name?: string
  }
  folder?: {
    id: string
    name?: string
  }
  space?: {
    id: string
    name?: string
  }
  assignees?: Array<{
    id: number
    username: string
    email: string
  }>
  tags?: Array<{
    name: string
    tag_fg: string
    tag_bg: string
  }>
}

interface ClickUpApiTasksResponse {
  tasks: ClickUpApiTask[]
  last_page?: boolean
}

interface ClickUpApiDocsResponse {
  docs?: Array<{
    id: string
    name: string
    content?: string
    date_created: string
    date_updated: string
    creator: {
      id: number
      username: string
      email: string
    }
    parent?: {
      id: string
    }
  }>
  has_more?: boolean
}
