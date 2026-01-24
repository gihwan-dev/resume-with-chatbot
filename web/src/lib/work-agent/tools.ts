/**
 * Work Agent AI Tools
 * Vercel AI SDK tool() 형태로 래핑된 Notion/ClickUp 도구
 */

import { tool } from "ai"
import { z } from "zod"
import {
  searchClickUpDocs as searchClickUpDocsApi,
  searchClickUpTasks as searchClickUpTasksApi,
} from "./clickup.server"
import { getNotionPageContent, searchNotionPages } from "./notion.server"
import { WorkAgentError, type WorkAgentErrorCode } from "./types"

// 에러 응답 타입
interface ToolErrorResponse {
  success: false
  error: {
    code: WorkAgentErrorCode
    message: string
    retryable: boolean
  }
}

// 에러 코드별 한글 메시지 매핑
const ERROR_MESSAGES: Record<WorkAgentErrorCode, string> = {
  NOTION_API_ERROR: "Notion API 호출 중 오류가 발생했습니다.",
  CLICKUP_API_ERROR: "ClickUp API 호출 중 오류가 발생했습니다.",
  INVALID_CONFIG: "API 설정이 올바르지 않습니다. 환경 변수를 확인해주세요.",
  RATE_LIMIT: "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
  NOT_FOUND: "요청한 리소스를 찾을 수 없습니다.",
  UNAUTHORIZED: "API 인증에 실패했습니다. 토큰을 확인해주세요.",
}

// 재시도 가능한 에러 코드
const RETRYABLE_ERROR_CODES: WorkAgentErrorCode[] = ["RATE_LIMIT"]

/**
 * 에러를 LLM이 이해할 수 있는 구조화된 응답으로 변환
 */
function createErrorResponse(error: unknown): ToolErrorResponse {
  if (error instanceof WorkAgentError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: ERROR_MESSAGES[error.code] || error.message,
        retryable: RETRYABLE_ERROR_CODES.includes(error.code),
      },
    }
  }

  return {
    success: false,
    error: {
      code: "NOTION_API_ERROR",
      message:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
      retryable: false,
    },
  }
}

// 스키마 정의
const searchNotionSchema = z.object({
  query: z.string().describe("검색할 키워드"),
  pageSize: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .describe("반환할 최대 페이지 수 (기본값: 10)"),
})

const getNotionPageSchema = z.object({
  pageId: z.string().describe("조회할 Notion 페이지 ID"),
})

const searchClickUpTasksSchema = z.object({
  query: z
    .string()
    .optional()
    .describe("검색할 키워드 (태스크 이름, 설명에서 검색)"),
  statuses: z
    .string()
    .optional()
    .describe("필터링할 상태 (쉼표로 구분, 예: 'in progress,review')"),
  includeCompleted: z
    .boolean()
    .optional()
    .describe("완료된 태스크 포함 여부 (기본값: false)"),
})

const searchClickUpDocsSchema = z.object({
  query: z
    .string()
    .optional()
    .describe("검색할 키워드 (문서 이름, 내용에서 검색)"),
})

// Type definitions for inferred schemas
type SearchNotionInput = z.infer<typeof searchNotionSchema>
type GetNotionPageInput = z.infer<typeof getNotionPageSchema>
type SearchClickUpTasksInput = z.infer<typeof searchClickUpTasksSchema>
type SearchClickUpDocsInput = z.infer<typeof searchClickUpDocsSchema>

/**
 * Notion 페이지 검색 도구
 * 업무 노트, 프로젝트 기록 등을 검색
 */
export const searchNotion = tool({
  description:
    "Notion에서 페이지를 검색합니다. 업무 노트, 프로젝트 기록, 회의록 등을 찾을 때 사용합니다.",
  inputSchema: searchNotionSchema,
  execute: async (params: SearchNotionInput) => {
    try {
      const result = await searchNotionPages({
        query: params.query,
        pageSize: params.pageSize ?? 10,
      })
      return {
        success: true as const,
        data: {
          pages: result.pages.map((page) => ({
            id: page.id,
            title: page.title,
            url: page.url,
            lastEditedTime: page.lastEditedTime,
          })),
          hasMore: result.hasMore,
          totalFound: result.pages.length,
        },
      }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
})

/**
 * Notion 페이지 상세 조회 도구
 * 특정 페이지의 전체 내용을 가져옴
 */
export const getNotionPage = tool({
  description:
    "Notion 페이지의 상세 내용을 조회합니다. 페이지 ID를 사용하여 전체 콘텐츠를 가져옵니다.",
  inputSchema: getNotionPageSchema,
  execute: async (params: GetNotionPageInput) => {
    try {
      const result = await getNotionPageContent(params.pageId)

      // 블록 콘텐츠를 텍스트로 변환
      const flattenBlocks = (
        blocks: typeof result.blocks,
        depth = 0
      ): string[] => {
        const lines: string[] = []
        const indent = "  ".repeat(depth)

        for (const block of blocks) {
          if (block.content) {
            lines.push(`${indent}${block.content}`)
          }
          if (block.children && block.children.length > 0) {
            lines.push(...flattenBlocks(block.children, depth + 1))
          }
        }

        return lines
      }

      return {
        success: true as const,
        data: {
          page: {
            id: result.page.id,
            title: result.page.title,
            url: result.page.url,
            createdTime: result.page.createdTime,
            lastEditedTime: result.page.lastEditedTime,
          },
          content: flattenBlocks(result.blocks).join("\n"),
          blockCount: result.blocks.length,
        },
      }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
})

/**
 * ClickUp 태스크 검색 도구
 * 본인에게 할당된 태스크를 검색
 */
export const searchClickUpTasks = tool({
  description:
    "ClickUp에서 본인에게 할당된 태스크를 검색합니다. 진행 중인 업무, 완료된 업무 등을 확인할 때 사용합니다.",
  inputSchema: searchClickUpTasksSchema,
  execute: async (params: SearchClickUpTasksInput) => {
    try {
      const statusArray = params.statuses
        ? params.statuses.split(",").map((s) => s.trim())
        : undefined
      const result = await searchClickUpTasksApi({
        query: params.query,
        statuses: statusArray,
        includeCompleted: params.includeCompleted ?? false,
      })
      return {
        success: true as const,
        data: {
          tasks: result.tasks.map((task) => ({
            id: task.id,
            name: task.name,
            description: task.description,
            status: task.status.status,
            priority: task.priority?.priority,
            dueDate: task.dueDate,
            url: task.url,
            listName: task.listName,
            folderName: task.folderName,
            spaceName: task.spaceName,
            tags: task.tags.map((t) => t.name),
          })),
          totalFound: result.tasks.length,
          lastPage: result.lastPage,
        },
      }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
})

/**
 * ClickUp 문서 검색 도구
 * 본인이 작성한 문서를 검색
 */
export const searchClickUpDocs = tool({
  description:
    "ClickUp에서 본인이 작성한 문서를 검색합니다. 기술 문서, 회의록, 프로젝트 문서 등을 찾을 때 사용합니다.",
  inputSchema: searchClickUpDocsSchema,
  execute: async (params: SearchClickUpDocsInput) => {
    try {
      const result = await searchClickUpDocsApi({ query: params.query })
      return {
        success: true as const,
        data: {
          docs: result.docs.map((doc) => ({
            id: doc.id,
            name: doc.name,
            content: doc.content
              ? doc.content.substring(0, 500) +
                (doc.content.length > 500 ? "..." : "")
              : undefined,
            dateCreated: doc.dateCreated,
            dateUpdated: doc.dateUpdated,
          })),
          totalFound: result.docs.length,
          hasMore: result.hasMore,
        },
      }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
})

/**
 * Work Agent 도구 통합 export
 * chat.ts에서 사용
 */
export const workAgentTools = {
  searchNotion,
  getNotionPage,
  searchClickUpTasks,
  searchClickUpDocs,
}
