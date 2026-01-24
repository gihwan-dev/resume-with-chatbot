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

## Next: 에이전트 최적화 (Agent Optimization) 🔲
> **Goal:** 검색 품질 강화 및 토큰/비용 최적화
> **Status:** 계획 수립 완료 (2026-01-24)

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

### Phase 1: 검색 품질 강화 (Loop Control) 🔲 ← **우선순위 1**
> `answer` 도구 + `prepareStep` 패턴으로 검색 필수화

**핵심 전략:**
1. `answer` 도구를 `execute` 없이 정의 → 호출 시 에이전트 루프 종료
2. `prepareStep` 콜백으로 단계별 도구 가용성 제어
3. 검색 완료 전에는 `answer` 도구 비활성화

**동작 흐름:**
```
User 질문 → Step 0-1: 검색 강제 → Step 2+: answer 활성화 → 루프 종료
```

**작업 항목:**
- [ ] M1-1: `answer` 도구 정의 (execute 없음)
  ```typescript
  export const answer = tool({
    description: "검색 완료 후 최종 답변을 제공합니다.",
    inputSchema: z.object({
      answer: z.string(),
      searchSummary: z.string().optional(),
      confidence: z.enum(["high", "medium", "low"]),
    }),
    // execute 없음 - 호출 시 루프 종료
  })
  ```
- [ ] M1-2: `prepareStep` 콜백 구현
- [ ] M1-3: 커스텀 `StopCondition` 정의
- [ ] M1-4: 시스템 프롬프트 업데이트
- [ ] M1-5: 테스트 추가

**수정 대상 파일:**
- `web/src/lib/work-agent/tools.ts` - answer 도구 추가
- `web/src/lib/work-agent/index.ts` - export 추가
- `web/src/pages/api/chat.ts` - prepareStep, StopCondition, 프롬프트
- `web/tests/lib/work-agent/tools.test.ts` - 테스트

---

### Phase 2: 토큰 최적화 🔲
> API 응답 필터링 및 TOON 포맷 적용

**작업 항목:**
- [ ] M2-1: API 응답 스키마 필터링
  - ClickUp: `ClickUpTaskSlim` 타입 도입 (필수 필드만)
  - Notion: 불필요한 블록 타입 스킵 (image, video, divider 등)
  - 예상 효과: 토큰 30-50% 절감
- [ ] M2-2: TOON 포맷 적용
  - 10개 이상 결과 시 TOON 포맷으로 자동 전환
  - 예상 효과: 대량 데이터에서 추가 40-60% 절감

**수정 대상 파일:**
- `web/src/lib/work-agent/clickup.server.ts`
- `web/src/lib/work-agent/notion.server.ts`
- `web/src/lib/work-agent/tools.ts`
- `web/src/lib/work-agent/toon-encoder.ts` (신규)

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

### 구현 우선순위
| 순위 | Phase | 작업 | 예상 효과 | 난이도 |
|------|-------|------|----------|--------|
| 1 | Phase 1 | 검색 품질 강화 (Loop Control) | 검색 필수화, 정확도 향상 | 중간 |
| 2 | Phase 2 | API 응답 스키마 필터링 | 토큰 30-50% 절감 | 낮음 |
| 3 | Phase 2 | TOON 포맷 적용 | 토큰 40-60% 추가 절감 | 중간 |
| 4 | Phase 3 | ReAct + Reflexion 패턴 | 정확도/신뢰성 향상 | 중간 |
| 5 | Phase 3 | 동적 시스템 프롬프트 | 맥락 적합성 향상 | 낮음 |
| 6 | Phase 4 | Thinking Budget 최적화 | 비용/속도 최적화 | 중간 |
| 7 | Phase 5 | 평가 프레임워크 | 품질 측정 자동화 | 높음 |

### 검증 방법
1. **Phase 1 검증**: 채팅 테스트로 검색 없이 답변하는지 확인
2. **토큰 사용량 비교**: 최적화 전/후 동일 질문에 대한 토큰 측정
3. **응답 품질 테스트**: 골든 데이터셋으로 품질 점수 비교
4. **단위 테스트**: `pnpm test`
