# Agentic RAG 구현 계획

## 현재 상태 분석

### Simple RAG 구조 (`web/src/pages/api/chat.ts`)

현재 구현은 가장 기본적인 RAG 패턴을 따릅니다:

```
User Query → Embedding → Vector Search (Top-5) → Context Injection → LLM Response
```

**현재 흐름:**
1. 사용자 쿼리를 `text-embedding-004` 모델로 임베딩
2. Firestore에서 코사인 유사도 기반 Top-5 문서 검색
3. 검색된 문서를 시스템 프롬프트에 컨텍스트로 주입
4. Gemini 2.5 Pro로 응답 생성

### 주요 문제점

| 문제 | 현재 상태 | 개선 방향 |
|------|----------|----------|
| **제목** | `Chat Conversation 879` | LLM 기반 의미있는 제목/요약 생성 |
| **필터링** | 무조건 Top-5 반환 | relevance threshold 적용 |
| **쿼리 최적화** | 없음 | Agent가 쿼리 분석/재작성 |
| **결과 평가** | 없음 | 검색 결과 품질 평가 후 재검색 |
| **검색 방식** | 벡터 검색만 | 하이브리드 검색 (벡터 + 키워드) |
| **역량 키워드** | 없음 | LLM 기반 skills/techStack 자동 추출 |
| **청크 맥락** | 없음 | Contextual Retrieval (맥락 프리픽스) |
| **Reranking** | 없음 | Cross-encoder로 최종 정렬 |

### 데이터 품질 이슈 (`web/scripts/upload-vector-db.ts`)

현재 메타데이터 생성 방식:
```typescript
// 현재: 무의미한 순번 기반 제목
title: `Chat Conversation ${index + 1}`

// 문서의 경우도 단순 파일명 + 섹션 번호
title: `${file} - Section ${index + 1}`
```

이로 인해:
- 검색 결과 UI에서 어떤 내용인지 파악 불가
- 디버깅 및 검색 품질 분석 어려움
- 사용자에게 출처 정보가 무의미함

---

## Phase 1: 기초 개선

### 1.1 검색 필터링 (Relevance Threshold)

**목표:** 관련성 낮은 문서 필터링으로 노이즈 제거

**구현 위치:** `web/src/pages/api/chat.ts`

```typescript
// 개선된 벡터 검색
const vectorQuery = knowledgeBaseRef.findNearest(
  "embedding_field",
  FieldValue.vector(embedding),
  {
    limit: 10, // 더 많이 가져온 후 필터링
    distanceMeasure: "COSINE",
  }
)

const vectorSnapshot = await vectorQuery.get()

// Relevance threshold 적용
const RELEVANCE_THRESHOLD = 0.7 // 코사인 유사도 기준
const filteredDocs = vectorSnapshot.docs
  .map(doc => ({
    doc,
    similarity: 1 - (doc.get('_distance') || 0) // COSINE distance를 similarity로 변환
  }))
  .filter(item => item.similarity >= RELEVANCE_THRESHOLD)
  .slice(0, 5) // 최대 5개만 사용
```

### 1.2 데이터 제목/요약 개선 (LLM 기반)

**목표:** 각 청크에 의미있는 제목과 요약 생성

**구현 위치:** `web/scripts/upload-vector-db.ts`

```typescript
import { generateText } from "ai"

async function generateMetadata(content: string): Promise<{ title: string; summary: string }> {
  const { text } = await generateText({
    model: vertex("gemini-2.0-flash"), // 빠른 모델 사용
    prompt: `다음 대화/문서 내용을 분석하여 JSON 형식으로 응답하세요:
{
  "title": "10단어 이내의 핵심 주제",
  "summary": "50단어 이내의 요약"
}

내용:
${content.slice(0, 2000)}

JSON:`,
  })

  try {
    return JSON.parse(text)
  } catch {
    return {
      title: content.slice(0, 50) + "...",
      summary: content.slice(0, 150) + "..."
    }
  }
}

// 채팅 히스토리 처리 시 적용
const metadata = await generateMetadata(content)
docs.push({
  content: content.trim(),
  title: metadata.title,         // "React 상태관리 최적화 경험"
  summary: metadata.summary,     // "Context API와 Zustand 비교 분석..."
  category: "chat-history",
  sourceId: `conv-${index}`,
  createdAt: new Date(conv.timestamp || Date.now()),
})
```

### 1.3 Contextual Retrieval (Anthropic 방식)

**목표:** 각 청크에 맥락 정보를 추가하여 검색 품질 향상

Anthropic의 [Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval) 연구에 따르면, 청크에 맥락 프리픽스를 추가하면:
- 기본 검색 실패율 **49% 감소**
- Reranking 포함 시 **67% 감소**

**핵심 개념:** 독립적인 청크는 "회사가 작년에 1억 달러 수익을 달성했다"처럼 맥락이 없으면 어떤 회사인지 알 수 없습니다. Contextual Retrieval은 각 청크 앞에 해당 청크의 출처와 맥락을 설명하는 프리픽스를 추가합니다.

**구현 위치:** `web/scripts/upload-vector-db.ts`

```typescript
async function generateContextualMetadata(content: string, fullDocument?: string) {
  const { text } = await generateText({
    model: vertex("gemini-2.0-flash"),
    prompt: `다음 청크가 전체 문서에서 어떤 위치와 맥락을 갖는지 설명하는 짧은 맥락 프리픽스를 생성하세요.

전체 문서 맥락:
${fullDocument?.slice(0, 3000) || "대화 히스토리"}

현재 청크:
${content.slice(0, 2000)}

다음 JSON 형식으로 응답:
{
  "title": "10단어 이내의 핵심 주제",
  "summary": "50단어 이내의 요약",
  "contextPrefix": "이 청크의 맥락을 설명하는 1-2문장"
}

JSON:`,
  })

  try {
    return JSON.parse(text)
  } catch {
    return {
      title: content.slice(0, 50) + "...",
      summary: content.slice(0, 150) + "...",
      contextPrefix: ""
    }
  }
}

// 임베딩용 컨텍스트 포함 콘텐츠 생성
function createContextualContent(contextPrefix: string, originalContent: string): string {
  if (!contextPrefix) return originalContent
  return `<context>${contextPrefix}</context>\n${originalContent}`
}

// 사용 예시
const metadata = await generateContextualMetadata(content, fullConversation)
const contextualContent = createContextualContent(metadata.contextPrefix, content)

docs.push({
  content: content.trim(),                    // 원본 콘텐츠 (응답 생성용)
  contextualContent: contextualContent,       // 맥락 포함 콘텐츠 (임베딩용)
  title: metadata.title,
  summary: metadata.summary,
  contextPrefix: metadata.contextPrefix,      // "이 대화는 개발자가 React 훅을 최적화하는 과정입니다"
  // ... 기타 필드
})
```

**임베딩 시 contextualContent 사용:**
```typescript
// 임베딩 생성 시 맥락 포함 콘텐츠 사용
const { embedding } = await embed({
  model: vertex.embeddingModel("text-embedding-004"),
  value: doc.contextualContent || doc.content,  // 맥락 포함 버전 우선
})
```

### 1.4 역량 키워드 자동 추출

**목표:** LLM 기반으로 skills, techStack, projectType 자동 추출

**역량 카테고리 정의:**
```
- 문제 해결: "디버깅", "버그 수정", "트러블슈팅", "에러 핸들링"
- 기술적 역량: "타입 시스템", "상태 관리", "성능 최적화", "테스트"
- 설계 역량: "API 설계", "컴포넌트 설계", "리팩토링", "아키텍처"
```

**확장된 메타데이터 스키마:**
```typescript
interface KnowledgeDoc {
  // 기존 필드
  content: string;
  title: string;
  summary: string;
  category: "docs" | "chat-history";
  sourceId: string;
  createdAt: Date;

  // NEW: Contextual Retrieval
  contextualContent: string;  // 임베딩용 (맥락 프리픽스 포함)
  contextPrefix: string;      // 맥락 설명

  // NEW: 역량 키워드
  skills: string[];           // ["디버깅", "타입 시스템", "성능 최적화"]
  techStack: string[];        // ["React", "TypeScript", "Zustand"]
  projectType: string;        // "frontend" | "backend" | "design-system" | "devops"
}
```

**구현:**
```typescript
async function extractCapabilities(content: string) {
  const { text } = await generateText({
    model: vertex("gemini-2.0-flash"),
    prompt: `다음 대화/문서에서 개발자의 역량과 기술 스택을 추출하세요.

내용:
${content.slice(0, 3000)}

다음 JSON 형식으로 응답:
{
  "skills": ["역량 키워드 배열 - 문제해결, 기술적역량, 설계역량 관련"],
  "techStack": ["사용된 기술/프레임워크/라이브러리"],
  "projectType": "frontend | backend | fullstack | design-system | devops | data"
}

역량 키워드 예시:
- 문제 해결: 디버깅, 버그 수정, 트러블슈팅, 에러 핸들링, 성능 진단
- 기술적 역량: 타입 시스템, 상태 관리, 성능 최적화, 테스트 작성, 비동기 처리
- 설계 역량: API 설계, 컴포넌트 설계, 리팩토링, 아키텍처 개선, 추상화

JSON:`,
  })

  try {
    return JSON.parse(text)
  } catch {
    return { skills: [], techStack: [], projectType: "unknown" }
  }
}

// 통합된 메타데이터 생성
async function generateFullMetadata(content: string, fullDocument?: string) {
  const [contextual, capabilities] = await Promise.all([
    generateContextualMetadata(content, fullDocument),
    extractCapabilities(content),
  ])

  return {
    ...contextual,
    ...capabilities,
  }
}
```

### 1.5 Phase 1 예상 효과

- 검색 결과 품질 향상 (관련없는 문서 제외)
- **Contextual Retrieval로 검색 실패율 49% 감소**
- 역량 기반 필터링으로 면접 질문에 정확한 답변
- 소스 UI에서 의미있는 정보 표시
- 디버깅 및 분석 용이성 증가

---

## Phase 2: Tool Calling 기반 Agent

### 2.1 아키텍처 개요

```
User Query
    ↓
┌─────────────────────────────────────┐
│          RAG Agent                   │
│  ┌─────────────────────────────┐   │
│  │     Query Analyzer Tool      │   │
│  │  - 쿼리 의도 분석            │   │
│  │  - 검색 키워드 추출          │   │
│  └─────────────────────────────┘   │
│              ↓                       │
│  ┌─────────────────────────────┐   │
│  │     Search Tool              │   │
│  │  - 벡터 검색 실행            │   │
│  │  - 역량 필터링 (skills)      │   │
│  │  - 결과 반환                 │   │
│  └─────────────────────────────┘   │
│              ↓                       │
│  ┌─────────────────────────────┐   │
│  │     Evaluate Tool            │   │
│  │  - 결과 품질 평가            │   │
│  │  - 재검색 필요 여부 판단     │   │
│  └─────────────────────────────┘   │
│              ↓                       │
│  ┌─────────────────────────────┐   │
│  │     Rewrite Tool             │   │
│  │  - 쿼리 재작성               │   │
│  │  - (필요시) 재검색 트리거    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
    ↓
Final Response (with sources)
```

### 2.2 Tool 정의

**새 파일:** `web/src/lib/rag-agent.ts`

```typescript
import { tool } from "ai"
import { z } from "zod"

// 1. 쿼리 분석 도구
export const analyzeQueryTool = tool({
  description: "사용자 쿼리의 의도를 분석하고 검색 전략을 결정합니다",
  parameters: z.object({
    query: z.string().describe("분석할 사용자 쿼리"),
  }),
  execute: async ({ query }) => {
    // LLM을 사용하여 쿼리 분석
    return {
      intent: "information_retrieval", // or "comparison", "how_to", etc.
      keywords: ["React", "상태관리", "최적화"],
      requiredSkills: ["성능 최적화", "상태 관리"],  // NEW: 필요한 역량
      searchStrategy: "semantic", // or "keyword", "hybrid"
      confidence: 0.85,
    }
  },
})

// 2. 벡터 검색 도구 (역량 필터링 지원)
export const searchKnowledgeTool = tool({
  description: "지식 베이스에서 관련 문서를 검색합니다. 역량 키워드로 필터링 가능",
  parameters: z.object({
    query: z.string().describe("검색 쿼리"),
    limit: z.number().default(5).describe("최대 결과 수"),
    threshold: z.number().default(0.7).describe("유사도 임계값"),
    skillsFilter: z.array(z.string()).optional().describe("필터링할 역량 키워드"),
    techStackFilter: z.array(z.string()).optional().describe("필터링할 기술 스택"),
  }),
  execute: async ({ query, limit, threshold, skillsFilter, techStackFilter }) => {
    // 벡터 검색 실행 + 역량 필터링
    const results = await performVectorSearch(query, limit, threshold, {
      skills: skillsFilter,
      techStack: techStackFilter,
    })
    return {
      documents: results,
      totalFound: results.length,
      averageSimilarity: calculateAvgSimilarity(results),
    }
  },
})

// 3. 결과 평가 도구
export const evaluateResultsTool = tool({
  description: "검색 결과가 쿼리에 충분히 답변할 수 있는지 평가합니다",
  parameters: z.object({
    query: z.string().describe("원본 쿼리"),
    documents: z.array(z.object({
      content: z.string(),
      similarity: z.number(),
    })).describe("검색된 문서들"),
  }),
  execute: async ({ query, documents }) => {
    // 결과 품질 평가
    return {
      isRelevant: true,
      coverageScore: 0.8, // 쿼리의 얼마나 많은 부분을 커버하는지
      suggestRewrite: false,
      reasoning: "검색 결과가 쿼리에 충분히 답변 가능",
    }
  },
})

// 4. 쿼리 재작성 도구
export const rewriteQueryTool = tool({
  description: "더 나은 검색 결과를 위해 쿼리를 재작성합니다",
  parameters: z.object({
    originalQuery: z.string().describe("원본 쿼리"),
    reason: z.string().describe("재작성 이유"),
  }),
  execute: async ({ originalQuery, reason }) => {
    // LLM을 사용하여 쿼리 재작성
    return {
      rewrittenQuery: "React 컴포넌트 상태관리 성능 최적화 경험",
      changes: ["더 구체적인 키워드 추가", "기술 용어 명확화"],
    }
  },
})
```

### 2.3 Agent 실행 로직

**수정 파일:** `web/src/pages/api/chat.ts` → Agent 구조로 개선

```typescript
import { generateText } from "ai"
import {
  analyzeQueryTool,
  searchKnowledgeTool,
  evaluateResultsTool,
  rewriteQueryTool
} from "@/lib/rag-agent"

export const POST = async ({ request }: { request: Request }) => {
  const { messages } = await request.json()
  const vertex = getVertex()

  // Agent 실행
  const result = await generateText({
    model: vertex("gemini-2.5-pro"),
    tools: {
      analyzeQuery: analyzeQueryTool,
      searchKnowledge: searchKnowledgeTool,
      evaluateResults: evaluateResultsTool,
      rewriteQuery: rewriteQueryTool,
    },
    maxSteps: 5, // 최대 5번의 tool 호출 허용
    system: `당신은 개발자 포트폴리오 웹사이트의 RAG 에이전트입니다.
사용자 질문에 답하기 위해 다음 순서로 작업하세요:
1. analyzeQuery로 쿼리 분석 (필요한 역량 키워드 파악)
2. searchKnowledge로 관련 문서 검색 (역량 필터링 활용)
3. evaluateResults로 결과 품질 평가
4. 필요시 rewriteQuery로 쿼리 재작성 후 재검색
5. 충분한 컨텍스트를 확보하면 최종 답변 생성

"문제 해결 경험" 같은 질문에는 skills 필터에 "디버깅", "트러블슈팅" 등을 사용하세요.

항상 한국어로 답변하세요.`,
    messages: modelMessages,
  })

  // 스트리밍 응답 처리
  // ...
}
```

### 2.4 Phase 2 예상 효과

- 쿼리 의도 파악으로 검색 정확도 향상
- **역량 필터링으로 "문제 해결 경험" 같은 질문에 정확한 문서 반환**
- 불충분한 결과 시 자동 재검색
- 복잡한 질문에 대한 다단계 검색 가능

---

## Phase 3: 고급 기능

### 3.1 하이브리드 검색 (벡터 + 키워드)

**권장 가중치 비율:** 벡터 0.7 : 키워드 0.3

Anthropic의 연구에 따르면 하이브리드 검색에서:
- 벡터 검색은 의미적 유사성을 잘 포착
- 키워드 검색(BM25)은 특정 용어/이름을 정확히 매칭
- **Contextual BM25**: 맥락 프리픽스가 포함된 콘텐츠에 BM25 적용 시 더 나은 결과

```typescript
// 하이브리드 검색 구현
export const hybridSearchTool = tool({
  description: "벡터 검색과 키워드 검색을 결합하여 검색합니다",
  parameters: z.object({
    query: z.string(),
    keywords: z.array(z.string()).optional(),
    vectorWeight: z.number().default(0.7),  // 권장: 0.7
    keywordWeight: z.number().default(0.3), // 권장: 0.3
  }),
  execute: async ({ query, keywords, vectorWeight, keywordWeight }) => {
    // 1. 벡터 검색 (contextualContent 임베딩 기반)
    const vectorResults = await performVectorSearch(query)

    // 2. 키워드 검색 (Contextual BM25 - 맥락 포함 콘텐츠 대상)
    const keywordResults = await performContextualBM25Search(
      keywords || extractKeywords(query)
    )

    // 3. 스코어 결합 (Reciprocal Rank Fusion)
    const combinedResults = fuseResults(vectorResults, keywordResults, {
      vectorWeight,
      keywordWeight,
    })

    return combinedResults
  },
})

// Contextual BM25: 맥락 프리픽스 포함 콘텐츠에 대한 키워드 검색
async function performContextualBM25Search(keywords: string[]) {
  // contextualContent 필드에 대해 BM25 스코어링
  // Firestore의 경우 array-contains 또는 전문 검색 서비스 활용
  return await knowledgeBaseRef
    .where("techStack", "array-contains-any", keywords)
    .get()
}

// Reciprocal Rank Fusion 알고리즘
function fuseResults(
  vectorResults: SearchResult[],
  keywordResults: SearchResult[],
  weights: { vectorWeight: number; keywordWeight: number }
): SearchResult[] {
  const k = 60 // RRF 상수
  const scores = new Map<string, number>()

  vectorResults.forEach((doc, rank) => {
    const score = weights.vectorWeight * (1 / (k + rank))
    scores.set(doc.id, (scores.get(doc.id) || 0) + score)
  })

  keywordResults.forEach((doc, rank) => {
    const score = weights.keywordWeight * (1 / (k + rank))
    scores.set(doc.id, (scores.get(doc.id) || 0) + score)
  })

  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id, score]) => ({ id, score, ...getDocById(id) }))
}
```

### 3.2 멀티-스텝 검색 (Self-RAG 패턴)

```typescript
// Self-RAG: 검색 결과를 스스로 평가하고 개선
async function selfRAGSearch(query: string, maxIterations = 3): Promise<SearchResult[]> {
  let currentQuery = query
  let bestResults: SearchResult[] = []
  let bestScore = 0

  for (let i = 0; i < maxIterations; i++) {
    // 1. 검색 실행
    const results = await performVectorSearch(currentQuery)

    // 2. 결과 품질 평가
    const evaluation = await evaluateSearchResults(query, results)

    if (evaluation.score > bestScore) {
      bestScore = evaluation.score
      bestResults = results
    }

    // 3. 충분히 좋으면 종료
    if (evaluation.score >= 0.8 || !evaluation.suggestRewrite) {
      break
    }

    // 4. 쿼리 재작성
    currentQuery = await rewriteQuery(query, evaluation.feedback)
  }

  return bestResults
}
```

### 3.3 캐싱 및 성능 최적화

```typescript
import { LRUCache } from "lru-cache"

// 임베딩 캐시
const embeddingCache = new LRUCache<string, number[]>({
  max: 1000, // 최대 1000개 쿼리
  ttl: 1000 * 60 * 60, // 1시간
})

// 검색 결과 캐시
const searchCache = new LRUCache<string, SearchResult[]>({
  max: 500,
  ttl: 1000 * 60 * 30, // 30분
})

async function getCachedEmbedding(query: string): Promise<number[]> {
  const cached = embeddingCache.get(query)
  if (cached) return cached

  const { embedding } = await embed({
    model: vertex.embeddingModel("text-embedding-004"),
    value: query,
  })

  embeddingCache.set(query, embedding)
  return embedding
}
```

### 3.4 HyDE (Hypothetical Document Embeddings)

**목표:** 모호하거나 희소한 쿼리에 대한 검색 품질 향상

HyDE는 사용자 쿼리를 직접 임베딩하는 대신, 해당 쿼리에 대한 **가상의 이상적인 답변**을 먼저 생성하고 그것을 임베딩합니다. 이 방식은 쿼리와 문서 사이의 어휘적 격차를 줄여줍니다.

**적용 시나리오:**
- 짧거나 모호한 쿼리: "상태관리 경험?"
- 일반적인 쿼리: "문제 해결 경험 알려줘"
- 정확한 용어가 아닌 설명적 쿼리

```typescript
async function hydeSearch(query: string): Promise<SearchResult[]> {
  // 1. 가상 답변 생성
  const { text: hypotheticalAnswer } = await generateText({
    model: vertex("gemini-2.0-flash"),
    prompt: `당신은 시니어 프론트엔드 개발자입니다.
다음 질문에 대한 이상적인 답변을 구체적인 기술 경험을 포함하여 작성하세요.

질문: ${query}

이상적인 답변 (200자 내외):`,
  })

  // 2. 가상 답변 임베딩
  const { embedding } = await embed({
    model: vertex.embeddingModel("text-embedding-004"),
    value: hypotheticalAnswer,
  })

  // 3. 해당 임베딩으로 실제 문서 검색
  const results = await performVectorSearchWithEmbedding(embedding)

  return results
}

// 하이브리드: 일반 검색 + HyDE 결합
async function enhancedSearch(query: string): Promise<SearchResult[]> {
  const [normalResults, hydeResults] = await Promise.all([
    performVectorSearch(query),
    hydeSearch(query),
  ])

  // 결과 병합 및 중복 제거
  return mergeAndDeduplicate(normalResults, hydeResults)
}
```

### 3.5 Reranking (Cross-Encoder)

**목표:** 초기 검색 결과를 더 정밀하게 재정렬

초기 벡터 검색(bi-encoder)은 빠르지만, Cross-encoder로 재정렬하면 쿼리-문서 쌍의 관련성을 더 정확하게 평가할 수 있습니다.

**검색 파이프라인:**
```
1. Vector Search (semantic)     → Top 20 후보
2. Keyword Search (BM25)        → Top 20 후보
3. Score Fusion (RRF)           → Top 15 병합
4. Reranking (cross-encoder)    → Top 5 최종 선택
```

```typescript
// Cross-encoder 기반 Reranking
async function rerankResults(
  query: string,
  candidates: SearchResult[],
  topK: number = 5
): Promise<SearchResult[]> {
  // LLM을 cross-encoder처럼 사용
  const { text } = await generateText({
    model: vertex("gemini-2.0-flash"),
    prompt: `다음 쿼리와 각 문서의 관련성을 0-10 점수로 평가하세요.

쿼리: ${query}

문서들:
${candidates.map((doc, i) => `[${i}] ${doc.content.slice(0, 500)}`).join('\n\n')}

각 문서의 관련성 점수를 JSON 배열로 반환:
예: [8, 5, 9, 3, 7, ...]`,
  })

  try {
    const scores: number[] = JSON.parse(text)
    return candidates
      .map((doc, i) => ({ ...doc, rerankScore: scores[i] || 0 }))
      .sort((a, b) => b.rerankScore - a.rerankScore)
      .slice(0, topK)
  } catch {
    return candidates.slice(0, topK)
  }
}

// 전체 파이프라인
async function fullRAGPipeline(query: string): Promise<SearchResult[]> {
  // 1. 벡터 검색
  const vectorResults = await performVectorSearch(query, 20)

  // 2. 키워드 검색
  const keywordResults = await performKeywordSearch(query, 20)

  // 3. RRF 융합
  const fusedResults = fuseResults(vectorResults, keywordResults, {
    vectorWeight: 0.7,
    keywordWeight: 0.3,
  }).slice(0, 15)

  // 4. Reranking
  const rerankedResults = await rerankResults(query, fusedResults, 5)

  return rerankedResults
}
```

**효과:** Anthropic 연구에 따르면 Contextual Retrieval + Reranking 조합 시 검색 실패율 **67% 감소**

### 3.6 Phase 3 예상 효과

- 키워드 매칭으로 벡터 검색의 약점 보완
- **HyDE로 모호한 쿼리의 recall 개선**
- **Reranking으로 정밀도 향상 (실패율 67% 감소)**
- 자동 쿼리 개선으로 검색 품질 지속 향상
- 캐싱으로 응답 속도 개선 (50%+ 감소 예상)

---

## 파일 변경 목록

### 수정 파일
| 파일 | 변경 내용 | Phase |
|------|----------|-------|
| `web/src/pages/api/chat.ts` | Agent 구조로 전환, Tool 통합 | 2 |
| `web/scripts/upload-vector-db.ts` | Contextual Retrieval, 역량 추출 추가 | 1 |

### 신규 파일
| 파일 | 내용 | Phase |
|------|------|-------|
| `web/src/lib/rag-agent.ts` | RAG Agent 및 Tool 정의 | 2 |
| `web/src/lib/search-utils.ts` | 하이브리드 검색, RRF, HyDE, Reranking | 3 |
| `web/src/lib/cache.ts` | 임베딩/검색 캐싱 로직 | 3 |

---

## 예상 효과

### 정량적 개선
| 지표 | 현재 | Phase 1 후 | Phase 2 후 | Phase 3 후 |
|------|------|-----------|-----------|-----------|
| 검색 정확도 (예상) | ~60% | ~75% | ~85% | ~90% |
| 응답 관련성 | 낮음 | 중간 | 높음 | 매우 높음 |
| 평균 응답 시간 | 2-3초 | 2-3초 | 3-4초 | 2-3초 (캐시) |
| 검색 실패율 감소 | - | 49% | 55% | 67% |

### 정성적 개선
- **Phase 1:** 기본적인 검색 품질 향상, Contextual Retrieval로 맥락 보존, 역량 기반 필터링
- **Phase 2:** 복잡한 질문 처리 가능, 자동 쿼리 최적화, "문제 해결 경험" 질문 대응
- **Phase 3:** 엔터프라이즈 수준의 검색 품질, HyDE로 모호한 쿼리 처리, Reranking으로 정밀도 극대화

---

## 구현 우선순위 및 의존성

```
Phase 1 (기초)
├── 1.1 Relevance Threshold ─────────────┐
├── 1.2 LLM 메타데이터 생성 ─────────────┤
├── 1.3 Contextual Retrieval ────────────┤  NEW
└── 1.4 역량 키워드 추출 ─────────────────┤  NEW
                                          ↓
Phase 2 (Agent)                     데이터 품질 개선 완료
├── 2.1 Tool 정의 (역량 필터링 포함) ────┐
├── 2.2 Agent 로직 구현 ─────────────────┤
└── 2.3 chat.ts 리팩토링 ────────────────┤
                                          ↓
Phase 3 (고급)                      Agent 기반 검색 완료
├── 3.1 하이브리드 검색 (가중치 0.7:0.3) ┐
├── 3.2 Self-RAG 패턴 ───────────────────┤
├── 3.3 캐싱 최적화 ─────────────────────┤
├── 3.4 HyDE ────────────────────────────┤  NEW
└── 3.5 Reranking ───────────────────────┘  NEW
```

---

## 참고 자료

### Anthropic Contextual Retrieval
- [Anthropic - Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)
- [Anthropic Engineering - Contextual Retrieval Deep Dive](https://www.anthropic.com/engineering/contextual-retrieval)

### RAG Best Practices
- [RAG 2025 Enterprise Guide](https://datanucleus.dev/rag-and-agentic-ai/what-is-rag-enterprise-guide-2025)
- [Haystack - Metadata Enrichment for RAG](https://haystack.deepset.ai/cookbook/metadata_enrichment)
- [Dynamic Metadata RAG using LLMs](https://medium.com/@anvesha6496/dynamic-metadata-rag-using-llms-for-metadata-generation-939c3e0fa05b)

### 기존 참고 자료
- [Vercel AI SDK - Tool Calling](https://sdk.vercel.ai/docs/foundations/tools)
- [Google Vertex AI - Gemini](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)
- [Firestore Vector Search](https://firebase.google.com/docs/firestore/vector-search)
- [Self-RAG Paper](https://arxiv.org/abs/2310.11511)
- [Reciprocal Rank Fusion](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf)
