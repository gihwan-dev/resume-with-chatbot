# Agentic RAG Implementation Milestones

Based on `docs/agentic-rag-implementation-plan.md`

---

## RAG 시스템 폐기 결정

### 결정 일자
2026-01-24

### 결정 이유: 데이터 품질 문제

RAG 시스템의 데이터 소스를 분석한 결과, 핵심적인 문제가 발견됨:

**채팅 히스토리 데이터의 본질적 한계:**
- `collected-histories/all-portfolio-2026-01-22T12-30-39.json` (1,342개 대화)
- 실제 내용: Claude Code와의 **코드 디버깅 세션**
  ```
  "@src/shared/api 에 수정 사항이 하나 필요해..."
  "아니아니 애니 타입 에러는 수정하지 말자..."
  "pnpm run test:unit run 을 실행해야해..."
  ```
- **이력서/포트폴리오 정보가 아닌 작업 지시 로그**
- 파일 경로, 디버깅 명령어, 문맥 의존적 대화가 대부분

**PDF 이력서와의 대비:**
- `docs/랠릿프로필-최기환의 프로필 (6).pdf`는 구조화된 좋은 데이터
- 하지만 채팅 히스토리가 knowledge_base를 오염시킴

### 결론
> 채팅 히스토리에서 의미있는 포트폴리오 정보를 추출하는 것은 근본적으로 불가능.
> RAG 시스템의 복잡도 대비 실질적 가치가 낮음.
> **단순 AI 질의응답으로 전환하여 유지보수성 확보.**

### 삭제된 파일
- `web/src/lib/rag-agent/` (전체 디렉토리)
- `web/src/lib/search-utils.ts`
- `web/src/lib/cache.ts`
- `web/scripts/upload-vector-db.ts`
- `web/tests/lib/rag-agent/tools.test.ts`
- `web/tests/lib/search-utils.test.ts`
- `web/tests/lib/cache.test.ts`

---

## Phase 1: Foundation (기초 개선) ⚠️ DEPRECATED
> **Status:** 작업은 완료되었으나 RAG 폐기 결정으로 더 이상 사용하지 않음

- [x] ~~M1-1: Relevance Filtering 적용~~
- [x] ~~M1-2: Contextual Retrieval & Metadata 구현~~
- [x] ~~M1-3: 역량(Skills) 키워드 추출기 구현~~
- [x] ~~M1-4: 데이터 재색인 (Re-indexing)~~

---

## Phase 2: Agentic RAG (Tool Calling 기반 Agent) ⚠️ DEPRECATED
> **Status:** 작업은 완료되었으나 RAG 폐기 결정으로 더 이상 사용하지 않음

- [x] ~~M2-1: RAG Tools 정의~~
- [x] ~~M2-2: Agent 실행 로직 구현~~
- [x] ~~M2-3: Agent 동작 테스트~~

---

## Phase 3: Advanced Features (고급 기능) ⚠️ DEPRECATED
> **Status:** 작업은 완료되었으나 RAG 폐기 결정으로 더 이상 사용하지 않음

- [x] ~~M3-1: Hybrid Search 구현~~
- [x] ~~M3-2: HyDE (Hypothetical Document Embeddings)~~
- [x] ~~M3-3: Reranking (Cross-Encoder)~~
- [x] ~~M3-4: Caching & Performance~~

---

## Current: Simple AI Q&A ✅
> **Goal:** 단순하고 유지보수하기 쉬운 AI 질의응답 시스템

### 구현 완료
- [x] RAG 시스템 제거 및 코드 정리
- [x] `chat.ts` 단순화 (~65줄)
- [x] 불필요한 의존성 제거 (`lru-cache`)
- [x] 테스트 설정 정리

### 현재 아키텍처
```
web/src/pages/api/chat.ts
├── Vertex AI (Gemini 2.5 Pro) 연동
├── 단순 시스템 프롬프트
└── streamText 기반 응답
```

### 장점
| 항목 | Before (RAG) | After (Simple Q&A) |
|------|--------------|---------------------|
| 코드량 | ~2,500줄 | ~65줄 |
| 파일 수 | 12개+ | 1개 |
| 의존성 | lru-cache, firebase-admin (vector) | 기본만 |
| 복잡도 | Tool Calling + RAG Pipeline | 단순 Q&A |
| 유지보수 | 높음 | 낮음 |

---

## Current: Work Agent (Notion + ClickUp 연동) ✅
> **Goal:** 포트폴리오 질문에 실제 업무 기록을 참조하여 답변하는 에이전트
> **Status:** 구현 완료 (2026-01-24)

### Phase 1: 기반 구축 ✅
- [x] M1-1: API 클라이언트 구현 (NotionClient, ClickUpClient)
- [x] M1-2: 타입 및 환경변수 설정

**구현 완료 (2026-01-24):**
- `web/src/lib/work-agent/types.ts` - 공통 타입 및 WorkAgentError 클래스
- `web/src/lib/work-agent/notion.server.ts` - searchNotionPages(), getNotionPageContent()
- `web/src/lib/work-agent/clickup.server.ts` - searchClickUpTasks(), searchClickUpDocs(), getClickUpTask()
- `web/src/lib/work-agent/index.ts` - 모듈 re-export
- `web/src/env.d.ts` - Astro 환경변수 타입 정의

### Phase 2: 도구 구현 ✅
- [x] M2-1: Notion 도구 (searchNotion, getNotionPage)
- [x] M2-2: ClickUp 도구 (searchClickUpTasks, searchClickUpDocs)

**구현 완료 (2026-01-24):**
- `web/src/lib/work-agent/tools.ts` - 4개 AI 도구 정의
  - `searchNotion` - Notion 페이지 검색
  - `getNotionPage` - Notion 페이지 상세 조회
  - `searchClickUpTasks` - 할당된 태스크 검색
  - `searchClickUpDocs` - 작성한 문서 검색
- `workAgentTools` 객체로 통합 export

**기술 노트:**
- Vercel AI SDK v6에서는 `parameters` 대신 `inputSchema` 사용
- Zod 스키마로 파라미터 정의, 타입 자동 추론
- `createErrorResponse()` 유틸리티로 에러를 LLM이 이해할 수 있는 구조화된 응답으로 변환
- `RATE_LIMIT` 에러는 `retryable: true`로 표시

### Phase 3: 에이전트 통합 ✅
- [x] M3-1: chat.ts에 workAgentTools 통합
- [x] M3-2: 시스템 프롬프트 업데이트 (도구 사용 지침 추가)

**구현 완료 (2026-01-24):**
- `web/src/pages/api/chat.ts` 수정
  - `workAgentTools` import 및 `streamText()`의 `tools` 옵션에 전달
  - `maxSteps: 5` 설정으로 다중 도구 호출 허용
  - 시스템 프롬프트에 도구 사용 가이드 섹션 추가
    - searchNotion: 프로젝트 상세, 기술적 의사결정, 업무 노트 검색
    - getNotionPage: 특정 페이지 상세 내용 조회
    - searchClickUpTasks: 현재 진행 중인 업무, 완료된 태스크 확인
    - searchClickUpDocs: 기술 문서, 회의록 검색
  - 도구 사용 시 주의사항 추가 (기본 정보는 도구 없이, 에러 대응 등)

### Phase 4: 테스트 ✅
- [x] M4-1: 단위/통합 테스트 (14개 테스트 통과)

### 아키텍처
```
web/src/pages/api/chat.ts (Gemini 2.5 Pro + Tool Calling)
├── workAgentTools 통합 (maxSteps: 5)
├── searchNotion       - Notion Search API로 페이지 검색
├── getNotionPage      - 페이지 콘텐츠 조회
├── searchClickUpTasks - 본인 할당 태스크 검색
└── searchClickUpDocs  - 본인 작성 문서 검색
```

### 파일 구조
```
web/src/
├── pages/api/chat.ts         # AI 에이전트 엔드포인트 ✅
└── lib/work-agent/
    ├── types.ts              # 공통 타입 정의 ✅
    ├── notion.server.ts      # Notion API 클라이언트 ✅
    ├── clickup.server.ts     # ClickUp API 클라이언트 ✅
    ├── tools.ts              # AI SDK 도구 정의 ✅
    └── index.ts              # 모듈 export ✅
```

### 환경변수
```
NOTION_API_TOKEN      ✅ 설정됨
CLICKUP_API_TOKEN     ✅ 설정됨
CLICKUP_TEAM_ID       ✅ 설정됨
CLICKUP_WORKSPACE_ID  ✅ 설정됨
CLICKUP_USER_ID       ✅ 설정됨
```

---

## Current: 에이전트 최적화 (Agent Optimization) 🔄
> **Goal:** 검색 품질 강화 및 토큰/비용 최적화
> **Status:** Phase 1 완료 (2026-01-24)

### 배경
현재 에이전트의 두 가지 문제:
1. `toolChoice: "auto"`로 설정되어 검색 없이 답변 가능
2. API 응답에 불필요한 필드가 많아 토큰 낭비

### 참고 자료
- [Vercel AI SDK Loop Control](https://ai-sdk.dev/docs/agents/loop-control) - stopWhen, prepareStep, StopCondition
- [TOON Format](https://github.com/toon-format/toon) - JSON 대비 40-60% 토큰 절감
- [Gemini Thinking Models](https://ai.google.dev/gemini-api/docs/thinking) - thinkingBudget 조절
- [ReAct Framework](https://react-lm.github.io/) - Reasoning + Acting 패턴

---

### Phase 1: 검색 품질 강화 (Loop Control) ✅
> `answer` 도구 + `prepareStep` 패턴으로 검색 필수화
> **Status:** 구현 완료 (2026-01-24)

**핵심 전략:**
1. `answer` 도구를 `execute` 없이 정의 → 호출 시 에이전트 루프 종료
2. `prepareStep` 콜백으로 단계별 도구 가용성 제어
3. 검색 완료 전에는 `answer` 도구 비활성화

**동작 흐름:**
```
User 질문 → Step 0: 검색 도구만 (toolChoice: required)
          → Step 1+: 검색 완료 시 answer 활성화 (toolChoice: auto)
          → answer 호출 시 루프 종료
```

**작업 항목:**
- [x] M1-1: `answer` 도구 정의 (execute 없음)
  ```typescript
  export const answer = tool({
    description: "검색 완료 후 최종 답변을 제공합니다.",
    inputSchema: z.object({
      answer: z.string(),
      sources: z.array(z.object({
        type: z.enum(["notion", "clickup_task", "clickup_doc", "resume"]),
        title: z.string(),
        id: z.string().optional(),
      })),
      confidence: z.enum(["high", "medium", "low"]),
    }),
    // execute 없음 - 호출 시 루프 종료
  })
  ```
- [x] M1-2: `prepareStep` 콜백 구현
- [x] M1-3: `stopWhen` 조건 정의 (`hasToolCall("answer")` + `stepCountIs(15)`)
- [x] M1-4: 시스템 프롬프트 업데이트 (answer 도구 사용 가이드 추가)
- [x] M1-5: 테스트 추가 (answer 도구 스키마 검증 5개 테스트)

**수정된 파일:**
- `web/src/lib/work-agent/tools.ts` - answer 도구 추가, answerSchema 정의
- `web/src/lib/work-agent/index.ts` - answer export 추가
- `web/src/pages/api/chat.ts` - prepareStep, stopWhen, 프롬프트 업데이트
- `web/tests/lib/work-agent/tools.test.ts` - answer 도구 테스트 5개 추가

**Note for Next Phase:**
- `hasToolCall` 유틸리티는 `ai` 패키지에서 import하여 사용
- `prepareStep`의 반환 타입은 `activeTools`가 tool name literal의 배열이어야 함 (`ToolName[]`)
- `as const` 대신 명시적 타입 `ToolName[]`을 사용해야 타입 오류 방지
- Step 0에서 `toolChoice: "required"`로 검색 강제, 검색 완료 후 `toolChoice: "auto"`로 전환
- maxSteps 20 → 15로 조정 (stopWhen 배열 사용)

---

### Phase 2: 토큰 최적화 ✅
> API 응답 필터링 및 TOON 포맷 적용
> **Status:** 구현 완료 (2026-01-25)

**작업 항목:**
- [x] M2-1: API 응답 스키마 필터링
  - ClickUp: `ClickUpTaskSlim`, `ClickUpDocSlim` 타입 도입
  - Notion: `NotionPageSlim`, `NotionBlockSlim` 타입 도입
  - Notion 블록: image, video, divider, breadcrumb, table_of_contents 스킵
  - MAX_BLOCK_DEPTH: 3 → 2 축소
  - 불필요 필드 제거: createdTime, parentType, parentId, dateCreated, dateUpdated, color 등
- [x] M2-2: TOON 포맷 적용
  - `@toon-format/toon` 패키지 설치
  - `toon-encoder.ts` 모듈 생성 (encodeArrayResult, createFormatHint)
  - 10개 이상 결과 시 TOON 포맷 자동 적용
  - 응답 구조: `{ format: "json" | "toon", formatHint, data, ... }`

**측정 결과 (2026-01-25):**
| 시나리오 | Before | After | 절감율 |
|----------|--------|-------|--------|
| 적은 결과 (5개) - JSON | 8,198 bytes | 5,258 bytes | **36%** |
| 많은 결과 (15개) - TOON | 24,636 bytes | 15,124 bytes | **39%** |
| Notion 페이지 (30블록) | 4,807 bytes | 2,912 bytes | **39%** |
| **전체 합계** | 37,641 bytes (~12,547 tokens) | 23,294 bytes (~7,765 tokens) | **38%** |

**수정된 파일:**
- `web/src/lib/work-agent/types.ts` - Slim 타입 4개 추가
- `web/src/lib/work-agent/notion.server.ts` - MAX_BLOCK_DEPTH 축소, extractBlockContent 개선, fetchAllBlocksSlim, NotionPageContentSlim
- `web/src/lib/work-agent/clickup.server.ts` - (변경 없음, tools.ts에서 Slim 매핑)
- `web/src/lib/work-agent/tools.ts` - TOON 인코딩 적용, 불필요 필드 제거
- `web/src/lib/work-agent/toon-encoder.ts` - 신규 생성
- `web/src/lib/work-agent/index.ts` - Slim 타입 및 toon-encoder export 추가
- `web/tests/lib/work-agent/toon-encoder.test.ts` - 신규 (7개 테스트)
- `web/tests/lib/work-agent/toon-integration.test.ts` - 신규 (6개 통합 테스트)
- `web/tests/lib/work-agent/tools.test.ts` - 응답 구조 변경에 따른 수정
- `web/scripts/measure-token-savings.ts` - 측정 스크립트

**Note for Next Phases:**
- TOON 포맷 임계값은 `TOON_THRESHOLD = 10`으로 설정됨 (toon-encoder.ts)
- searchClickUpDocs에서 content truncate 제거됨 - 전체 내용 전달 (TOON 압축으로 상쇄)
- `import.meta.env` 사용으로 인해 직접 스크립트 실행 어려움 - vitest 환경에서 테스트 필요
- 측정 스크립트: `npx tsx scripts/measure-token-savings.ts`
- 전체 테스트: `pnpm test` (50개 테스트 통과)

---

### Phase 3: 추론 품질 향상 🔲
> ReAct 패턴 및 동적 프롬프트

**작업 항목:**
- [ ] M3-1: ReAct + Reflexion 패턴 적용
  - 자기 검증 프로토콜 프롬프트 추가
  - `prepareStep`으로 반복 호출 감지 및 제어
  - 3단계 연속 같은 도구 호출 시 다른 도구로 유도
- [ ] M3-2: 동적 시스템 프롬프트
  - 의도 분류: career_inquiry, technical_inquiry, contact_inquiry, general_chat
  - 의도별 페르소나 전환

**수정 대상 파일:**
- `web/src/pages/api/chat.ts`
- `web/src/lib/work-agent/prompts.ts` (신규)

---

### Phase 4: 비용/성능 최적화 🔲
> Thinking Budget 및 검증 루프

**작업 항목:**
- [ ] M4-1: Thinking Budget 동적 조절
  - 간단한 질문: 낮은 thinkingBudget
  - 기술 질문: 높은 thinkingBudget (최대 24576)
- [ ] M4-2: Zod 검증 루프
  - 도구 응답 스키마 정의 (discriminated union)
  - `validateAndRecover()` 래퍼로 검증 실패 시 graceful degradation

**수정 대상 파일:**
- `web/src/pages/api/chat.ts`
- `web/src/lib/work-agent/tools.ts`

---

### Phase 5: 평가 프레임워크 🔲
> 품질 측정 자동화

**작업 항목:**
- [ ] M5-1: 품질 평가 테스트
  - 골든 데이터셋 10개 질문 정의
  - 평가 지표: 키워드 커버리지(30%), 도구 호출 정확도(20%), 응답 관련성(25%), 환각 없음(25%)
- [ ] M5-2: 런타임 메트릭 수집
  - 토큰 사용량, 도구 호출 분포, 성공률 추적

**수정 대상 파일:**
- `web/tests/lib/work-agent/evaluation.test.ts` (신규)
- `web/src/lib/work-agent/metrics.ts` (신규)

---

### Phase 6: 환각 방지 (Hallucination Prevention) ✅
> **Goal**: 맥락 분리, 출처 검증, 정보 완전성 확보를 통한 환각 최소화
> **Status:** Phase 6-1 ~ 6-5 전체 구현 완료 (2026-01-25)

#### 배경
현재 에이전트의 문제:
1. 검색은 잘 수행하지만 다양한 맥락을 뒤섞어 답변
2. 회사의 레거시 작업과 차세대 작업 내용 혼동
3. 거짓 정보 생성 (환각)

#### 참고 자료
- [MDPI: Hallucination Mitigation Review](https://www.mdpi.com/2227-7390/13/5/856) - RAG 환각 원인 분류 및 완화 기법
- [Microsoft: Best Practices for LLM Hallucinations](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/best-practices-for-mitigating-hallucinations-in-large-language-models-llms/4403129) - Grounding & Attribution
- [Zep: Reducing LLM Hallucinations](https://www.getzep.com/ai-agents/reducing-llm-hallucinations/) - Temporal Knowledge Graph
- [MEGA-RAG](https://pmc.ncbi.nlm.nih.gov/articles/PMC12540348/) - Multi-Evidence Verification

---

#### Phase 6-1: 맥락 분리 및 프롬프트 강화 ✅
> ClickUp Space/Folder 이름 기반 맥락 구분
> **Status:** 구현 완료 (2026-01-25)

**작업 항목:**
- [x] M6-1-1: 시스템 프롬프트에 프로젝트 맥락 구분 추가
- [x] M6-1-2: 검색 결과에 맥락 힌트 자동 부여
  - `inferProjectContext(spaceName, folderName)` 유틸리티 함수 구현
  - `context: "legacy" | "next-gen" | "unknown"` 필드 ClickUpTaskSlim에 추가
  - 레거시 키워드: FE1팀, FE1, MaxGauge
  - 차세대 키워드: 차세대, DataGrid, 디자인시스템, Dashboard

**수정된 파일:**
- `web/src/pages/api/chat.ts` - 시스템 프롬프트에 맥락 구분 섹션 추가
- `web/src/lib/work-agent/tools.ts` - inferProjectContext 함수 및 context 필드 추가
- `web/src/lib/work-agent/types.ts` - ProjectContext 타입 정의
- `web/tests/lib/work-agent/tools.test.ts` - inferProjectContext 테스트 5개 추가

---

#### Phase 6-2: 불확실성 표현 강제 ✅
> 추측 대신 "모름" 답변 유도
> **Status:** 구현 완료 (2026-01-25)

**작업 항목:**
- [x] M6-2-1: confidence 기반 답변 포맷 강제
  - high: 그대로 답변, 출처 명시
  - medium: "검색 결과에 따르면 ~이며, 상세 내용은 확인 필요"
  - low: 절대 추측 금지, "정보 없음" 명시
- [x] M6-2-2: 검색 실패 시 명시적 응답 템플릿

**수정된 파일:**
- `web/src/pages/api/chat.ts` - confidence 기반 답변 규칙 프롬프트 추가

---

#### Phase 6-3: 정보 완전성 확보 ✅
> Truncation 정보 손실 방지
> **Status:** Phase 2에서 이미 해결됨 (content truncate 제거)

**구현 내용:**
- [x] searchClickUpDocs에서 content truncation 완전 제거 (Phase 2에서 처리)
- [x] TOON 포맷 압축으로 토큰 절감 효과 유지

---

#### Phase 6-4: 시간 기반 맥락 ✅
> 시간순 정보 구분
> **Status:** 구현 완료 (2026-01-25)

**작업 항목:**
- [x] M6-4-1: 검색 결과에 시간 정보 강조
  - `calculateTimeContext(dateString)` 유틸리티 함수 구현
  - `calculateRelativeTime(dateString)` 유틸리티 함수 구현
  - `timeContext: "recent" | "older" | "archive"` (3개월/12개월 기준)
  - `relativeTime: "오늘 수정", "3일 전 수정", "2주 전 수정" 등`
- [x] M6-4-2: 시간 기반 프롬프트 가이드
- [x] M6-4-3: 충돌 정보 처리 규칙 (최신 정보 우선)

**수정된 파일:**
- `web/src/lib/work-agent/tools.ts` - calculateTimeContext, calculateRelativeTime 함수 추가
- `web/src/lib/work-agent/types.ts` - TimeContext 타입, Slim 타입에 시간 필드 추가
- `web/src/pages/api/chat.ts` - 시간 기반 처리 규칙 프롬프트 추가
- `web/tests/lib/work-agent/tools.test.ts` - 시간 맥락 테스트 10개 추가

---

#### Phase 6-5: 출처 검증 및 Grounding ✅
> 검색 결과와 답변 일치성 보장
> **Status:** 구현 완료 (2026-01-25)

**작업 항목:**
- [x] M6-5-1: 검색 결과 추적 시스템 도입
  - `SearchContext` 인터페이스 정의 (notionPageIds, clickupTaskIds, clickupDocIds)
  - `createSearchContext()` - 빈 SearchContext 생성
  - `buildSearchContextFromSteps(steps)` - 전체 step에서 검색된 ID 누적
  - TOON/JSON 포맷 모두 지원하는 ID 추출 (extractNotionPageIds, extractClickUpTaskIds 등)

- [x] M6-5-2: answer 도구에 출처 검증 로직 추가
  - `createAnswerTool(getSearchContext)` 팩토리 함수 구현
  - `validateSources(sources, context)` - 출처 ID가 검색 결과에 존재하는지 검증
  - 검증 규칙:
    - resume 타입: 항상 유효 (ID 불필요)
    - ID 없는 출처: 경고 추가, 유효로 처리
    - 검색된 ID와 일치: 유효
    - 검색되지 않은 ID: 무효, 경고 생성
  - 응답에 `validation: { isValid, warnings, invalidSourceCount }` 포함
  - `onStepFinish`에서 검증 경고 로깅

- [x] M6-5-3: 인용 필수화 프롬프트 추가
  - sources에 실제 검색된 ID 포함 필수 규칙
  - 올바른/잘못된 출처 예시 제공

**수정된 파일:**
- `web/src/lib/work-agent/types.ts` - SearchContext, AnswerSource, SourceValidationResult 타입 추가
- `web/src/lib/work-agent/source-tracker.ts` - 신규 생성 (ID 추출 및 검증 유틸리티)
- `web/src/lib/work-agent/tools.ts` - createAnswerTool 팩토리 함수 추가
- `web/src/lib/work-agent/index.ts` - source-tracker exports 추가
- `web/src/pages/api/chat.ts` - SearchContext 추적, 동적 answer 도구, 프롬프트 업데이트
- `web/tests/lib/work-agent/source-tracker.test.ts` - 신규 (26개 테스트)
- `web/tests/lib/work-agent/tools.test.ts` - createAnswerTool 테스트 5개 추가

---

### 구현 우선순위
| 순위 | Phase | 작업 | 예상 효과 | 난이도 | 상태 |
|------|-------|------|----------|--------|------|
| 1 | Phase 1 | 검색 품질 강화 (Loop Control) | 검색 필수화, 정확도 향상 | 중간 | ✅ 완료 |
| 2 | Phase 2 | 토큰 최적화 (Slim 타입 + TOON) | 토큰 38% 절감 | 낮음-중간 | ✅ 완료 |
| 3 | Phase 6-1 | 맥락 분리 프롬프트 | 레거시/차세대 혼동 80% 감소 | 낮음 | ✅ 완료 |
| 4 | Phase 6-2 | 불확실성 표현 강제 | 추측성 답변 제거 | 낮음 | ✅ 완료 |
| 5 | Phase 6-3 | 정보 완전성 확보 | Truncation 손실 방지 | 중간 | ✅ 완료 |
| 6 | Phase 6-4 | 시간 기반 맥락 | 시간순 정보 구분 | 낮음-중간 | ✅ 완료 |
| 7 | Phase 6-5 | 출처 검증 시스템 | 환각 대폭 감소 | 중간-높음 | ✅ 완료 |
| 8 | Phase 3 | ReAct + Reflexion 패턴 | 정확도/신뢰성 향상 | 중간 | 🔲 ← **다음** |
| 9 | Phase 3 | 동적 시스템 프롬프트 | 맥락 적합성 향상 | 낮음 | 🔲 |
| 10 | Phase 4 | Thinking Budget 최적화 | 비용/속도 최적화 | 중간 | 🔲 |
| 11 | Phase 5 | 평가 프레임워크 | 품질 측정 자동화 | 높음 | 🔲 |

### 검증 방법
1. **Phase 1 검증**: 채팅 테스트로 검색 없이 답변하는지 확인 ✅
2. **Phase 2 검증**: 토큰 절감 측정 ✅
   - `npx tsx scripts/measure-token-savings.ts` 실행
   - 결과: 38% 토큰 절감 확인
3. **Phase 6 검증**: 환각 테스트 시나리오 ✅
   - "MaxGauge에서 React를 사용했나요?" → 정확히 "아니오, ExtJS"
   - 레거시/차세대 혼동 없이 명확히 구분된 답변
   - 검색 결과 없는 질문 → 추측 없이 "정보 없음"
4. **Phase 6-5 검증**: 출처 검증 로깅 확인 ✅
   - 환각 ID 사용 시 `[Source Validation Warnings]` 로그 출력
   - `validation.isValid = false` 및 경고 메시지 확인
5. **토큰 사용량 비교**: 최적화 전/후 동일 질문에 대한 토큰 측정
6. **응답 품질 테스트**: 골든 데이터셋으로 품질 점수 비교
7. **단위 테스트**: `pnpm test` (99개 테스트 통과, 통합 테스트 타임아웃 제외)

---

### 다음 페이즈 작업 참고사항

#### Phase 3 (추론 품질) 구현 시 참고 ← **다음 우선순위**
1. **응답 구조 변경됨**: tools.ts의 응답에 format, formatHint 필드 추가됨
2. **prepareStep 활용**: Phase 1에서 이미 구현됨 - 확장 가능
3. **환각 방지 필드**: context, timeContext, relativeTime 필드로 맥락 파악 용이
4. **출처 검증 활용**: `createAnswerTool`의 validation 결과로 환각 탐지 가능

#### Phase 4 (비용 최적화) 구현 시 참고
1. **측정 스크립트 존재**: `scripts/measure-token-savings.ts`로 before/after 비교 가능
2. **토큰 추정식**: ~3 bytes = 1 token (영어/한글 평균)

#### Phase 6 완료 요약 (2026-01-25)
- **추가된 유틸리티 함수**: `inferProjectContext`, `calculateTimeContext`, `calculateRelativeTime`, `createSearchContext`, `buildSearchContextFromSteps`, `validateSources`
- **추가된 타입**: `ProjectContext`, `TimeContext`, `SearchContext`, `AnswerSource`, `SourceValidationResult`
- **신규 모듈**: `source-tracker.ts` (ID 추출 및 출처 검증)
- **팩토리 함수**: `createAnswerTool(getSearchContext)` - 동적 출처 검증
- **Slim 타입 확장**: `context`, `dateUpdated`, `timeContext`, `relativeTime` 필드 추가
- **시스템 프롬프트**: 맥락 구분, 시간 기반 처리, confidence 기반 답변 규칙, 출처 ID 필수 규칙 추가
- **테스트**: 99개 전체 통과 (source-tracker 26개, tools 46개 포함)
