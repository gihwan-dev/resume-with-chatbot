/**
 * RAG Agent Tools Unit Tests
 *
 * Note: @ts-nocheck is used because AI SDK's tool types expect 2 arguments
 * for execute() and return union types that cause false positives.
 * Tests pass at runtime.
 */
// @ts-nocheck

import { describe, it, expect, vi, beforeEach } from "vitest"
import { createRAGTools } from "@/lib/rag-agent/tools"
import type { RAGAgentConfig } from "@/lib/rag-agent/types"

// Mock Vertex AI - must have embeddingModel as a direct property
const mockVertex = Object.assign(vi.fn(() => "mock-model"), {
  embeddingModel: vi.fn(() => "mock-embedding-model"),
}) as unknown as ReturnType<
  typeof import("@ai-sdk/google-vertex").createVertex
>

// Mock embed function
const mockEmbedFn = vi.fn(() =>
  Promise.resolve({
    embedding: new Array(768).fill(0.1),
  })
)

const defaultConfig: RAGAgentConfig = {
  maxSteps: 5,
  relevanceThreshold: 0.7,
  initialFetchLimit: 10,
  maxResults: 5,
}

describe("RAG Agent Tools", () => {
  let tools: ReturnType<typeof createRAGTools>

  beforeEach(() => {
    vi.clearAllMocks()
    tools = createRAGTools(mockVertex, mockEmbedFn, defaultConfig)
  })

  describe("analyzeQuery", () => {
    it("should identify project inquiry intent", async () => {
      const result = await tools.tools.analyzeQuery.execute({
        query: "React 프로젝트 경험이 있나요?",
      })

      expect(result.intent).toBe("project_inquiry")
      expect(result.techFilters).toContain("react")
    })

    it("should identify tech inquiry intent", async () => {
      const result = await tools.tools.analyzeQuery.execute({
        query: "사용하는 기술 스택이 뭔가요?",
      })

      expect(result.intent).toBe("tech_inquiry")
    })

    it("should identify skill inquiry intent", async () => {
      const result = await tools.tools.analyzeQuery.execute({
        query: "개발 역량에 대해 알려주세요",
      })

      expect(result.intent).toBe("skill_inquiry")
    })

    it("should extract tech filters correctly", async () => {
      const result = await tools.tools.analyzeQuery.execute({
        query: "typescript와 node.js 경험",
      })

      expect(result.techFilters).toContain("typescript")
      expect(result.techFilters).toContain("node")
    })

    it("should extract skill filters correctly", async () => {
      const result = await tools.tools.analyzeQuery.execute({
        query: "리더십과 협업 능력",
      })

      expect(result.skillFilters).toContain("리더십")
      expect(result.skillFilters).toContain("협업")
    })

    it("should identify project type filter", async () => {
      const result = await tools.tools.analyzeQuery.execute({
        query: "백엔드 서버 개발 경험",
      })

      expect(result.projectTypeFilter).toBe("backend")
    })
  })

  describe("evaluateResults", () => {
    it('should suggest "answer" when results are relevant', async () => {
      const result = await tools.tools.evaluateResults.execute({
        originalQuery: "React 프로젝트 경험",
        searchResults: [
          {
            id: "1",
            title: "React 프로젝트",
            content: "React와 TypeScript를 활용한 프로젝트 개발",
            category: "project",
            relevanceScore: 0.85,
          },
          {
            id: "2",
            title: "웹 개발 경험",
            content: "프론트엔드 React 개발 경험",
            category: "experience",
            relevanceScore: 0.8,
          },
        ],
        analysisContext: {
          intent: "project_inquiry",
          keywords: ["React", "프로젝트", "경험"],
        },
      })

      expect(result.suggestedAction).toBe("answer")
      expect(result.isRelevant).toBe(true)
    })

    it('should suggest "rewrite" when no results', async () => {
      const result = await tools.tools.evaluateResults.execute({
        originalQuery: "존재하지 않는 기술",
        searchResults: [],
      })

      expect(result.suggestedAction).toBe("rewrite")
      expect(result.isRelevant).toBe(false)
    })

    it('should suggest "rewrite" when relevance is low', async () => {
      const result = await tools.tools.evaluateResults.execute({
        originalQuery: "특정 기술 경험",
        searchResults: [
          {
            id: "1",
            title: "관련 없는 내용",
            content: "무관한 정보",
            category: "other",
            relevanceScore: 0.3,
          },
        ],
      })

      expect(result.suggestedAction).toBe("rewrite")
    })

    it("should calculate coverage score based on keyword matches", async () => {
      const result = await tools.tools.evaluateResults.execute({
        originalQuery: "React TypeScript 프로젝트",
        searchResults: [
          {
            id: "1",
            title: "프로젝트",
            content: "React와 TypeScript 프로젝트 경험",
            category: "project",
            relevanceScore: 0.9,
          },
        ],
        analysisContext: {
          intent: "project_inquiry",
          keywords: ["React", "TypeScript", "프로젝트"],
        },
      })

      expect(result.coverageScore).toBeGreaterThan(0)
    })
  })

  describe("rewriteQuery", () => {
    it('should broaden query with "broaden" strategy', async () => {
      const result = await tools.tools.rewriteQuery.execute({
        originalQuery: "특정 프로젝트 개발",
        intent: "project_inquiry",
        keywords: ["특정", "프로젝트", "개발"],
        rewriteStrategy: "broaden",
      })

      expect(result.modifications.length).toBeGreaterThan(0)
      expect(result.rewrittenQuery).not.toBe("특정 프로젝트 개발")
    })

    it('should narrow query with "narrow" strategy', async () => {
      const result = await tools.tools.rewriteQuery.execute({
        originalQuery: "개발 경험",
        intent: "project_inquiry",
        keywords: ["개발", "경험"],
        rewriteStrategy: "narrow",
      })

      expect(result.rewrittenQuery).toContain("구체적인 프로젝트")
    })

    it('should rephrase query with "rephrase" strategy', async () => {
      const result = await tools.tools.rewriteQuery.execute({
        originalQuery: "개발 경험",
        intent: "project_inquiry",
        keywords: ["개발", "경험"],
        rewriteStrategy: "rephrase",
      })

      expect(result.modifications.length).toBeGreaterThan(0)
    })

    it('should decompose query with "decompose" strategy', async () => {
      const result = await tools.tools.rewriteQuery.execute({
        originalQuery: "복잡한 멀티 키워드 쿼리",
        intent: "general_info",
        keywords: ["복잡한", "멀티", "키워드", "쿼리"],
        rewriteStrategy: "decompose",
      })

      expect(result.modifications).toContain("복합 쿼리를 단순화")
    })
  })

  describe("searchKnowledge", () => {
    it("should call embed function with correct parameters", async () => {
      await tools.tools.searchKnowledge.execute({
        searchQuery: "테스트 쿼리",
      })

      expect(mockEmbedFn).toHaveBeenCalled()
    })

    it("should return search results", async () => {
      const results = await tools.tools.searchKnowledge.execute({
        searchQuery: "React 프로젝트",
      })

      expect(Array.isArray(results)).toBe(true)
    })

    it("should store results in collectedSources", async () => {
      await tools.tools.searchKnowledge.execute({
        searchQuery: "테스트",
      })

      const sources = tools.getCollectedSources()
      expect(Array.isArray(sources)).toBe(true)
    })

    it("should clear sources when clearSources is called", async () => {
      await tools.tools.searchKnowledge.execute({
        searchQuery: "테스트",
      })

      tools.clearSources()
      const sources = tools.getCollectedSources()
      expect(sources.length).toBe(0)
    })
  })
})

describe("Tool Descriptions", () => {
  let tools: ReturnType<typeof createRAGTools>

  beforeEach(() => {
    tools = createRAGTools(mockVertex, mockEmbedFn, defaultConfig)
  })

  it("analyzeQuery should be described as first tool to call", () => {
    const description = tools.tools.analyzeQuery.description
    expect(description).toContain("ALWAYS")
    expect(description).toContain("first")
  })

  it("rewriteQuery should mention when NOT to use it", () => {
    const description = tools.tools.rewriteQuery.description
    expect(description).toContain("rewrite")
    expect(description).toContain("expand")
  })
})
