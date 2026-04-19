/**
 * Work Agent AI Tools
 * Vercel AI SDK tool() 형태로 래핑된 Obsidian 볼트 도구
 */

import { tool } from "ai"
import { z } from "zod"
import {
  findRelatedDocs,
  hybridSearch,
  readDocumentContent,
  searchDocuments as searchDocumentsLocal,
} from "./obsidian.server"
import { embedQuery } from "./query-embedding"
import { validateSources } from "./source-tracker"
import type {
  ObsidianDocument,
  RelatedObsidianDocument,
  SearchContext,
  WorkAgentErrorCode,
} from "./types"
import { WorkAgentError } from "./types"

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
  VAULT_ERROR: "Obsidian 볼트 읽기 중 오류가 발생했습니다.",
  INVALID_CONFIG: "설정이 올바르지 않습니다.",
  RATE_LIMIT: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
  NOT_FOUND: "요청한 문서를 찾을 수 없습니다.",
  UNAUTHORIZED: "인증에 실패했습니다.",
}

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
        retryable: false,
      },
    }
  }

  return {
    success: false,
    error: {
      code: "VAULT_ERROR",
      message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      retryable: false,
    },
  }
}

// 스키마 정의 (테스트용 export)
export const searchDocumentsSchema = z.object({
  query: z.string().describe("검색할 키워드 (한글 또는 영문). 자연어 문장도 가능합니다."),
  limit: z.number().min(1).max(50).optional().describe("반환할 최대 문서 수 (기본값: 20)"),
})

export const readDocumentSchema = z.object({
  documentId: z.string().describe("조회할 문서 ID"),
})

export const findRelatedSchema = z.object({
  documentId: z.string().describe("기준 문서 ID"),
  depth: z
    .number()
    .int()
    .min(1)
    .max(2)
    .optional()
    .describe("탐색 깊이 (1 또는 2, 기본 1). 2는 이웃의 이웃까지 포함."),
})

export const answerSchema = z.object({
  answer: z.string().describe("사용자 질문에 대한 최종 답변"),
  sources: z
    .array(
      z.object({
        type: z.enum(["obsidian", "resume"]),
        title: z.string(),
        id: z.string().optional(),
      })
    )
    .describe("답변에 사용된 정보 출처"),
  confidence: z.enum(["high", "medium", "low"]).describe("답변 확신도"),
})

// Type definitions for inferred schemas
type SearchDocumentsInput = z.infer<typeof searchDocumentsSchema>
type ReadDocumentInput = z.infer<typeof readDocumentSchema>
type FindRelatedInput = z.infer<typeof findRelatedSchema>

/**
 * 문서 검색 도구
 * Obsidian 볼트에서 키워드/의미 기반 하이브리드 검색
 * - BM25(MiniSearch): 고유명사/정확 매칭에 강함
 * - 벡터(text-embedding-005): 추상적 개념/자연어 질의에 강함
 * - 임베딩 호출 실패 시 BM25로 자동 fallback
 */
export const searchDocuments = tool({
  description:
    "Obsidian 볼트에서 문서를 검색합니다. 키워드와 의미(임베딩)를 결합한 하이브리드 검색으로 추상적 질문과 고유명사 질문 모두에 대응합니다.",
  inputSchema: searchDocumentsSchema,
  execute: async (params: SearchDocumentsInput) => {
    try {
      const limit = params.limit ?? 20
      let queryEmbedding: number[] | null = null
      try {
        queryEmbedding = await embedQuery(params.query)
      } catch (error) {
        console.warn(
          "[searchDocuments] Query embedding failed, falling back to BM25:",
          error instanceof Error ? error.message : error
        )
      }

      const results = queryEmbedding
        ? hybridSearch(params.query, queryEmbedding, limit)
        : searchDocumentsLocal(params.query, limit)

      const documents: ObsidianDocument[] = results.map((doc) => ({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        path: doc.path,
        summary: doc.summary,
        tags: doc.tags,
      }))

      return {
        success: true as const,
        data: {
          documents,
          totalFound: documents.length,
        },
      }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
})

/**
 * 문서 상세 조회 도구
 * 특정 문서의 전체 내용 + 이 문서가 참조하는 관련 문서(outLinks) 반환
 */
export const readDocument = tool({
  description:
    "Obsidian 볼트 문서의 전체 내용을 조회합니다. 응답에는 본문과 이 문서가 [[wiki 링크]]로 참조하는 관련 문서 목록(outLinks)이 포함됩니다. 추상적 주제를 탐색할 땐 outLinks를 보고 findRelated로 확장하세요.",
  inputSchema: readDocumentSchema,
  execute: async (params: ReadDocumentInput) => {
    try {
      const result = readDocumentContent(params.documentId)

      if (!result) {
        return createErrorResponse(
          new WorkAgentError(`Document not found: ${params.documentId}`, "NOT_FOUND")
        )
      }

      return {
        success: true as const,
        data: {
          document: {
            id: result.id,
            title: result.title,
            category: result.category,
            path: result.path,
          },
          content: result.content,
          outLinks: result.outLinks,
        },
      }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
})

/**
 * 관련 문서 탐색 도구
 * wiki 링크 그래프(outLinks ∪ inLinks)를 따라 depth만큼 연결된 문서를 반환
 */
export const findRelated = tool({
  description:
    "특정 문서와 [[wiki 링크]]로 연결된 관련 문서들을 찾습니다. 추상적 주제(아키텍처 철학, 설계 원칙, 접근 방식 등)를 연쇄 탐색할 때 사용하세요. depth=1은 직접 연결, depth=2는 이웃의 이웃까지 확장합니다.",
  inputSchema: findRelatedSchema,
  execute: async (params: FindRelatedInput) => {
    try {
      const depth = params.depth === 2 ? 2 : 1
      const related: RelatedObsidianDocument[] = findRelatedDocs(params.documentId, depth)

      return {
        success: true as const,
        data: {
          documents: related,
          totalFound: related.length,
        },
      }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
})

/**
 * 최종 답변 도구
 * execute 함수로 답변을 tool result로 반환
 */
export const answer = tool({
  description: "검색 완료 후 최종 답변을 제공합니다. 반드시 검색을 먼저 수행한 후 사용하세요.",
  inputSchema: answerSchema,
  execute: async (input) => {
    return {
      answer: input.answer,
      sources: input.sources,
      confidence: input.confidence,
    }
  },
})

/**
 * 출처 검증이 포함된 answer 도구 팩토리
 * SearchContext를 통해 검색 결과와 출처 일치 여부 검증
 */
export function createAnswerTool(getSearchContext: () => SearchContext) {
  return tool({
    description:
      "검색 완료 후 최종 답변을 제공합니다. sources에는 검색된 정보의 실제 ID를 포함해야 합니다.",
    inputSchema: answerSchema,
    execute: async (input) => {
      const searchContext = getSearchContext()
      const validation = validateSources(input.sources, searchContext)

      return {
        answer: input.answer,
        sources: validation.validSources,
        confidence: input.confidence,
        validation: {
          isValid: validation.isValid,
          warnings: validation.warnings,
          invalidSourceCount: validation.invalidSources.length,
        },
      }
    },
  })
}

/**
 * Work Agent 도구 통합 export
 * chat.ts에서 사용
 */
export const workAgentTools = {
  searchDocuments,
  readDocument,
  findRelated,
  answer,
}
