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
import {
  searchNotionPages,
  getNotionPageContent,
} from "../../../src/lib/work-agent/notion.server"
import {
  searchClickUpTasks as searchClickUpTasksApi,
  searchClickUpDocs as searchClickUpDocsApi,
} from "../../../src/lib/work-agent/clickup.server"

// 테스트 대상 import
import {
  searchNotion,
  getNotionPage,
  searchClickUpTasks,
  searchClickUpDocs,
  answer,
  answerSchema,
  inferProjectContext,
  calculateTimeContext,
  calculateRelativeTime,
  createAnswerTool,
} from "../../../src/lib/work-agent/tools"
import type { SearchContext } from "../../../src/lib/work-agent/types"

// 타입 캐스팅
const mockSearchNotionPages = searchNotionPages as ReturnType<typeof vi.fn>
const mockGetNotionPageContent = getNotionPageContent as ReturnType<typeof vi.fn>
const mockSearchClickUpTasks = searchClickUpTasksApi as ReturnType<typeof vi.fn>
const mockSearchClickUpDocs = searchClickUpDocsApi as ReturnType<typeof vi.fn>

// 테스트용 컨텍스트
const testContext = {
  toolCallId: "test-call",
  messages: [],
  abortSignal: new AbortController().signal,
}

describe("Work Agent Tools", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================
  // searchNotion Tests
  // ============================================
  describe("searchNotion", () => {
    it("성공: 검색 결과 반환 (10개 미만 JSON 포맷)", async () => {
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

      const result = await searchNotion.execute!(
        { query: "테스트" },
        testContext
      )

      expect(result).toEqual({
        success: true,
        data: {
          format: "json",
          formatHint: undefined,
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

    it("성공: 10개 이상 결과 TOON 포맷 적용", async () => {
      const pages = Array.from({ length: 12 }, (_, i) => ({
        id: `page-${i + 1}`,
        title: `페이지 ${i + 1}`,
        url: `https://notion.so/page-${i + 1}`,
        createdTime: "2024-01-01T00:00:00.000Z",
        lastEditedTime: "2024-01-02T00:00:00.000Z",
        parentType: "workspace" as const,
      }))

      mockSearchNotionPages.mockResolvedValue({
        pages,
        hasMore: true,
      })

      const result = (await searchNotion.execute!(
        { query: "테스트" },
        testContext
      )) as { success: true; data: { format: string; formatHint: string } }

      expect(result.success).toBe(true)
      expect(result.data.format).toBe("toon")
      expect(result.data.formatHint).toBe(
        "Data in TOON format. Parse comma-separated values per row."
      )
    })

    it("에러: RATE_LIMIT → retryable: true", async () => {
      mockSearchNotionPages.mockRejectedValue(
        new WorkAgentError("Rate limit exceeded", "RATE_LIMIT", 429)
      )

      const result = await searchNotion.execute!(
        { query: "테스트" },
        testContext
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

      const result = await searchNotion.execute!(
        { query: "테스트" },
        testContext
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
    it("성공: 페이지 콘텐츠 반환 (createdTime 제외)", async () => {
      mockGetNotionPageContent.mockResolvedValue({
        page: {
          id: "page-1",
          title: "테스트 페이지",
          url: "https://notion.so/page-1",
          lastEditedTime: "2024-01-02T00:00:00.000Z",
        },
        blocks: [
          {
            type: "paragraph",
            content: "첫 번째 문단입니다.",
          },
          {
            type: "paragraph",
            content: "두 번째 문단입니다.",
          },
        ],
      })

      const result = await getNotionPage.execute!(
        { pageId: "page-1" },
        testContext
      )

      expect(result).toEqual({
        success: true,
        data: {
          page: {
            id: "page-1",
            title: "테스트 페이지",
            url: "https://notion.so/page-1",
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
          lastEditedTime: "2024-01-02T00:00:00.000Z",
        },
        blocks: [
          {
            type: "toggle",
            content: "토글 블록",
            children: [
              {
                type: "paragraph",
                content: "중첩된 내용",
              },
            ],
          },
        ],
      })

      const result = (await getNotionPage.execute!(
        { pageId: "page-1" },
        testContext
      )) as { success: true; data: { content: string } }

      expect(result.success).toBe(true)
      expect(result.data.content).toBe("토글 블록\n  중첩된 내용")
    })

    it("에러: NOT_FOUND", async () => {
      mockGetNotionPageContent.mockRejectedValue(
        new WorkAgentError("Page not found", "NOT_FOUND", 404)
      )

      const result = await getNotionPage.execute!(
        { pageId: "non-existent" },
        testContext
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
    it("성공: 태스크 목록 반환 (10개 미만 JSON 포맷)", async () => {
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

      const result = await searchClickUpTasks.execute!(
        { query: "버그", statuses: "in progress" },
        testContext
      )

      expect(result).toEqual({
        success: true,
        data: {
          format: "json",
          formatHint: undefined,
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
              context: "unknown", // Development/Backend → 키워드 없음
              dateUpdated: undefined,
              timeContext: undefined,
              relativeTime: undefined,
            },
          ],
          totalFound: 1,
          lastPage: true,
        },
      })
    })

    it("성공: 10개 이상 결과 TOON 포맷 적용", async () => {
      const tasks = Array.from({ length: 15 }, (_, i) => ({
        id: `task-${i + 1}`,
        name: `태스크 ${i + 1}`,
        description: `설명 ${i + 1}`,
        status: { status: "in progress", color: "#4194f6" },
        priority: { priority: "normal", color: "#ccc" },
        dueDate: "2024-01-15",
        url: `https://app.clickup.com/t/task-${i + 1}`,
        listName: "Sprint 1",
        folderName: "Backend",
        spaceName: "Development",
        tags: [],
      }))

      mockSearchClickUpTasks.mockResolvedValue({
        tasks,
        lastPage: false,
      })

      const result = (await searchClickUpTasks.execute!(
        { query: "태스크" },
        testContext
      )) as { success: true; data: { format: string; formatHint: string } }

      expect(result.success).toBe(true)
      expect(result.data.format).toBe("toon")
      expect(result.data.formatHint).toBe(
        "Data in TOON format. Parse comma-separated values per row."
      )
    })

    it("성공: 빈 파라미터로 호출", async () => {
      mockSearchClickUpTasks.mockResolvedValue({
        tasks: [],
        lastPage: true,
      })

      const result = (await searchClickUpTasks.execute!(
        {},
        testContext
      )) as { success: true; data: { format: string } }

      expect(result.success).toBe(true)
      expect(result.data.format).toBe("json")
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

      const result = await searchClickUpTasks.execute!(
        { query: "테스트" },
        testContext
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
    it("성공: 문서 목록 반환 (dateCreated/dateUpdated 제거)", async () => {
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

      const result = await searchClickUpDocs.execute!(
        { query: "API" },
        testContext
      )

      expect(result).toEqual({
        success: true,
        data: {
          format: "json",
          formatHint: undefined,
          docs: [
            {
              id: "doc-1",
              name: "API 설계 문서",
              content: "REST API 엔드포인트 설계",
              // 환각 방지용 시간 맥락 필드 (parseInt가 ISO 문자열에서 2024만 추출 → 사실상 epoch)
              dateUpdated: "2024-01-02T00:00:00.000Z",
              timeContext: "archive",
              relativeTime: expect.stringMatching(/\d+년 전 수정/),
            },
          ],
          totalFound: 1,
          hasMore: false,
        },
      })
    })

    it("성공: content 전체 전달 (truncate 제거)", async () => {
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

      const result = (await searchClickUpDocs.execute!(
        { query: "문서" },
        testContext
      )) as { success: true; data: { docs: { content?: string }[] } }

      expect(result.success).toBe(true)
      // 전체 내용 전달 (truncate 제거됨)
      expect(result.data.docs[0].content).toBe(longContent)
      expect(result.data.docs[0].content?.length).toBe(600)
    })

    it("성공: 10개 이상 결과 TOON 포맷 적용", async () => {
      const docs = Array.from({ length: 10 }, (_, i) => ({
        id: `doc-${i + 1}`,
        name: `문서 ${i + 1}`,
        content: `내용 ${i + 1}`,
        dateCreated: "2024-01-01T00:00:00.000Z",
        dateUpdated: "2024-01-02T00:00:00.000Z",
        creator: { id: 1, username: "user1", email: "user1@example.com" },
        workspaceId: "workspace-1",
      }))

      mockSearchClickUpDocs.mockResolvedValue({
        docs,
        hasMore: true,
      })

      const result = (await searchClickUpDocs.execute!(
        { query: "문서" },
        testContext
      )) as { success: true; data: { format: string; formatHint: string } }

      expect(result.success).toBe(true)
      expect(result.data.format).toBe("toon")
      expect(result.data.formatHint).toBe(
        "Data in TOON format. Parse comma-separated values per row."
      )
    })

    it("에러: INVALID_CONFIG", async () => {
      mockSearchClickUpDocs.mockRejectedValue(
        new WorkAgentError("Invalid configuration", "INVALID_CONFIG")
      )

      const result = await searchClickUpDocs.execute!(
        { query: "테스트" },
        testContext
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

      const result = await searchNotion.execute!(
        { query: "테스트" },
        testContext
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

      const result = await searchNotion.execute!(
        { query: "테스트" },
        testContext
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

  // ============================================
  // answer Tool Tests
  // ============================================
  describe("answer", () => {
    it("스키마 검증: 유효한 입력 파싱", () => {
      const validInput = {
        answer: "테스트 답변입니다.",
        sources: [{ type: "notion", title: "테스트 페이지", id: "page-1" }],
        confidence: "high",
      }
      const result = answerSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("스키마 검증: id 없는 source도 유효", () => {
      const validInput = {
        answer: "테스트 답변입니다.",
        sources: [{ type: "resume", title: "이력서 정보" }],
        confidence: "medium",
      }
      const result = answerSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("스키마 검증: 잘못된 confidence 거부", () => {
      const invalidInput = {
        answer: "테스트",
        sources: [],
        confidence: "invalid",
      }
      const result = answerSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("스키마 검증: 잘못된 source type 거부", () => {
      const invalidInput = {
        answer: "테스트",
        sources: [{ type: "invalid_type", title: "테스트" }],
        confidence: "high",
      }
      const result = answerSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it("execute 함수 존재 확인", () => {
      expect(answer.execute).toBeDefined()
    })

    it("execute 함수가 입력을 그대로 반환", async () => {
      const input = {
        answer: "테스트 답변",
        sources: [{ type: "resume" as const, title: "이력서" }],
        confidence: "high" as const,
      }
      const result = await answer.execute!(input, testContext)
      expect(result).toEqual(input)
    })
  })

  // ============================================
  // Phase 6: 환각 방지 유틸리티 함수 테스트
  // ============================================
  describe("inferProjectContext", () => {
    it("FE1팀 키워드 → legacy", () => {
      expect(inferProjectContext("FE1팀", "Task")).toBe("legacy")
      expect(inferProjectContext("", "FE1")).toBe("legacy")
      expect(inferProjectContext("MaxGauge", "")).toBe("legacy")
    })

    it("차세대 키워드 → next-gen", () => {
      expect(inferProjectContext("차세대", "Task")).toBe("next-gen")
      expect(inferProjectContext("", "DataGrid")).toBe("next-gen")
      expect(inferProjectContext("디자인시스템", "")).toBe("next-gen")
      expect(inferProjectContext("Dashboard", "")).toBe("next-gen")
    })

    it("키워드 없음 → unknown", () => {
      expect(inferProjectContext("Development", "Sprint")).toBe("unknown")
      expect(inferProjectContext(undefined, undefined)).toBe("unknown")
    })

    it("레거시+차세대 둘 다 매칭되면 → unknown", () => {
      expect(inferProjectContext("FE1팀", "차세대")).toBe("unknown")
    })

    it("대소문자 구분 없이 매칭", () => {
      expect(inferProjectContext("MAXGAUGE", "")).toBe("legacy")
      expect(inferProjectContext("DATAGRID", "")).toBe("next-gen")
    })
  })

  describe("calculateTimeContext", () => {
    it("3개월 미만 → recent", () => {
      const twoMonthsAgo = Date.now() - 60 * 24 * 60 * 60 * 1000
      expect(calculateTimeContext(twoMonthsAgo.toString())).toBe("recent")
    })

    it("3개월~12개월 → older", () => {
      const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000
      expect(calculateTimeContext(sixMonthsAgo.toString())).toBe("older")
    })

    it("12개월 이상 → archive", () => {
      const twoYearsAgo = Date.now() - 730 * 24 * 60 * 60 * 1000
      expect(calculateTimeContext(twoYearsAgo.toString())).toBe("archive")
    })

    it("undefined → undefined", () => {
      expect(calculateTimeContext(undefined)).toBeUndefined()
    })
  })

  describe("calculateRelativeTime", () => {
    it("오늘 → 오늘 수정", () => {
      const now = Date.now().toString()
      expect(calculateRelativeTime(now)).toBe("오늘 수정")
    })

    it("3일 전 → 3일 전 수정", () => {
      const threeDaysAgo = (Date.now() - 3 * 24 * 60 * 60 * 1000).toString()
      expect(calculateRelativeTime(threeDaysAgo)).toBe("3일 전 수정")
    })

    it("2주 전 → 2주 전 수정", () => {
      const twoWeeksAgo = (Date.now() - 14 * 24 * 60 * 60 * 1000).toString()
      expect(calculateRelativeTime(twoWeeksAgo)).toBe("2주 전 수정")
    })

    it("2개월 전 → 2개월 전 수정", () => {
      const twoMonthsAgo = (Date.now() - 60 * 24 * 60 * 60 * 1000).toString()
      expect(calculateRelativeTime(twoMonthsAgo)).toBe("2개월 전 수정")
    })

    it("2년 전 → 2년 전 수정", () => {
      const twoYearsAgo = (Date.now() - 730 * 24 * 60 * 60 * 1000).toString()
      expect(calculateRelativeTime(twoYearsAgo)).toBe("2년 전 수정")
    })

    it("undefined → undefined", () => {
      expect(calculateRelativeTime(undefined)).toBeUndefined()
    })
  })

  // ============================================
  // Phase 6: 검색 결과에 새 필드 포함 테스트
  // ============================================
  describe("searchClickUpTasks - 환각 방지 필드", () => {
    it("레거시 태스크에 context: legacy 포함", async () => {
      mockSearchClickUpTasks.mockResolvedValue({
        tasks: [
          {
            id: "task-1",
            name: "레거시 버그 수정",
            description: "ExtJS 버그 수정",
            status: { status: "in progress", color: "#4194f6" },
            priority: { priority: "high", color: "#f9d900" },
            dueDate: "2024-01-15",
            dateUpdated: Date.now().toString(),
            url: "https://app.clickup.com/t/task-1",
            listName: "Sprint 1",
            folderName: "Task",
            spaceName: "FE1팀",
            tags: [],
          },
        ],
        lastPage: true,
      })

      const result = (await searchClickUpTasks.execute!(
        { query: "버그" },
        testContext
      )) as { success: true; data: { tasks: Array<{ context: string; timeContext: string; relativeTime: string }> } }

      expect(result.success).toBe(true)
      expect(result.data.tasks[0].context).toBe("legacy")
      expect(result.data.tasks[0].timeContext).toBe("recent")
      expect(result.data.tasks[0].relativeTime).toBe("오늘 수정")
    })

    it("차세대 태스크에 context: next-gen 포함", async () => {
      mockSearchClickUpTasks.mockResolvedValue({
        tasks: [
          {
            id: "task-2",
            name: "DataGrid 성능 개선",
            description: "TanStack Virtual 적용",
            status: { status: "in progress", color: "#4194f6" },
            dueDate: "2024-01-20",
            dateUpdated: Date.now().toString(),
            url: "https://app.clickup.com/t/task-2",
            listName: "Sprint 2",
            folderName: "Task",
            spaceName: "차세대",
            tags: [],
          },
        ],
        lastPage: true,
      })

      const result = (await searchClickUpTasks.execute!(
        { query: "DataGrid" },
        testContext
      )) as { success: true; data: { tasks: Array<{ context: string }> } }

      expect(result.success).toBe(true)
      expect(result.data.tasks[0].context).toBe("next-gen")
    })
  })

  describe("searchClickUpDocs - 시간 맥락 필드", () => {
    it("문서에 timeContext, relativeTime 포함", async () => {
      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000
      mockSearchClickUpDocs.mockResolvedValue({
        docs: [
          {
            id: "doc-1",
            name: "API 설계 문서",
            content: "REST API 설계",
            dateCreated: "2024-01-01T00:00:00.000Z",
            dateUpdated: twoWeeksAgo.toString(),
            creator: { id: 1, username: "user1", email: "user1@example.com" },
            workspaceId: "workspace-1",
          },
        ],
        hasMore: false,
      })

      const result = (await searchClickUpDocs.execute!(
        { query: "API" },
        testContext
      )) as { success: true; data: { docs: Array<{ dateUpdated: string; timeContext: string; relativeTime: string }> } }

      expect(result.success).toBe(true)
      expect(result.data.docs[0].dateUpdated).toBe(twoWeeksAgo.toString())
      expect(result.data.docs[0].timeContext).toBe("recent")
      expect(result.data.docs[0].relativeTime).toBe("2주 전 수정")
    })
  })

  // ============================================
  // createAnswerTool Tests (출처 검증)
  // ============================================
  describe("createAnswerTool", () => {
    const mockSearchContext: SearchContext = {
      notionPageIds: new Set(["notion-1", "notion-2"]),
      clickupTaskIds: new Set(["task-1"]),
      clickupDocIds: new Set(["doc-1"]),
    }

    // createAnswerTool 결과 타입
    type AnswerToolResult = {
      answer: string
      sources: Array<{ type: string; title: string; id?: string }>
      confidence: string
      validation: {
        isValid: boolean
        warnings: string[]
        invalidSourceCount: number
      }
    }

    it("유효한 출처로 응답 시 validation.isValid = true", async () => {
      const answerTool = createAnswerTool(() => mockSearchContext)
      const input = {
        answer: "테스트 답변",
        sources: [
          { type: "notion" as const, title: "Notion 페이지", id: "notion-1" },
          { type: "resume" as const, title: "이력서" },
        ],
        confidence: "high" as const,
      }

      const result = await answerTool.execute!(input, testContext) as AnswerToolResult

      expect(result.answer).toBe("테스트 답변")
      expect(result.confidence).toBe("high")
      expect(result.validation.isValid).toBe(true)
      expect(result.validation.warnings).toHaveLength(0)
      expect(result.validation.invalidSourceCount).toBe(0)
      expect(result.sources).toHaveLength(2)
    })

    it("무효한 ID 출처 → validation.isValid = false, validSources에서 제외", async () => {
      const answerTool = createAnswerTool(() => mockSearchContext)
      const input = {
        answer: "테스트 답변",
        sources: [
          { type: "notion" as const, title: "유효한 페이지", id: "notion-1" },
          { type: "notion" as const, title: "환각 페이지", id: "fake-id" },
        ],
        confidence: "medium" as const,
      }

      const result = await answerTool.execute!(input, testContext) as AnswerToolResult

      expect(result.validation.isValid).toBe(false)
      expect(result.validation.invalidSourceCount).toBe(1)
      expect(result.validation.warnings).toHaveLength(1)
      expect(result.validation.warnings[0]).toContain("검색 결과에 존재하지 않습니다")
      expect(result.sources).toHaveLength(1) // 유효한 것만 포함
      expect(result.sources[0].id).toBe("notion-1")
    })

    it("ID 없는 출처 → 경고 추가, 유효로 처리", async () => {
      const answerTool = createAnswerTool(() => mockSearchContext)
      const input = {
        answer: "테스트 답변",
        sources: [
          { type: "clickup_task" as const, title: "ID 없는 태스크" },
        ],
        confidence: "low" as const,
      }

      const result = await answerTool.execute!(input, testContext) as AnswerToolResult

      expect(result.validation.isValid).toBe(true)
      expect(result.validation.warnings).toHaveLength(1)
      expect(result.validation.warnings[0]).toContain("ID가 없습니다")
      expect(result.sources).toHaveLength(1)
    })

    it("resume 타입은 ID 검증 없이 항상 유효", async () => {
      const emptyContext: SearchContext = {
        notionPageIds: new Set(),
        clickupTaskIds: new Set(),
        clickupDocIds: new Set(),
      }
      const answerTool = createAnswerTool(() => emptyContext)
      const input = {
        answer: "이력서 기반 답변",
        sources: [
          { type: "resume" as const, title: "이력서 기본 정보" },
        ],
        confidence: "high" as const,
      }

      const result = await answerTool.execute!(input, testContext) as AnswerToolResult

      expect(result.validation.isValid).toBe(true)
      expect(result.validation.warnings).toHaveLength(0)
      expect(result.sources).toHaveLength(1)
    })

    it("동적 SearchContext 업데이트 반영", async () => {
      let dynamicContext: SearchContext = {
        notionPageIds: new Set(),
        clickupTaskIds: new Set(),
        clickupDocIds: new Set(),
      }
      const answerTool = createAnswerTool(() => dynamicContext)

      // 첫 번째 호출: context 비어있음 → 무효
      const input = {
        answer: "테스트",
        sources: [{ type: "notion" as const, title: "페이지", id: "page-1" }],
        confidence: "high" as const,
      }

      const result1 = await answerTool.execute!(input, testContext) as AnswerToolResult
      expect(result1.validation.isValid).toBe(false)

      // context 업데이트
      dynamicContext = {
        notionPageIds: new Set(["page-1"]),
        clickupTaskIds: new Set(),
        clickupDocIds: new Set(),
      }

      // 두 번째 호출: context에 ID 있음 → 유효
      const result2 = await answerTool.execute!(input, testContext) as AnswerToolResult
      expect(result2.validation.isValid).toBe(true)
    })
  })
})
