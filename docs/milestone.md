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

## Current: Work Agent (Notion + ClickUp 연동)
> **Goal:** 포트폴리오 질문에 실제 업무 기록을 참조하여 답변하는 에이전트

### Phase 1: 기반 구축 ✅
- [x] M1-1: API 클라이언트 구현 (NotionClient, ClickUpClient)
- [x] M1-2: 타입 및 환경변수 설정

**구현 완료 (2026-01-24):**
- `web/src/lib/work-agent/types.ts` - 공통 타입 및 WorkAgentError 클래스
- `web/src/lib/work-agent/notion.server.ts` - searchNotionPages(), getNotionPageContent()
- `web/src/lib/work-agent/clickup.server.ts` - searchClickUpTasks(), searchClickUpDocs(), getClickUpTask()
- `web/src/lib/work-agent/index.ts` - 모듈 re-export
- `web/src/env.d.ts` - Astro 환경변수 타입 정의

### Phase 2: 도구 구현
- [ ] M2-1: Notion 도구 (searchNotion, getNotionPage)
- [ ] M2-2: ClickUp 도구 (searchClickUpTasks, searchClickUpDocs)

**Phase 2 작업 노트:**
- API 클라이언트는 이미 구현됨 (`work-agent/*.server.ts`)
- Gemini/Vercel AI SDK의 `tool()` 형태로 래핑 필요
- `web/src/lib/work-agent/tools.ts` 생성 예정
- 도구 스키마 정의 (zod)와 실행 로직 분리 고려

### Phase 3: 에이전트 통합
- [ ] M3-1: createWorkAgent() 및 시스템 프롬프트
- [ ] M3-2: chat.ts에 도구 통합

### Phase 4: 테스트
- [ ] M4-1: 단위/통합 테스트

### 아키텍처
```
chat.ts (Gemini 2.5 Pro + Tool Calling)
├── searchNotion       - Notion Search API로 페이지 검색
├── getNotionPage      - 페이지 콘텐츠 조회
├── searchClickUpTasks - 본인 할당 태스크 검색
└── searchClickUpDocs  - 본인 작성 문서 검색
```

### 파일 구조
```
web/src/lib/work-agent/
├── types.ts              # 공통 타입 정의 ✅
├── notion.server.ts      # Notion API 클라이언트 ✅
├── clickup.server.ts     # ClickUp API 클라이언트 ✅
├── index.ts              # 모듈 export ✅
└── tools.ts              # AI SDK 도구 정의 (Phase 2)
```

### 환경변수
```
NOTION_API_TOKEN      ✅ 설정됨
CLICKUP_API_TOKEN     ✅ 설정됨
CLICKUP_TEAM_ID       ✅ 설정됨
CLICKUP_WORKSPACE_ID  ✅ 설정됨
CLICKUP_USER_ID       ✅ 설정됨
```
