/**
 * RAG Agent Tools
 *
 * Four tools for the Agentic RAG system:
 * 1. analyzeQuery - Query analysis and intent extraction
 * 2. searchKnowledge - Vector search with metadata filtering
 * 3. evaluateResults - Search result evaluation
 * 4. rewriteQuery - Query rewriting for better results
 */

import { tool, zodSchema } from "ai"
import { FieldValue } from "firebase-admin/firestore"
import { z } from "zod"
import { db } from "@/lib/firebase.server"
import type {
  EvaluationResult,
  KnowledgeDocument,
  QueryAnalysis,
  QueryIntent,
  RAGAgentConfig,
  RewriteResult,
  SearchResult,
  SuggestedAction,
} from "./types"
import { DEFAULT_AGENT_CONFIG } from "./types"

// Type for the embed function
type EmbedFunction = (params: {
  model: ReturnType<
    ReturnType<typeof import("@ai-sdk/google-vertex").createVertex>["embeddingModel"]
  >
  value: string
}) => Promise<{ embedding: number[] }>

// Zod schemas for tool inputs
const analyzeQuerySchema = z.object({
  query: z.string().describe("The user's original query to analyze"),
})

const searchKnowledgeSchema = z.object({
  searchQuery: z.string().describe("The query to search for"),
  skillFilters: z
    .array(z.string())
    .optional()
    .describe("Filter by skills (e.g., ['리더십', '협업'])"),
  techFilters: z
    .array(z.string())
    .optional()
    .describe("Filter by tech stack (e.g., ['react', 'typescript'])"),
  projectTypeFilter: z
    .string()
    .optional()
    .describe("Filter by project type (web, backend, mobile, infrastructure)"),
  limit: z.number().optional().describe("Maximum number of results to return"),
})

const evaluateResultsSchema = z.object({
  originalQuery: z.string().describe("The user's original query"),
  searchResults: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        category: z.string(),
        relevanceScore: z.number(),
      })
    )
    .describe("The search results to evaluate"),
  analysisContext: z
    .object({
      intent: z.string(),
      keywords: z.array(z.string()),
    })
    .optional()
    .describe("Context from query analysis"),
})

const rewriteQuerySchema = z.object({
  originalQuery: z
    .string()
    .describe("The original query that needs improvement"),
  intent: z.string().describe("The identified intent from query analysis"),
  keywords: z
    .array(z.string())
    .describe("Keywords extracted from the original query"),
  rewriteStrategy: z
    .enum(["broaden", "narrow", "rephrase", "decompose"])
    .describe(
      "Strategy for rewriting: broaden (more general), narrow (more specific), " +
        "rephrase (different terms), decompose (break into parts)"
    ),
})

// Infer types from schemas
type AnalyzeQueryInput = z.infer<typeof analyzeQuerySchema>
type SearchKnowledgeInput = z.infer<typeof searchKnowledgeSchema>
type EvaluateResultsInput = z.infer<typeof evaluateResultsSchema>
type RewriteQueryInput = z.infer<typeof rewriteQuerySchema>

/**
 * Create RAG Agent tools
 *
 * @param vertex - Vertex AI instance
 * @param embedFn - Embed function from AI SDK
 * @param config - Agent configuration
 */
export function createRAGTools(
  vertex: ReturnType<typeof import("@ai-sdk/google-vertex").createVertex>,
  embedFn: EmbedFunction,
  config: RAGAgentConfig = DEFAULT_AGENT_CONFIG
) {
  const {
    relevanceThreshold = 0.7,
    initialFetchLimit = 10,
    maxResults = 5,
  } = config

  // Shared state to collect sources for the response
  const collectedSources: SearchResult[] = []

  /**
   * Tool 1: analyzeQuery
   * Analyzes the user's query to extract intent and filter keywords
   */
  const analyzeQueryTool = tool({
    description:
      "Analyze the user's query to understand their intent and extract keywords for filtering. " +
      "This should ALWAYS be called first for every query.",
    inputSchema: zodSchema(analyzeQuerySchema),
    execute: async (input: AnalyzeQueryInput): Promise<QueryAnalysis> => {
      const { query } = input
      console.log("[analyzeQuery] Analyzing query:", query)

      // Extract intent based on query patterns
      const queryLower = query.toLowerCase()

      let intent: QueryIntent = "general_info"
      if (
        queryLower.includes("프로젝트") ||
        queryLower.includes("경험") ||
        queryLower.includes("만든")
      ) {
        intent = "project_inquiry"
      } else if (
        queryLower.includes("기술") ||
        queryLower.includes("스택") ||
        queryLower.includes("사용")
      ) {
        intent = "tech_inquiry"
      } else if (
        queryLower.includes("역량") ||
        queryLower.includes("능력") ||
        queryLower.includes("스킬")
      ) {
        intent = "skill_inquiry"
      } else if (
        queryLower.includes("문제") ||
        queryLower.includes("해결") ||
        queryLower.includes("트러블")
      ) {
        intent = "problem_solving"
      } else if (
        queryLower.includes("팀") ||
        queryLower.includes("협업") ||
        queryLower.includes("협력")
      ) {
        intent = "team_experience"
      }

      // Extract tech keywords
      const techPatterns = [
        "react",
        "typescript",
        "javascript",
        "node",
        "python",
        "java",
        "aws",
        "docker",
        "kubernetes",
        "next",
        "vue",
        "angular",
        "graphql",
        "mongodb",
        "postgresql",
        "redis",
        "firebase",
        "gcp",
        "azure",
      ]
      const techFilters = techPatterns.filter((tech) =>
        queryLower.includes(tech.toLowerCase())
      )

      // Extract skill keywords
      const skillPatterns = [
        "리더십",
        "협업",
        "커뮤니케이션",
        "문제해결",
        "최적화",
        "설계",
        "아키텍처",
        "멘토링",
        "애자일",
        "스크럼",
      ]
      const skillFilters = skillPatterns.filter((skill) =>
        queryLower.includes(skill.toLowerCase())
      )

      // Extract project type
      let projectTypeFilter: string | null = null
      if (queryLower.includes("웹") || queryLower.includes("프론트")) {
        projectTypeFilter = "web"
      } else if (
        queryLower.includes("백엔드") ||
        queryLower.includes("서버")
      ) {
        projectTypeFilter = "backend"
      } else if (
        queryLower.includes("모바일") ||
        queryLower.includes("앱")
      ) {
        projectTypeFilter = "mobile"
      } else if (
        queryLower.includes("인프라") ||
        queryLower.includes("데브옵스")
      ) {
        projectTypeFilter = "infrastructure"
      }

      // Extract general keywords from query
      const keywords = query
        .split(/\s+/)
        .filter((word) => word.length > 1)
        .slice(0, 5)

      const analysis: QueryAnalysis = {
        intent,
        keywords,
        skillFilters,
        techFilters,
        projectTypeFilter,
      }

      console.log("[analyzeQuery] Analysis result:", analysis)
      return analysis
    },
  })

  /**
   * Tool 2: searchKnowledge
   * Performs vector search with optional metadata filtering
   */
  const searchKnowledgeTool = tool({
    description:
      "Search the knowledge base using vector similarity with optional filters. " +
      "Use the filters from analyzeQuery to narrow down results.",
    inputSchema: zodSchema(searchKnowledgeSchema),
    execute: async (input: SearchKnowledgeInput): Promise<SearchResult[]> => {
      const {
        searchQuery,
        skillFilters: paramSkillFilters,
        techFilters: paramTechFilters,
        projectTypeFilter: paramProjectTypeFilter,
        limit = maxResults,
      } = input

      console.log("[searchKnowledge] Searching for:", searchQuery)
      console.log("[searchKnowledge] Filters:", {
        skillFilters: paramSkillFilters,
        techFilters: paramTechFilters,
        projectTypeFilter: paramProjectTypeFilter,
      })

      try {
        // Generate embedding for the search query
        const { embedding } = await embedFn({
          model: vertex.embeddingModel("text-embedding-004"),
          value: searchQuery,
        })

        // Perform vector search
        const knowledgeBaseRef = db.collection("knowledge_base")
        const vectorQuery = knowledgeBaseRef.findNearest(
          "embedding_field",
          FieldValue.vector(embedding),
          {
            limit: initialFetchLimit,
            distanceMeasure: "COSINE",
            distanceResultField: "vector_distance",
          } as {
            limit: number
            distanceMeasure: "COSINE"
            distanceResultField?: string
          }
        )

        const vectorSnapshot = await vectorQuery.get()

        // Process results
        interface VectorResult extends KnowledgeDocument {
          vector_distance?: number
        }

        const rawResults: {
          id: string
          data: VectorResult
          similarity: number
        }[] = []

        vectorSnapshot.forEach((doc) => {
          const data = doc.data() as VectorResult
          const distance = data.vector_distance ?? 0
          const similarity = 1 - distance
          rawResults.push({ id: doc.id, data, similarity })
        })

        console.log(
          "[searchKnowledge] Raw results:",
          rawResults.length,
          "similarities:",
          rawResults.map((r) => r.similarity.toFixed(3))
        )

        // Apply filters and threshold
        let filteredResults = rawResults.filter(
          (r) => r.similarity >= relevanceThreshold
        )

        // Apply metadata filters if provided
        if (paramSkillFilters && paramSkillFilters.length > 0) {
          filteredResults = filteredResults.filter((r) => {
            const docSkills = r.data.skills || []
            return paramSkillFilters.some((filter) =>
              docSkills.some((skill) =>
                skill.toLowerCase().includes(filter.toLowerCase())
              )
            )
          })
        }

        if (paramTechFilters && paramTechFilters.length > 0) {
          filteredResults = filteredResults.filter((r) => {
            const docTech = r.data.techStack || []
            return paramTechFilters.some((filter) =>
              docTech.some((tech) =>
                tech.toLowerCase().includes(filter.toLowerCase())
              )
            )
          })
        }

        if (paramProjectTypeFilter) {
          filteredResults = filteredResults.filter((r) => {
            return (
              r.data.projectType?.toLowerCase() ===
              paramProjectTypeFilter.toLowerCase()
            )
          })
        }

        // Sort by similarity and limit
        filteredResults = filteredResults
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, limit)

        console.log(
          "[searchKnowledge] Filtered results:",
          filteredResults.length
        )

        // Map to SearchResult format
        const searchResults: SearchResult[] = filteredResults.map((r) => ({
          id: r.id,
          title: r.data.title || "경험",
          content: r.data.content,
          category: r.data.category || "기타",
          skills: r.data.skills || [],
          techStack: r.data.techStack || [],
          projectType: r.data.projectType || null,
          relevanceScore: Math.round(r.similarity * 100) / 100,
        }))

        // Store in collected sources (for later use)
        collectedSources.length = 0 // Clear previous
        collectedSources.push(...searchResults)

        return searchResults
      } catch (error) {
        console.error("[searchKnowledge] Error:", error)
        return []
      }
    },
  })

  /**
   * Tool 3: evaluateResults
   * Evaluates search results for relevance and coverage
   */
  const evaluateResultsTool = tool({
    description:
      "Evaluate if the search results adequately answer the user's query. " +
      "Suggests whether to answer, rewrite query, or expand search.",
    inputSchema: zodSchema(evaluateResultsSchema),
    execute: async (input: EvaluateResultsInput): Promise<EvaluationResult> => {
      const { originalQuery, searchResults, analysisContext } = input

      console.log(
        "[evaluateResults] Evaluating",
        searchResults.length,
        "results"
      )

      // No results at all
      if (searchResults.length === 0) {
        return {
          isRelevant: false,
          relevanceScore: 0,
          coverageScore: 0,
          suggestedAction: "rewrite",
          reason: "검색 결과가 없습니다. 다른 검색어로 시도해보세요.",
        }
      }

      // Calculate average relevance score
      const avgRelevance =
        searchResults.reduce((sum, r) => sum + r.relevanceScore, 0) /
        searchResults.length

      // Check keyword coverage
      const keywords = analysisContext?.keywords || originalQuery.split(/\s+/)
      const allContent = searchResults
        .map((r) => r.content.toLowerCase())
        .join(" ")
      const keywordMatches = keywords.filter((kw) =>
        allContent.includes(kw.toLowerCase())
      )
      const coverageScore = keywordMatches.length / Math.max(keywords.length, 1)

      // Determine suggested action
      let suggestedAction: SuggestedAction = "answer"
      let reason = ""

      if (avgRelevance < 0.5) {
        suggestedAction = "rewrite"
        reason = "검색 결과의 관련성이 낮습니다."
      } else if (coverageScore < 0.3 && searchResults.length < 2) {
        suggestedAction = "expand"
        reason = "검색 결과가 부족합니다. 추가 검색이 도움될 수 있습니다."
      } else if (avgRelevance >= 0.7 && searchResults.length >= 2) {
        suggestedAction = "answer"
        reason = "충분한 정보가 있습니다."
      } else if (avgRelevance >= 0.5) {
        suggestedAction = "answer"
        reason = "적절한 정보가 있습니다."
      } else {
        suggestedAction = "rewrite"
        reason = "더 나은 검색 결과가 필요합니다."
      }

      const result: EvaluationResult = {
        isRelevant: avgRelevance >= 0.5,
        relevanceScore: Math.round(avgRelevance * 100) / 100,
        coverageScore: Math.round(coverageScore * 100) / 100,
        suggestedAction,
        reason,
      }

      console.log("[evaluateResults] Evaluation:", result)
      return result
    },
  })

  /**
   * Tool 4: rewriteQuery
   * Rewrites the query for better search results
   */
  const rewriteQueryTool = tool({
    description:
      "Rewrite the search query to get better results. " +
      "Use when evaluateResults suggests 'rewrite' or 'expand'.",
    inputSchema: zodSchema(rewriteQuerySchema),
    execute: async (input: RewriteQueryInput): Promise<RewriteResult> => {
      const { originalQuery, intent, keywords, rewriteStrategy } = input

      console.log("[rewriteQuery] Rewriting with strategy:", rewriteStrategy)

      let rewrittenQuery = originalQuery
      const modifications: string[] = []

      switch (rewriteStrategy) {
        case "broaden": {
          // Remove specific filters, make more general
          const generalTerms: Record<string, string> = {
            프로젝트: "경험",
            개발: "작업",
            구현: "진행",
          }
          for (const [specific, general] of Object.entries(generalTerms)) {
            if (rewrittenQuery.includes(specific)) {
              rewrittenQuery = rewrittenQuery.replace(specific, general)
              modifications.push(`'${specific}'를 '${general}'로 일반화`)
            }
          }
          if (modifications.length === 0) {
            rewrittenQuery = keywords.slice(0, 2).join(" ") + " 관련 경험"
            modifications.push("핵심 키워드로 단순화")
          }
          break
        }

        case "narrow": {
          // Add specificity based on intent
          const intentSpecifics: Record<string, string> = {
            project_inquiry: "구체적인 프로젝트",
            tech_inquiry: "기술 스택 사용 경험",
            skill_inquiry: "역량 발휘 사례",
            problem_solving: "문제 해결 과정",
            team_experience: "팀 협업 경험",
          }
          const specific = intentSpecifics[intent]
          if (specific) {
            rewrittenQuery = `${rewrittenQuery} ${specific}`
            modifications.push(`의도 기반 구체화: ${specific}`)
          }
          break
        }

        case "rephrase": {
          // Use alternative phrasings
          const alternatives: Record<string, string[]> = {
            경험: ["사례", "프로젝트", "작업"],
            사용: ["활용", "적용", "도입"],
            개발: ["구축", "구현", "제작"],
            문제: ["이슈", "장애", "트러블"],
          }
          for (const [original, alts] of Object.entries(alternatives)) {
            if (rewrittenQuery.includes(original)) {
              const alt = alts[0]
              rewrittenQuery = rewrittenQuery.replace(original, alt)
              modifications.push(`'${original}'를 '${alt}'로 대체`)
              break
            }
          }
          if (modifications.length === 0) {
            // Reorder keywords
            rewrittenQuery = keywords.reverse().join(" ")
            modifications.push("키워드 순서 변경")
          }
          break
        }

        case "decompose": {
          // Break into simpler query
          if (keywords.length > 2) {
            rewrittenQuery = keywords[0] + " " + keywords[1]
            modifications.push("복합 쿼리를 단순화")
          } else {
            rewrittenQuery = keywords[0] || originalQuery
            modifications.push("핵심 키워드만 추출")
          }
          break
        }
      }

      const result: RewriteResult = {
        rewrittenQuery,
        modifications,
      }

      console.log("[rewriteQuery] Result:", result)
      return result
    },
  })

  return {
    tools: {
      analyzeQuery: analyzeQueryTool,
      searchKnowledge: searchKnowledgeTool,
      evaluateResults: evaluateResultsTool,
      rewriteQuery: rewriteQueryTool,
    },
    getCollectedSources: () => [...collectedSources],
    clearSources: () => {
      collectedSources.length = 0
    },
  }
}
