/**
 * Work Agent Tools Tests
 * AI 도구들의 성공/실패 케이스 검증
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { WorkAgentError } from "../../../src/lib/work-agent/types"

// API 클라이언트 모킹
vi.mock("../../../src/lib/work-agent/notion.server", () => ({
  searchNotionPages: vi.fn(),
  getNotionPageContent: vi.fn(),
}))

vi.mock("../../../src/lib/work-agent/clickup.server", () => ({
  searchClickUpTasks: vi.fn(),
  searchClickUpDocs: vi.fn(),
}))

// 모킹된 함수 import
import { searchNotionPages, getNotionPageContent } from "../../../src/lib/work-agent/notion.server"
import { searchClickUpTasks as searchClickUpTasksApi, searchClickUpDocs as searchClickUpDocsApi } from "../../../src/lib/work-agent/clickup.server"

// 테스트 대상 import
import {
  searchNotion,
  getNotionPage,
  searchClickUpTasks,
  searchClickUpDocs,
} from "../../../src/lib/work-agent/tools"

// 타입 캐스팅
const mockSearchNotionPages = searchNotionPages as ReturnType<typeof vi.fn>
const mockGetNotionPageContent = getNotionPageContent as ReturnType<typeof vi.fn>
const mockSearchClickUpTasks = searchClickUpTasksApi as ReturnType<typeof vi.fn>
const mockSearchClickUpDocs = searchClickUpDocsApi as ReturnType<typeof vi.fn>

describe("Work Agent Tools", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================
  // searchNotion Tests
  // ============================================
  describe("searchNotion", () => {
    it("성공: 검색 결과 반환", async () => {
      mockSearchNotionPages.mockResolvedValue({
        pages: [
          {
            id: "page-1",
            title: "테스트 페이지",
            url: "https://notion.so/page-1",
            createdTime: "2024-01-01T00:00:00.000Z",
            lastEditedTime: "2024-01-02T00:00:00.000Z",
            parentType: "workspace",
          },
          {
            id: "page-2",
            title: "또 다른 페이지",
            url: "https://notion.so/page-2",
            createdTime: "2024-01-01T00:00:00.000Z",
            lastEditedTime: "2024-01-03T00:00:00.000Z",
            parentType: "database",
          },
        ],
        hasMore: false,
      })

      const result = await searchNotion.execute(
        { query: "테스트" },
        { toolCallId: "test-call", messages: [], abortSignal: new AbortController().signal }
      )

      expect(result).toEqual({
        success: true,
        data: {
          pages: [
            {
              id: "page-1",
              title: "테스트 페이지",
              url: "https://notion.so/page-1",
              lastEditedTime: "2024-01-02T00:00:00.000Z",
            },
            {
              id: "page-2",
              title: "또 다른 페이지",
              url: "https://notion.so/page-2",
              lastEditedTime: "2024-01-03T00:00:00.000Z",
            },
          ],
          hasMore: false,
          totalFound: 2,
        },
      })
      expect(mockSearchNotionPages).toHaveBeenCalledWith({
        query: "테스트",
        pageSize: 10,
      })
    })

    it("에러: RATE_LIMIT → retryable: true", async () => {
      mockSearchNotionPages.mockRejectedValue(
        new WorkAgentError("Rate limit exceeded", "RATE_LIMIT", 429)
      )

      const result = await searchNotion.execute(
        { query: "테스트" },
        { toolCallId: "test-call", messages: [], abortSignal: new AbortController().signal }
      )

      expect(result).toEqual({
        success: false,
        error: {
          code: "RATE_LIMIT",
          message: "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
          retryable: true,
        },
      })
    })

    it("에러: UNAUTHORIZED → retryable: false", async () => {
      mockSearchNotionPages.mockRejectedValue(
        new WorkAgentError("Unauthorized", "UNAUTHORIZED", 401)
      )

      const result = await searchNotion.execute(
        { query: "테스트" },
        { toolCallId: "test-call", messages: [], abortSignal: new AbortController().signal }
      )

      expect(result).toEqual({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "API 인증에 실패했습니다. 토큰을 확인해주세요.",
          retryable: false,
        },
      })
    })
  })

  // ============================================
  // getNotionPage Tests
  // ============================================
  describe("getNotionPage", () => {
    it("성공: 페이지 콘텐츠 반환", async () => {
      mockGetNotionPageContent.mockResolvedValue({
        page: {
          id: "page-1",
          title: "테스트 페이지",
          url: "https://notion.so/page-1",
          createdTime: "2024-01-01T00:00:00.000Z",
          lastEditedTime: "2024-01-02T00:00:00.000Z",
          parentType: "workspace",
        },
        blocks: [
          {
            id: "block-1",
            type: "paragraph",
            content: "첫 번째 문단입니다.",
            hasChildren: false,
          },
          {
            id: "block-2",
            type: "paragraph",
            content: "두 번째 문단입니다.",
            hasChildren: false,
          },
        ],
      })

      const result = await getNotionPage.execute(
        { pageId: "page-1" },
        { toolCallId: "test-call", messages: [], abortSignal: new AbortController().signal }
      )

      expect(result).toEqual({
        success: true,
        data: {
          page: {
            id: "page-1",
            title: "테스트 페이지",
            url: "https://notion.so/page-1",
            createdTime: "2024-01-01T00:00:00.000Z",
            lastEditedTime: "2024-01-02T00:00:00.000Z",
          },
          content: "첫 번째 문단입니다.\n두 번째 문단입니다.",
          blockCount: 2,
        },
      })
    })

    it("성공: 중첩 블록 flatten", async () => {
      mockGetNotionPageContent.mockResolvedValue({
        page: {
          id: "page-1",
          title: "중첩 테스트",
          url: "https://notion.so/page-1",
          createdTime: "2024-01-01T00:00:00.000Z",
          lastEditedTime: "2024-01-02T00:00:00.000Z",
          parentType: "workspace",
        },
        blocks: [
          {
            id: "block-1",
            type: "toggle",
            content: "토글 블록",
            hasChildren: true,
            children: [
              {
                id: "block-1-1",
                type: "paragraph",
                content: "중첩된 내용",
                hasChildren: false,
              },
            ],
          },
        ],
      })

      const result = await getNotionPage.execute(
        { pageId: "page-1" },
        { toolCallId: "test-call", messages: [], abortSignal: new AbortController().signal }
      )

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.content).toBe("토글 블록\n  중첩된 내용")
      }
    })

    it("에러: NOT_FOUND", async () => {
      mockGetNotionPageContent.mockRejectedValue(
        new WorkAgentError("Page not found", "NOT_FOUND", 404)
      )

      const result = await getNotionPage.execute(
        { pageId: "non-existent" },
        { toolCallId: "test-call", messages: [], abortSignal: new AbortController().signal }
      )

      expect(result).toEqual({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "요청한 리소스를 찾을 수 없습니다.",
          retryable: false,
        },
      })
    })
  })

  // ============================================
  // searchClickUpTasks Tests
  // ============================================
  describe("searchClickUpTasks", () => {
    it("성공: 태스크 목록 반환", async () => {
      mockSearchClickUpTasks.mockResolvedValue({
        tasks: [
          {
            id: "task-1",
            name: "버그 수정",
            description: "로그인 버그 수정",
            status: { status: "in progress", color: "#4194f6" },
            priority: { priority: "high", color: "#f9d900" },
            dueDate: "2024-01-15",
            url: "https://app.clickup.com/t/task-1",
            listName: "Sprint 1",
            folderName: "Backend",
            spaceName: "Development",
            tags: [{ name: "bug", tagFg: "#fff", tagBg: "#ff0000" }],
          },
        ],
        lastPage: true,
      })

      const result = await searchClickUpTasks.execute(
        { query: "버그", statuses: ["in progress"] },
        { toolCallId: "test-call", messages: [], abortSignal: new AbortController().signal }
      )

      expect(result).toEqual({
        success: true,
        data: {
          tasks: [
            {
              id: "task-1",
              name: "버그 수정",
              description: "로그인 버그 수정",
              status: "in progress",
              priority: "high",
              dueDate: "2024-01-15",
              url: "https://app.clickup.com/t/task-1",
              listName: "Sprint 1",
              folderName: "Backend",
              spaceName: "Development",
              tags: ["bug"],
            },
          ],
          totalFound: 1,
          lastPage: true,
        },
      })
    })

    it("성공: 빈 파라미터로 호출", async () => {
      mockSearchClickUpTasks.mockResolvedValue({
        tasks: [],
        lastPage: true,
      })

      const result = await searchClickUpTasks.execute(
        {},
        { toolCallId: "test-call", messages: [], abortSignal: new AbortController().signal }
      )

      expect(result.success).toBe(true)
      expect(mockSearchClickUpTasks).toHaveBeenCalledWith({
        query: undefined,
        statuses: undefined,
        includeCompleted: false,
      })
    })

    it("에러: CLICKUP_API_ERROR", async () => {
      mockSearchClickUpTasks.mockRejectedValue(
        new WorkAgentError("ClickUp API error", "CLICKUP_API_ERROR", 500)
      )

      const result = await searchClickUpTasks.execute(
        { query: "테스트" },
        { toolCallId: "test-call", messages: [], abortSignal: new AbortController().signal }
      )

      expect(result).toEqual({
        success: false,
        error: {
          code: "CLICKUP_API_ERROR",
          message: "ClickUp API 호출 중 오류가 발생했습니다.",
          retryable: false,
        },
      })
    })
  })

  // ============================================
  // searchClickUpDocs Tests
  // ============================================
  describe("searchClickUpDocs", () => {
    it("성공: 문서 목록 반환", async () => {
      mockSearchClickUpDocs.mockResolvedValue({
        docs: [
          {
            id: "doc-1",
            name: "API 설계 문서",
            content: "REST API 엔드포인트 설계",
            dateCreated: "2024-01-01T00:00:00.000Z",
            dateUpdated: "2024-01-02T00:00:00.000Z",
            creator: { id: 1, username: "user1", email: "user1@example.com" },
            workspaceId: "workspace-1",
          },
        ],
        hasMore: false,
      })

      const result = await searchClickUpDocs.execute(
        { query: "API" },
        { toolCallId: "test-call", messages: [], abortSignal: new AbortController().signal }
      )

      expect(result).toEqual({
        success: true,
        data: {
          docs: [
            {
              id: "doc-1",
              name: "API 설계 문서",
              content: "REST API 엔드포인트 설계",
              dateCreated: "2024-01-01T00:00:00.000Z",
              dateUpdated: "2024-01-02T00:00:00.000Z",
            },
          ],
          totalFound: 1,
          hasMore: false,
        },
      })
    })

    it("성공: content 500자 truncate 확인", async () => {
      const longContent = "a".repeat(600)

      mockSearchClickUpDocs.mockResolvedValue({
        docs: [
          {
            id: "doc-1",
            name: "긴 문서",
            content: longContent,
            dateCreated: "2024-01-01T00:00:00.000Z",
            dateUpdated: "2024-01-02T00:00:00.000Z",
            creator: { id: 1, username: "user1", email: "user1@example.com" },
            workspaceId: "workspace-1",
          },
        ],
        hasMore: false,
      })

      const result = await searchClickUpDocs.execute(
        { query: "문서" },
        { toolCallId: "test-call", messages: [], abortSignal: new AbortController().signal }
      )

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.docs[0].content).toBe("a".repeat(500) + "...")
        expect(result.data.docs[0].content?.length).toBe(503) // 500 + "..."
      }
    })

    it("에러: INVALID_CONFIG", async () => {
      mockSearchClickUpDocs.mockRejectedValue(
        new WorkAgentError("Invalid configuration", "INVALID_CONFIG")
      )

      const result = await searchClickUpDocs.execute(
        { query: "테스트" },
        { toolCallId: "test-call", messages: [], abortSignal: new AbortController().signal }
      )

      expect(result).toEqual({
        success: false,
        error: {
          code: "INVALID_CONFIG",
          message: "API 설정이 올바르지 않습니다. 환경 변수를 확인해주세요.",
          retryable: false,
        },
      })
    })
  })

  // ============================================
  // createErrorResponse Tests (일반 Error 케이스)
  // ============================================
  describe("createErrorResponse (일반 Error)", () => {
    it("일반 Error 객체 처리", async () => {
      mockSearchNotionPages.mockRejectedValue(new Error("Network error"))

      const result = await searchNotion.execute(
        { query: "테스트" },
        { toolCallId: "test-call", messages: [], abortSignal: new AbortController().signal }
      )

      expect(result).toEqual({
        success: false,
        error: {
          code: "NOTION_API_ERROR",
          message: "Network error",
          retryable: false,
        },
      })
    })

    it("unknown 에러 처리", async () => {
      mockSearchNotionPages.mockRejectedValue("string error")

      const result = await searchNotion.execute(
        { query: "테스트" },
        { toolCallId: "test-call", messages: [], abortSignal: new AbortController().signal }
      )

      expect(result).toEqual({
        success: false,
        error: {
          code: "NOTION_API_ERROR",
          message: "알 수 없는 오류가 발생했습니다.",
          retryable: false,
        },
      })
    })
  })
})
