/**
 * Work Agent Tools Tests
 * Obsidian 볼트 도구 성공/실패 케이스 검증
 */

import { beforeEach, describe, expect, it, vi } from "vitest"
import { WorkAgentError } from "../../../src/lib/work-agent/types"

// Obsidian 서버 모킹
vi.mock("../../../src/lib/work-agent/obsidian.server", () => ({
  searchDocuments: vi.fn(),
  readDocumentContent: vi.fn(),
}))

import {
  readDocumentContent,
  searchDocuments as searchDocumentsLocal,
} from "../../../src/lib/work-agent/obsidian.server"

import {
  answer,
  answerSchema,
  createAnswerTool,
  readDocument,
  searchDocuments,
} from "../../../src/lib/work-agent/tools"
import type { SearchContext } from "../../../src/lib/work-agent/types"

const mockSearchDocuments = searchDocumentsLocal as ReturnType<typeof vi.fn>
const mockReadDocumentContent = readDocumentContent as ReturnType<typeof vi.fn>

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
  // searchDocuments Tests
  // ============================================
  describe("searchDocuments", () => {
    it("성공: 검색 결과 반환", async () => {
      mockSearchDocuments.mockReturnValue([
        {
          id: "React.js--useRef",
          title: "useRef",
          category: "React.js",
          path: "React.js/useRef.md",
          summary: "useRef 훅에 대한 설명",
          tags: ["React.js"],
        },
        {
          id: "React.js--useState",
          title: "useState",
          category: "React.js",
          path: "React.js/useState.md",
          summary: "useState 훅에 대한 설명",
          tags: ["React.js"],
        },
      ])

      const result = await searchDocuments.execute?.({ query: "React" }, testContext)

      expect(result).toEqual({
        success: true,
        data: {
          documents: [
            {
              id: "React.js--useRef",
              title: "useRef",
              category: "React.js",
              path: "React.js/useRef.md",
              summary: "useRef 훅에 대한 설명",
              tags: ["React.js"],
            },
            {
              id: "React.js--useState",
              title: "useState",
              category: "React.js",
              path: "React.js/useState.md",
              summary: "useState 훅에 대한 설명",
              tags: ["React.js"],
            },
          ],
          totalFound: 2,
        },
      })
      expect(mockSearchDocuments).toHaveBeenCalledWith("React", 20)
    })

    it("성공: 빈 결과 반환", async () => {
      mockSearchDocuments.mockReturnValue([])

      const result = (await searchDocuments.execute?.({ query: "없는키워드" }, testContext)) as {
        success: true
        data: { documents: unknown[]; totalFound: number }
      }

      expect(result.success).toBe(true)
      expect(result.data.documents).toHaveLength(0)
      expect(result.data.totalFound).toBe(0)
    })

    it("성공: limit 파라미터 전달", async () => {
      mockSearchDocuments.mockReturnValue([])

      await searchDocuments.execute?.({ query: "test", limit: 5 }, testContext)

      expect(mockSearchDocuments).toHaveBeenCalledWith("test", 5)
    })

    it("에러: 볼트 읽기 실패", async () => {
      mockSearchDocuments.mockImplementation(() => {
        throw new WorkAgentError("Vault read error", "VAULT_ERROR")
      })

      const result = await searchDocuments.execute?.({ query: "test" }, testContext)

      expect(result).toEqual({
        success: false,
        error: {
          code: "VAULT_ERROR",
          message: "Obsidian 볼트 읽기 중 오류가 발생했습니다.",
          retryable: false,
        },
      })
    })

    it("에러: 일반 Error 처리", async () => {
      mockSearchDocuments.mockImplementation(() => {
        throw new Error("Unexpected error")
      })

      const result = await searchDocuments.execute?.({ query: "test" }, testContext)

      expect(result).toEqual({
        success: false,
        error: {
          code: "VAULT_ERROR",
          message: "Unexpected error",
          retryable: false,
        },
      })
    })

    it("에러: unknown 에러 처리", async () => {
      mockSearchDocuments.mockImplementation(() => {
        throw "string error"
      })

      const result = await searchDocuments.execute?.({ query: "test" }, testContext)

      expect(result).toEqual({
        success: false,
        error: {
          code: "VAULT_ERROR",
          message: "알 수 없는 오류가 발생했습니다.",
          retryable: false,
        },
      })
    })
  })

  // ============================================
  // readDocument Tests
  // ============================================
  describe("readDocument", () => {
    it("성공: 문서 내용 반환", async () => {
      mockReadDocumentContent.mockReturnValue({
        id: "React.js--useRef",
        title: "useRef",
        category: "React.js",
        path: "React.js/useRef.md",
        summary: "useRef 훅에 대한 설명",
        tags: ["React.js"],
        content: "# useRef\n\nuseRef는 React 훅입니다.",
      })

      const result = await readDocument.execute?.(
        { documentId: "React.js--useRef" },
        testContext
      )

      expect(result).toEqual({
        success: true,
        data: {
          document: {
            id: "React.js--useRef",
            title: "useRef",
            category: "React.js",
            path: "React.js/useRef.md",
          },
          content: "# useRef\n\nuseRef는 React 훅입니다.",
        },
      })
    })

    it("에러: 존재하지 않는 문서", async () => {
      mockReadDocumentContent.mockReturnValue(null)

      const result = await readDocument.execute?.(
        { documentId: "non-existent" },
        testContext
      )

      expect(result).toEqual({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "요청한 문서를 찾을 수 없습니다.",
          retryable: false,
        },
      })
    })

    it("에러: 파일 시스템 에러", async () => {
      mockReadDocumentContent.mockImplementation(() => {
        throw new WorkAgentError("File system error", "VAULT_ERROR")
      })

      const result = await readDocument.execute?.(
        { documentId: "broken-doc" },
        testContext
      )

      expect(result).toEqual({
        success: false,
        error: {
          code: "VAULT_ERROR",
          message: "Obsidian 볼트 읽기 중 오류가 발생했습니다.",
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
        sources: [{ type: "obsidian", title: "테스트 문서", id: "doc-1" }],
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
      const result = await answer.execute?.(input, testContext)
      expect(result).toEqual(input)
    })
  })

  // ============================================
  // createAnswerTool Tests (출처 검증)
  // ============================================
  describe("createAnswerTool", () => {
    const mockSearchContext: SearchContext = {
      obsidianDocIds: new Set(["doc-1", "doc-2", "doc-3"]),
    }

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
          { type: "obsidian" as const, title: "문서", id: "doc-1" },
          { type: "resume" as const, title: "이력서" },
        ],
        confidence: "high" as const,
      }

      const result = (await answerTool.execute?.(input, testContext)) as AnswerToolResult

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
          { type: "obsidian" as const, title: "유효한 문서", id: "doc-1" },
          { type: "obsidian" as const, title: "환각 문서", id: "fake-id" },
        ],
        confidence: "medium" as const,
      }

      const result = (await answerTool.execute?.(input, testContext)) as AnswerToolResult

      expect(result.validation.isValid).toBe(false)
      expect(result.validation.invalidSourceCount).toBe(1)
      expect(result.validation.warnings).toHaveLength(1)
      expect(result.validation.warnings[0]).toContain("검색 결과에 존재하지 않습니다")
      expect(result.sources).toHaveLength(1)
      expect(result.sources[0].id).toBe("doc-1")
    })

    it("ID 없는 출처 → 경고 추가, 유효로 처리", async () => {
      const answerTool = createAnswerTool(() => mockSearchContext)
      const input = {
        answer: "테스트 답변",
        sources: [{ type: "obsidian" as const, title: "ID 없는 문서" }],
        confidence: "low" as const,
      }

      const result = (await answerTool.execute?.(input, testContext)) as AnswerToolResult

      expect(result.validation.isValid).toBe(true)
      expect(result.validation.warnings).toHaveLength(1)
      expect(result.validation.warnings[0]).toContain("ID가 없습니다")
      expect(result.sources).toHaveLength(1)
    })

    it("resume 타입은 ID 검증 없이 항상 유효", async () => {
      const emptyContext: SearchContext = {
        obsidianDocIds: new Set(),
      }
      const answerTool = createAnswerTool(() => emptyContext)
      const input = {
        answer: "이력서 기반 답변",
        sources: [{ type: "resume" as const, title: "이력서 기본 정보" }],
        confidence: "high" as const,
      }

      const result = (await answerTool.execute?.(input, testContext)) as AnswerToolResult

      expect(result.validation.isValid).toBe(true)
      expect(result.validation.warnings).toHaveLength(0)
      expect(result.sources).toHaveLength(1)
    })

    it("동적 SearchContext 업데이트 반영", async () => {
      let dynamicContext: SearchContext = {
        obsidianDocIds: new Set(),
      }
      const answerTool = createAnswerTool(() => dynamicContext)

      const input = {
        answer: "테스트",
        sources: [{ type: "obsidian" as const, title: "문서", id: "doc-1" }],
        confidence: "high" as const,
      }

      const result1 = (await answerTool.execute?.(input, testContext)) as AnswerToolResult
      expect(result1.validation.isValid).toBe(false)

      dynamicContext = {
        obsidianDocIds: new Set(["doc-1"]),
      }

      const result2 = (await answerTool.execute?.(input, testContext)) as AnswerToolResult
      expect(result2.validation.isValid).toBe(true)
    })
  })
})
