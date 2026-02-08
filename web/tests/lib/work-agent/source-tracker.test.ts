/**
 * Source Tracker Tests
 * ID 추출 및 출처 검증 유틸리티 테스트
 * Obsidian 볼트 기반 아키텍처
 */

import { describe, expect, it } from "vitest"
import {
  buildSearchContextFromSteps,
  createSearchContext,
  extractDocumentId,
  extractDocumentIds,
  validateSources,
} from "../../../src/lib/work-agent/source-tracker"
import type { AnswerSource, SearchContext } from "../../../src/lib/work-agent/types"

describe("source-tracker", () => {
  // ============================================
  // createSearchContext Tests
  // ============================================
  describe("createSearchContext", () => {
    it("빈 SearchContext 생성", () => {
      const context = createSearchContext()
      expect(context.obsidianDocIds.size).toBe(0)
    })
  })

  // ============================================
  // extractDocumentIds Tests
  // ============================================
  describe("extractDocumentIds", () => {
    it("searchDocuments 결과에서 ID 추출", () => {
      const result = {
        success: true,
        data: {
          documents: [
            {
              id: "doc-1",
              title: "문서 1",
              category: "React",
              path: "React/doc1.md",
              summary: "",
              tags: [],
            },
            {
              id: "doc-2",
              title: "문서 2",
              category: "React",
              path: "React/doc2.md",
              summary: "",
              tags: [],
            },
          ],
        },
      }

      const ids = extractDocumentIds(result)
      expect(ids).toEqual(["doc-1", "doc-2"])
    })

    it("실패 결과에서 빈 배열 반환", () => {
      const result = { success: false, error: { code: "NOT_FOUND" } }
      const ids = extractDocumentIds(result)
      expect(ids).toEqual([])
    })

    it("null/undefined 입력에서 빈 배열 반환", () => {
      expect(extractDocumentIds(null)).toEqual([])
      expect(extractDocumentIds(undefined)).toEqual([])
    })

    it("잘못된 형식에서 빈 배열 반환", () => {
      expect(extractDocumentIds({ success: true })).toEqual([])
      expect(extractDocumentIds("string")).toEqual([])
    })
  })

  // ============================================
  // extractDocumentId Tests
  // ============================================
  describe("extractDocumentId", () => {
    it("readDocument 결과에서 ID 추출", () => {
      const result = {
        success: true,
        data: {
          document: { id: "doc-123", title: "Test Doc", category: "React", path: "React/test.md" },
          content: "...",
        },
      }

      const id = extractDocumentId(result)
      expect(id).toBe("doc-123")
    })

    it("실패 결과에서 null 반환", () => {
      const result = { success: false, error: { code: "NOT_FOUND" } }
      const id = extractDocumentId(result)
      expect(id).toBeNull()
    })

    it("null/undefined 입력에서 null 반환", () => {
      expect(extractDocumentId(null)).toBeNull()
      expect(extractDocumentId(undefined)).toBeNull()
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
              toolName: "searchDocuments",
              result: {
                success: true,
                data: {
                  documents: [
                    {
                      id: "doc-1",
                      title: "D1",
                      category: "R",
                      path: "R/d1.md",
                      summary: "",
                      tags: [],
                    },
                  ],
                },
              },
            },
          ],
        },
        {
          toolResults: [
            {
              toolName: "readDocument",
              result: {
                success: true,
                data: { document: { id: "doc-2", title: "D2", category: "R", path: "R/d2.md" } },
              },
            },
          ],
        },
        {
          toolResults: [
            {
              toolName: "searchDocuments",
              result: {
                success: true,
                data: {
                  documents: [
                    {
                      id: "doc-3",
                      title: "D3",
                      category: "R",
                      path: "R/d3.md",
                      summary: "",
                      tags: [],
                    },
                  ],
                },
              },
            },
          ],
        },
      ]

      const context = buildSearchContextFromSteps(steps)

      expect(context.obsidianDocIds.has("doc-1")).toBe(true)
      expect(context.obsidianDocIds.has("doc-2")).toBe(true)
      expect(context.obsidianDocIds.has("doc-3")).toBe(true)
      expect(context.obsidianDocIds.size).toBe(3)
    })

    it("빈 steps에서 빈 context 반환", () => {
      const context = buildSearchContextFromSteps([])
      expect(context.obsidianDocIds.size).toBe(0)
    })

    it("toolResults 없는 step 처리", () => {
      const steps = [{ text: "some text" }]
      const context = buildSearchContextFromSteps(
        steps as Parameters<typeof buildSearchContextFromSteps>[0]
      )
      expect(context.obsidianDocIds.size).toBe(0)
    })

    it("중복 ID 자동 제거 (Set)", () => {
      const steps = [
        {
          toolResults: [
            {
              toolName: "searchDocuments",
              result: {
                success: true,
                data: {
                  documents: [
                    {
                      id: "doc-1",
                      title: "D1",
                      category: "R",
                      path: "R/d1.md",
                      summary: "",
                      tags: [],
                    },
                    {
                      id: "doc-1",
                      title: "D1 Dup",
                      category: "R",
                      path: "R/d1.md",
                      summary: "",
                      tags: [],
                    },
                  ],
                },
              },
            },
          ],
        },
        {
          toolResults: [
            {
              toolName: "readDocument",
              result: {
                success: true,
                data: {
                  document: { id: "doc-1", title: "D1 Detail", category: "R", path: "R/d1.md" },
                },
              },
            },
          ],
        },
      ]

      const context = buildSearchContextFromSteps(steps)
      expect(context.obsidianDocIds.size).toBe(1)
      expect(context.obsidianDocIds.has("doc-1")).toBe(true)
    })

    it("알 수 없는 도구 이름은 무시", () => {
      const steps = [
        {
          toolResults: [
            {
              toolName: "unknownTool",
              result: { success: true, data: { id: "some-id" } },
            },
          ],
        },
      ]

      const context = buildSearchContextFromSteps(steps)
      expect(context.obsidianDocIds.size).toBe(0)
    })
  })

  // ============================================
  // validateSources Tests
  // ============================================
  describe("validateSources", () => {
    const baseContext: SearchContext = {
      obsidianDocIds: new Set(["doc-1", "doc-2", "doc-3"]),
    }

    it("유효한 출처 모두 통과", () => {
      const sources: AnswerSource[] = [
        { type: "obsidian", title: "Obsidian 문서", id: "doc-1" },
        { type: "obsidian", title: "다른 문서", id: "doc-2" },
        { type: "resume", title: "이력서" },
      ]

      const result = validateSources(sources, baseContext)

      expect(result.isValid).toBe(true)
      expect(result.validSources).toHaveLength(3)
      expect(result.invalidSources).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
    })

    it("resume 타입은 ID 없이도 유효", () => {
      const sources: AnswerSource[] = [{ type: "resume", title: "이력서 기본 정보" }]

      const result = validateSources(sources, baseContext)

      expect(result.isValid).toBe(true)
      expect(result.validSources).toHaveLength(1)
      expect(result.warnings).toHaveLength(0)
    })

    it("ID 없는 obsidian 출처 → 경고 추가, 유효로 처리", () => {
      const sources: AnswerSource[] = [{ type: "obsidian", title: "ID 없는 문서" }]

      const result = validateSources(sources, baseContext)

      expect(result.isValid).toBe(true)
      expect(result.validSources).toHaveLength(1)
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0]).toContain("ID가 없습니다")
    })

    it("검색되지 않은 ID → 무효, 경고 생성", () => {
      const sources: AnswerSource[] = [{ type: "obsidian", title: "가짜 문서", id: "fake-doc-id" }]

      const result = validateSources(sources, baseContext)

      expect(result.isValid).toBe(false)
      expect(result.validSources).toHaveLength(0)
      expect(result.invalidSources).toHaveLength(1)
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0]).toContain("검색 결과에 존재하지 않습니다")
    })

    it("혼합: 유효/무효 출처 분류", () => {
      const sources: AnswerSource[] = [
        { type: "obsidian", title: "유효한 문서", id: "doc-1" },
        { type: "obsidian", title: "무효한 문서", id: "invalid-id" },
        { type: "resume", title: "이력서" },
        { type: "obsidian", title: "ID 없는 문서" },
      ]

      const result = validateSources(sources, baseContext)

      expect(result.isValid).toBe(false)
      expect(result.validSources).toHaveLength(3) // doc-1, resume, ID없는문서
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
      const sources: AnswerSource[] = [{ type: "obsidian", title: "문서", id: "some-id" }]

      const result = validateSources(sources, emptyContext)

      expect(result.isValid).toBe(false)
      expect(result.invalidSources).toHaveLength(1)
    })
  })
})
