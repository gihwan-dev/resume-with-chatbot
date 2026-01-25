/**
 * Source Tracker Tests
 * ID 추출 및 출처 검증 유틸리티 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { encode } from "@toon-format/toon"
import {
  createSearchContext,
  extractNotionPageIds,
  extractNotionPageId,
  extractClickUpTaskIds,
  extractClickUpDocIds,
  buildSearchContextFromSteps,
  validateSources,
} from "../../../src/lib/work-agent/source-tracker"
import type { SearchContext, AnswerSource } from "../../../src/lib/work-agent/types"

describe("source-tracker", () => {
  // ============================================
  // createSearchContext Tests
  // ============================================
  describe("createSearchContext", () => {
    it("빈 SearchContext 생성", () => {
      const context = createSearchContext()
      expect(context.notionPageIds.size).toBe(0)
      expect(context.clickupTaskIds.size).toBe(0)
      expect(context.clickupDocIds.size).toBe(0)
    })
  })

  // ============================================
  // extractNotionPageIds Tests
  // ============================================
  describe("extractNotionPageIds", () => {
    it("JSON 포맷에서 ID 추출", () => {
      const result = {
        success: true,
        data: {
          format: "json" as const,
          pages: [
            { id: "page-1", title: "Page 1", url: "", lastEditedTime: "" },
            { id: "page-2", title: "Page 2", url: "", lastEditedTime: "" },
          ],
        },
      }

      const ids = extractNotionPageIds(result)
      expect(ids).toEqual(["page-1", "page-2"])
    })

    it("TOON 포맷에서 ID 추출", () => {
      const pages = [
        { id: "page-1", title: "Page 1", url: "", lastEditedTime: "" },
        { id: "page-2", title: "Page 2", url: "", lastEditedTime: "" },
      ]
      const result = {
        success: true,
        data: {
          format: "toon" as const,
          pages: encode(pages),
        },
      }

      const ids = extractNotionPageIds(result)
      expect(ids).toEqual(["page-1", "page-2"])
    })

    it("실패 결과에서 빈 배열 반환", () => {
      const result = { success: false, error: { code: "NOT_FOUND" } }
      const ids = extractNotionPageIds(result)
      expect(ids).toEqual([])
    })

    it("null/undefined 입력에서 빈 배열 반환", () => {
      expect(extractNotionPageIds(null)).toEqual([])
      expect(extractNotionPageIds(undefined)).toEqual([])
    })

    it("잘못된 형식에서 빈 배열 반환", () => {
      expect(extractNotionPageIds({ success: true })).toEqual([])
      expect(extractNotionPageIds("string")).toEqual([])
    })
  })

  // ============================================
  // extractNotionPageId Tests
  // ============================================
  describe("extractNotionPageId", () => {
    it("getNotionPage 결과에서 ID 추출", () => {
      const result = {
        success: true,
        data: {
          page: { id: "page-123", title: "Test Page", url: "", lastEditedTime: "" },
          content: "...",
        },
      }

      const id = extractNotionPageId(result)
      expect(id).toBe("page-123")
    })

    it("실패 결과에서 null 반환", () => {
      const result = { success: false, error: { code: "NOT_FOUND" } }
      const id = extractNotionPageId(result)
      expect(id).toBeNull()
    })

    it("null/undefined 입력에서 null 반환", () => {
      expect(extractNotionPageId(null)).toBeNull()
      expect(extractNotionPageId(undefined)).toBeNull()
    })
  })

  // ============================================
  // extractClickUpTaskIds Tests
  // ============================================
  describe("extractClickUpTaskIds", () => {
    it("JSON 포맷에서 ID 추출", () => {
      const result = {
        success: true,
        data: {
          format: "json" as const,
          tasks: [
            { id: "task-1", name: "Task 1", status: "in progress", context: "unknown" as const, tags: [] },
            { id: "task-2", name: "Task 2", status: "done", context: "unknown" as const, tags: [] },
          ],
        },
      }

      const ids = extractClickUpTaskIds(result)
      expect(ids).toEqual(["task-1", "task-2"])
    })

    it("TOON 포맷에서 ID 추출", () => {
      const tasks = [
        { id: "task-1", name: "Task 1", status: "in progress", context: "unknown" as const, tags: [] },
        { id: "task-2", name: "Task 2", status: "done", context: "unknown" as const, tags: [] },
      ]
      const result = {
        success: true,
        data: {
          format: "toon" as const,
          tasks: encode(tasks),
        },
      }

      const ids = extractClickUpTaskIds(result)
      expect(ids).toEqual(["task-1", "task-2"])
    })

    it("실패 결과에서 빈 배열 반환", () => {
      const result = { success: false, error: { code: "CLICKUP_API_ERROR" } }
      const ids = extractClickUpTaskIds(result)
      expect(ids).toEqual([])
    })
  })

  // ============================================
  // extractClickUpDocIds Tests
  // ============================================
  describe("extractClickUpDocIds", () => {
    it("JSON 포맷에서 ID 추출", () => {
      const result = {
        success: true,
        data: {
          format: "json" as const,
          docs: [
            { id: "doc-1", name: "Doc 1" },
            { id: "doc-2", name: "Doc 2" },
          ],
        },
      }

      const ids = extractClickUpDocIds(result)
      expect(ids).toEqual(["doc-1", "doc-2"])
    })

    it("TOON 포맷에서 ID 추출", () => {
      const docs = [
        { id: "doc-1", name: "Doc 1" },
        { id: "doc-2", name: "Doc 2" },
      ]
      const result = {
        success: true,
        data: {
          format: "toon" as const,
          docs: encode(docs),
        },
      }

      const ids = extractClickUpDocIds(result)
      expect(ids).toEqual(["doc-1", "doc-2"])
    })

    it("실패 결과에서 빈 배열 반환", () => {
      const result = { success: false, error: { code: "CLICKUP_API_ERROR" } }
      const ids = extractClickUpDocIds(result)
      expect(ids).toEqual([])
    })
  })

  // ============================================
  // buildSearchContextFromSteps Tests
  // ============================================
  describe("buildSearchContextFromSteps", () => {
    it("여러 step에서 ID 누적", () => {
      const steps = [
        {
          toolResults: [
            {
              toolName: "searchNotion",
              result: {
                success: true,
                data: {
                  format: "json" as const,
                  pages: [{ id: "page-1", title: "P1", url: "", lastEditedTime: "" }],
                },
              },
            },
          ],
        },
        {
          toolResults: [
            {
              toolName: "getNotionPage",
              result: {
                success: true,
                data: { page: { id: "page-2", title: "P2", url: "", lastEditedTime: "" } },
              },
            },
            {
              toolName: "searchClickUpTasks",
              result: {
                success: true,
                data: {
                  format: "json" as const,
                  tasks: [{ id: "task-1", name: "T1", status: "done", context: "unknown" as const, tags: [] }],
                },
              },
            },
          ],
        },
        {
          toolResults: [
            {
              toolName: "searchClickUpDocs",
              result: {
                success: true,
                data: {
                  format: "json" as const,
                  docs: [{ id: "doc-1", name: "D1" }],
                },
              },
            },
          ],
        },
      ]

      const context = buildSearchContextFromSteps(steps)

      expect(context.notionPageIds.has("page-1")).toBe(true)
      expect(context.notionPageIds.has("page-2")).toBe(true)
      expect(context.clickupTaskIds.has("task-1")).toBe(true)
      expect(context.clickupDocIds.has("doc-1")).toBe(true)
    })

    it("빈 steps에서 빈 context 반환", () => {
      const context = buildSearchContextFromSteps([])
      expect(context.notionPageIds.size).toBe(0)
      expect(context.clickupTaskIds.size).toBe(0)
      expect(context.clickupDocIds.size).toBe(0)
    })

    it("toolResults 없는 step 처리", () => {
      const steps = [{ text: "some text" }]
      const context = buildSearchContextFromSteps(steps as any)
      expect(context.notionPageIds.size).toBe(0)
    })

    it("중복 ID 자동 제거 (Set)", () => {
      const steps = [
        {
          toolResults: [
            {
              toolName: "searchNotion",
              result: {
                success: true,
                data: {
                  format: "json" as const,
                  pages: [
                    { id: "page-1", title: "P1", url: "", lastEditedTime: "" },
                    { id: "page-1", title: "P1 Dup", url: "", lastEditedTime: "" },
                  ],
                },
              },
            },
          ],
        },
        {
          toolResults: [
            {
              toolName: "getNotionPage",
              result: {
                success: true,
                data: { page: { id: "page-1", title: "P1 Detail", url: "", lastEditedTime: "" } },
              },
            },
          ],
        },
      ]

      const context = buildSearchContextFromSteps(steps)
      expect(context.notionPageIds.size).toBe(1)
      expect(context.notionPageIds.has("page-1")).toBe(true)
    })
  })

  // ============================================
  // validateSources Tests
  // ============================================
  describe("validateSources", () => {
    const baseContext: SearchContext = {
      notionPageIds: new Set(["notion-1", "notion-2"]),
      clickupTaskIds: new Set(["task-1", "task-2"]),
      clickupDocIds: new Set(["doc-1"]),
    }

    it("유효한 출처 모두 통과", () => {
      const sources: AnswerSource[] = [
        { type: "notion", title: "Notion Page", id: "notion-1" },
        { type: "clickup_task", title: "Task", id: "task-1" },
        { type: "clickup_doc", title: "Doc", id: "doc-1" },
        { type: "resume", title: "이력서" },
      ]

      const result = validateSources(sources, baseContext)

      expect(result.isValid).toBe(true)
      expect(result.validSources).toHaveLength(4)
      expect(result.invalidSources).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
    })

    it("resume 타입은 ID 없이도 유효", () => {
      const sources: AnswerSource[] = [
        { type: "resume", title: "이력서 기본 정보" },
      ]

      const result = validateSources(sources, baseContext)

      expect(result.isValid).toBe(true)
      expect(result.validSources).toHaveLength(1)
      expect(result.warnings).toHaveLength(0)
    })

    it("ID 없는 notion/clickup 출처 → 경고 추가, 유효로 처리", () => {
      const sources: AnswerSource[] = [
        { type: "notion", title: "ID 없는 페이지" },
      ]

      const result = validateSources(sources, baseContext)

      expect(result.isValid).toBe(true)
      expect(result.validSources).toHaveLength(1)
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0]).toContain("ID가 없습니다")
    })

    it("검색되지 않은 ID → 무효, 경고 생성", () => {
      const sources: AnswerSource[] = [
        { type: "notion", title: "가짜 페이지", id: "fake-notion-id" },
        { type: "clickup_task", title: "가짜 태스크", id: "fake-task-id" },
      ]

      const result = validateSources(sources, baseContext)

      expect(result.isValid).toBe(false)
      expect(result.validSources).toHaveLength(0)
      expect(result.invalidSources).toHaveLength(2)
      expect(result.warnings).toHaveLength(2)
      expect(result.warnings[0]).toContain("검색 결과에 존재하지 않습니다")
    })

    it("혼합: 유효/무효 출처 분류", () => {
      const sources: AnswerSource[] = [
        { type: "notion", title: "유효한 페이지", id: "notion-1" },
        { type: "notion", title: "무효한 페이지", id: "invalid-id" },
        { type: "resume", title: "이력서" },
        { type: "clickup_task", title: "ID 없는 태스크" },
      ]

      const result = validateSources(sources, baseContext)

      expect(result.isValid).toBe(false)
      expect(result.validSources).toHaveLength(3) // notion-1, resume, ID없는태스크
      expect(result.invalidSources).toHaveLength(1) // invalid-id
      expect(result.warnings).toHaveLength(2) // ID없음 경고 + 무효 ID 경고
    })

    it("빈 출처 배열 → 유효", () => {
      const result = validateSources([], baseContext)

      expect(result.isValid).toBe(true)
      expect(result.validSources).toHaveLength(0)
      expect(result.invalidSources).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
    })

    it("빈 context에서 ID 있는 출처 → 무효", () => {
      const emptyContext = createSearchContext()
      const sources: AnswerSource[] = [
        { type: "notion", title: "페이지", id: "some-id" },
      ]

      const result = validateSources(sources, emptyContext)

      expect(result.isValid).toBe(false)
      expect(result.invalidSources).toHaveLength(1)
    })
  })
})
