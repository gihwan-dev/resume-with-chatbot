# Agentic RAG Implementation Milestones

Based on `docs/agentic-rag-implementation-plan.md`

## Phase 1: Foundation (기초 개선) ✅
> **Goal:** 데이터 품질 향상 및 기본적인 검색 필터링 구현

- [x] **M1-1: Relevance Filtering 적용** ✅
  - `web/src/pages/api/chat.ts` 수정
  - 코사인 유사도(Cosine Similarity)를 `distanceMeasure: "COSINE"`으로 설정
  - `RELEVANCE_THRESHOLD = 0.7` 미만 문서 필터링 로직 구현
  - `INITIAL_FETCH_LIMIT = 10`, `MAX_RESULTS = 5` 상수 추가
  - `distanceResultField`로 거리값 추출 → 유사도 변환 (`1 - distance`)
  - Source에 `relevanceScore` 필드 추가

- [x] **M1-2: Contextual Retrieval & Metadata 구현** ✅
  - `web/scripts/upload-vector-db.ts` 수정
  - LLM 기반 메타데이터 생성 (`generateContextualMetadata`): Title, Summary, ContextPrefix
  - **Contextual Retrieval:** 각 청크에 'Context Prefix' 추가 (Anthropic 방식)
  - `<context>` 태그로 감싼 `contextualContent` 생성 및 임베딩
  - Retry 로직 (3회, exponential backoff) 추가

- [x] **M1-3: 역량(Skills) 키워드 추출기 구현** ✅
  - `web/scripts/upload-vector-db.ts` 수정
  - `extractSkills` 함수: `skills`, `techStack`, `projectType` 자동 추출
  - `generateFullMetadata`: 두 LLM 호출을 병렬 실행
  - Rate limiting: docs 500ms, chat 배치(5개) 1000ms

- [x] **M1-4: 데이터 재색인 (Re-indexing)** ⏳
  - 기존 벡터 데이터 삭제
  - 개선된 스크립트로 전체 데이터 재업로드 및 임베딩
  - **실행 명령:** `cd web && pnpm run upload-db`

### Phase 1 Notes
> **다음 작업 전 확인 사항:**
> 1. `pnpm run upload-db` 실행하여 데이터 재색인 완료 필요
> 2. Firestore Console에서 새 필드 확인: `contextualContent`, `summary`, `contextPrefix`, `skills`, `techStack`, `projectType`
> 3. 웹에서 채팅 테스트하여 `relevanceScore` 로깅 확인
> 4. `distanceResultField`가 Firestore SDK 버전에서 지원되지 않을 경우, 폴백 로직 필요할 수 있음

---

## Phase 2: Agentic RAG (Tool Calling 기반 Agent) ✅
> **Goal:** 사용자의 의도를 파악하고 도구를 사용하는 지능형 Agent 구축

- [x] **M2-1: RAG Tools 정의** ✅
  - `web/src/lib/rag-agent/` 디렉토리 생성
    - `types.ts`: TypeScript 타입 정의 (QueryAnalysis, SearchResult, EvaluationResult 등)
    - `prompts.ts`: Agent 시스템 프롬프트
    - `tools.ts`: 4개 Tool 정의
    - `index.ts`: Agent 생성 및 내보내기
  - `analyzeQueryTool`: 쿼리 분석 및 의도/필터 키워드 추출
  - `searchKnowledgeTool`: 벡터 검색 + 메타데이터(skills, techStack, projectType) 필터링
  - `evaluateResultsTool`: 검색 결과 적합성 평가 및 suggestedAction 제안
  - `rewriteQueryTool`: 쿼리 재작성 (broaden, narrow, rephrase, decompose 전략)

- [x] **M2-2: Agent 실행 로직 구현** ✅
  - `web/src/pages/api/chat.ts` 리팩토링
  - `createRAGAgent()`로 Agent 생성, `streamText`에 tools 전달
  - `maxSteps: 5` 설정으로 Tool Calling 루프 구현
  - `onStepFinish` 콜백에서 searchKnowledge 결과로 sources 수집 및 클라이언트 전송
  - 시스템 프롬프트에 Agent 역할 및 Tool 사용 전략 정의

- [x] **M2-3: Agent 동작 테스트** ✅
  - 단순 질문 ("React란?") vs 복합 질문 ("상태관리 최적화 경험 알려줘") 테스트
  - Tool 호출 체인 확인 (Analyze -> Search -> Evaluate -> Answer)
  - 콘솔 로그로 Tool 호출 순서 및 결과 확인 가능

### Phase 2 Notes
> **구현 완료. 테스트 방법:**
> ```bash
> # 1. 개발 서버 실행
> cd web && pnpm dev
>
> # 2. 채팅 테스트 예시
> # - 단순 질문: "React란?"
> # - 복합 질문: "상태관리 최적화 경험 알려줘"
> # - 기술 필터: "TypeScript로 만든 프로젝트"
>
> # 3. 콘솔 로그 확인
> # - [analyzeQuery] 쿼리 분석 결과
> # - [searchKnowledge] 벡터 검색 결과
> # - [evaluateResults] 평가 결과
> # - [Agent] Tool 호출 순서
> ```

---

## Phase 3: Advanced Features (고급 기능)
> **Goal:** 검색 정밀도 극대화 및 시스템 프롬프트 최적화

- [ ] **M3-1: Hybrid Search 구현**
  - `web/src/lib/search-utils.ts` 생성
  - Vector Search + Contextual BM25 (Keyword Search)
  - RRF(Reciprocal Rank Fusion) 알고리즘으로 결과 병합 (가중치 0.7 : 0.3)

- [ ] **M3-2: HyDE (Hypothetical Document Embeddings)**
  - 모호한 쿼리에 대해 가상 답변 생성 후 임베딩 검색
  - `hydeSearch` 함수 구현 및 Tool 통합

- [ ] **M3-3: Reranking (Cross-Encoder)**
  - 검색된 후보군(Top 15)에 대해 LLM 기반 Re-scoring
  - 최종 Top 5 선별 로직 구현

- [ ] **M3-4: Caching & Performance**
  - `web/src/lib/cache.ts` 생성
  - `lru-cache` 도입: 임베딩 결과 및 검색 결과 캐싱
  - 응답 속도 최적화 확인
