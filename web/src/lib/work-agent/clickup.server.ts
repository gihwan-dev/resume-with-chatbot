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

const CLICKUP_V2_BASE_URL = "https://api.clickup.com/api/v2"
const CLICKUP_V3_BASE_URL = "https://api.clickup.com/api/v3"

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
  options?: RequestInit,
  useV3 = false
): Promise<T> {
  const baseUrl = useV3 ? CLICKUP_V3_BASE_URL : CLICKUP_V2_BASE_URL
  const url = `${baseUrl}${endpoint}`

  console.log("[ClickUp API] Request:", {
    url,
    method: options?.method || "GET",
    version: useV3 ? "v3" : "v2",
  })

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

      console.error("[ClickUp API] Error:", {
        status: response.status,
        body: errorBody,
        url,
      })

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

    const data = await response.json()
    console.log("[ClickUp API] Success:", {
      url,
      resultCount:
        Array.isArray(data) ? data.length : data.tasks?.length ?? data.docs?.length ?? "N/A",
    })

    return data
  } catch (error) {
    if (error instanceof WorkAgentError) {
      throw error
    }
    console.error("[ClickUp API] Network error:", {
      url,
      error: error instanceof Error ? error.message : "Unknown error",
    })
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
    // 검색어를 공백으로 분리하여 토큰화
    const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean)

    tasks = tasks.filter((task) => {
      const searchText = `${task.name} ${task.description || ''}`.toLowerCase()
      // 모든 토큰이 포함되어야 매칭 (AND 조건)
      return queryTokens.every((token) => searchText.includes(token))
    })
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

  // ClickUp Docs API 엔드포인트 (v3 API 사용)
  // 워크스페이스의 모든 문서 조회
  const response = await clickUpFetch<ClickUpApiDocsResponse>(
    `/workspaces/${config.workspaceId}/docs?page=${page}`,
    undefined,
    true // Use v3 API for Docs
  )

  // 디버깅: 워크스페이스의 모든 creator ID 확인
  const allCreatorIds = [...new Set((response.docs || []).map((doc) => doc.creator))]
  console.log("[ClickUp Docs] Creator ID 목록:", {
    configUserId: config.userId,
    uniqueCreatorIds: allCreatorIds,
    matchCount: (response.docs || []).filter((doc) => String(doc.creator) === config.userId).length,
    totalDocs: (response.docs || []).length,
  })

  // 본인이 작성한 문서만 필터링 (V3 API에서 creator는 숫자 ID)
  let docs: ClickUpDoc[] = (response.docs || [])
    .filter((doc) => String(doc.creator) === config.userId)
    .map((doc) => ({
      id: doc.id,
      name: doc.name,
      content: doc.content,
      dateCreated: doc.date_created,
      dateUpdated: doc.date_updated,
      creator: {
        id: doc.creator,
      },
      workspaceId: config.workspaceId,
      parentId: doc.parent?.id,
    }))

  // 쿼리가 있으면 클라이언트 사이드 필터링
  if (query) {
    // 검색어를 공백으로 분리하여 토큰화
    const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean)

    docs = docs.filter((doc) => {
      const searchText = `${doc.name} ${doc.content || ''}`.toLowerCase()
      // 모든 토큰이 포함되어야 매칭 (AND 조건)
      return queryTokens.every((token) => searchText.includes(token))
    })
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
    creator: number // V3 API는 creator ID를 숫자로 직접 반환
    parent?: {
      id: string
    }
  }>
  has_more?: boolean
}
