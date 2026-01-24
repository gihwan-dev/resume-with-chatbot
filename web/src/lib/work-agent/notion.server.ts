/**
 * Notion API 클라이언트
 * 서버 사이드 전용 - API 토큰 보호
 */

import {
  WorkAgentError,
  type NotionBlock,
  type NotionPage,
  type NotionPageContent,
  type NotionSearchOptions,
  type NotionSearchResult,
} from "./types"

const NOTION_API_VERSION = "2022-06-28"
const NOTION_BASE_URL = "https://api.notion.com/v1"
const MAX_BLOCK_DEPTH = 3

function getNotionToken(): string {
  const token = import.meta.env.NOTION_API_TOKEN
  if (!token) {
    throw new WorkAgentError(
      "NOTION_API_TOKEN is not configured",
      "INVALID_CONFIG"
    )
  }
  return token
}

function getHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${getNotionToken()}`,
    "Notion-Version": NOTION_API_VERSION,
    "Content-Type": "application/json",
  }
}

async function notionFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${NOTION_BASE_URL}${endpoint}`

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
      let errorMessage = `Notion API error: ${response.status}`

      try {
        const errorJson = JSON.parse(errorBody)
        errorMessage = errorJson.message || errorMessage
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
        "NOTION_API_ERROR",
        response.status
      )
    }

    return response.json()
  } catch (error) {
    if (error instanceof WorkAgentError) {
      throw error
    }
    throw new WorkAgentError(
      `Failed to fetch from Notion: ${error instanceof Error ? error.message : "Unknown error"}`,
      "NOTION_API_ERROR",
      undefined,
      error
    )
  }
}

/**
 * Notion 페이지 제목 추출
 */
function extractPageTitle(page: NotionApiPage): string {
  const properties = page.properties

  // title 타입 속성 찾기
  for (const key of Object.keys(properties)) {
    const prop = properties[key]
    if (prop.type === "title" && prop.title && prop.title.length > 0) {
      return prop.title.map((t) => t.plain_text).join("")
    }
  }

  // Name 속성 시도
  const nameProp = properties.Name
  if (nameProp?.title && nameProp.title.length > 0) {
    return nameProp.title.map((t) => t.plain_text).join("")
  }

  return "Untitled"
}

/**
 * Notion 블록 콘텐츠 추출
 */
function extractBlockContent(block: NotionApiBlock): string {
  const type = block.type
  const blockData = block[type] as NotionBlockData | undefined

  if (!blockData) return ""

  // rich_text 기반 블록 처리
  if (blockData.rich_text) {
    return blockData.rich_text
      .map((t: { plain_text: string }) => t.plain_text)
      .join("")
  }

  // 특수 블록 타입 처리
  switch (type) {
    case "child_page":
      return `[Page: ${blockData.title || ""}]`
    case "child_database":
      return `[Database: ${blockData.title || ""}]`
    case "image":
      return "[Image]"
    case "video":
      return "[Video]"
    case "file":
      return "[File]"
    case "pdf":
      return "[PDF]"
    case "bookmark":
      return `[Bookmark: ${blockData.url || ""}]`
    case "embed":
      return `[Embed: ${blockData.url || ""}]`
    case "equation":
      return blockData.expression || ""
    case "divider":
      return "---"
    case "table_of_contents":
      return "[Table of Contents]"
    case "breadcrumb":
      return "[Breadcrumb]"
    default:
      return ""
  }
}

/**
 * 모든 블록을 재귀적으로 가져오기
 */
async function fetchAllBlocks(
  blockId: string,
  depth: number = 0
): Promise<NotionBlock[]> {
  if (depth >= MAX_BLOCK_DEPTH) {
    return []
  }

  const blocks: NotionBlock[] = []
  let cursor: string | undefined

  do {
    const endpoint = `/blocks/${blockId}/children${cursor ? `?start_cursor=${cursor}` : ""}`
    const response = await notionFetch<NotionApiBlocksResponse>(endpoint)

    for (const block of response.results) {
      const notionBlock: NotionBlock = {
        id: block.id,
        type: block.type,
        content: extractBlockContent(block),
        hasChildren: block.has_children,
      }

      if (block.has_children && depth < MAX_BLOCK_DEPTH - 1) {
        notionBlock.children = await fetchAllBlocks(block.id, depth + 1)
      }

      blocks.push(notionBlock)
    }

    cursor = response.has_more ? response.next_cursor : undefined
  } while (cursor)

  return blocks
}

/**
 * Notion 페이지 검색
 */
export async function searchNotionPages(
  options: NotionSearchOptions
): Promise<NotionSearchResult> {
  const { query, pageSize = 10, startCursor } = options

  const body: Record<string, unknown> = {
    query,
    filter: {
      value: "page",
      property: "object",
    },
    page_size: pageSize,
  }

  if (startCursor) {
    body.start_cursor = startCursor
  }

  const response = await notionFetch<NotionApiSearchResponse>("/search", {
    method: "POST",
    body: JSON.stringify(body),
  })

  const pages: NotionPage[] = response.results.map((page) => ({
    id: page.id,
    title: extractPageTitle(page),
    url: page.url,
    createdTime: page.created_time,
    lastEditedTime: page.last_edited_time,
    parentType: page.parent.type as NotionPage["parentType"],
    parentId:
      page.parent.database_id || page.parent.page_id || page.parent.workspace,
  }))

  return {
    pages,
    hasMore: response.has_more,
    nextCursor: response.next_cursor,
  }
}

/**
 * Notion 페이지 콘텐츠 조회
 */
export async function getNotionPageContent(
  pageId: string
): Promise<NotionPageContent> {
  // 페이지 정보 가져오기
  const page = await notionFetch<NotionApiPage>(`/pages/${pageId}`)

  // 블록 콘텐츠 가져오기
  const blocks = await fetchAllBlocks(pageId)

  return {
    page: {
      id: page.id,
      title: extractPageTitle(page),
      url: page.url,
      createdTime: page.created_time,
      lastEditedTime: page.last_edited_time,
      parentType: page.parent.type as NotionPage["parentType"],
      parentId:
        page.parent.database_id || page.parent.page_id || page.parent.workspace,
    },
    blocks,
  }
}

// Notion API 응답 타입 (내부 사용)
interface NotionApiPage {
  id: string
  url: string
  created_time: string
  last_edited_time: string
  parent: {
    type: string
    database_id?: string
    page_id?: string
    workspace?: string
  }
  properties: Record<
    string,
    {
      type: string
      title?: Array<{ plain_text: string }>
    }
  >
}

interface NotionBlockData {
  rich_text?: Array<{ plain_text: string }>
  title?: string
  url?: string
  expression?: string
}

interface NotionApiBlock {
  id: string
  type: string
  has_children: boolean
  [key: string]: unknown
}

interface NotionApiSearchResponse {
  results: NotionApiPage[]
  has_more: boolean
  next_cursor?: string
}

interface NotionApiBlocksResponse {
  results: NotionApiBlock[]
  has_more: boolean
  next_cursor?: string
}
