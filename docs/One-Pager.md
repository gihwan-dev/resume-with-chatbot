# [Step 2. 기술 명세서] Dev-Persona: Local-First Edition (v1.1)

## 1. 시스템 아키텍처 (System Architecture)

**"Local Ingest, Cloud Serve"** 전략입니다. 로컬에서 데이터를 가공해 DB에 밀어 넣고, 웹에서는 읽기만 합니다.

1. **Local PC (Data Source):** Cursor(`state.vscdb`), VS Code/Copilot 로그.
2. **CLI Tool (Ingestor):** Node.js 스크립트. 로컬 DB를 읽어 파싱, 임베딩 후 Supabase로 전송.
3. **Database (Supabase):** 벡터 저장소(pgvector) 및 방문자 로그 저장.
4. **Web (Astro):** **MDX 기반** 정적 이력서 + **React 기반** AI 챗봇 인터페이스 (Islands Architecture).

---

## 2. 데이터 파이프라인 (The Local Ingestor)

이 프로젝트의 핵심 엔진입니다. 웹 어드민 페이지 없이, 로컬 터미널에서 명령어 한 줄로 지식을 업데이트합니다.

* **구현 언어:** Node.js (TypeScript)
* **실행 방식:** `npm run sync` (수동 실행)

### A. 데이터 소스 및 추출 전략

1. **Cursor (핵심):**
* **경로:** `~/Library/Application Support/Cursor/User/workspaceStorage/{HASH}/state.vscdb`
* **방법:** `sqlite3` 라이브러리로 직접 접속. `workbench.panel.aichat...` 키의 JSON 데이터를 추출.


2. **VS Code / GitHub Copilot (Codex):**
* **경로:** Cursor와 동일한 구조의 `state.vscdb` (VS Code 폴더 내).
* **방법:** Cursor 추출 로직 재사용 가능.


3. **Claude Code (CLI):**
* **경로:** `~/.claude/history` (또는 설정된 로그 파일).
* **방법:** 텍스트 파일 라인 파싱 (`fs.readFileSync`).



### B. 데이터 가공 (ETL Process)

추출한 Raw Data를 LLM이 이해하기 좋게 다듬습니다.

1. **Cleaning:** 의미 없는 UI 텍스트, 너무 짧은 대화(인사말 등), 민감한 정보(API Key 패턴 매칭) 제거.
2. **Chunking:** 대화 세트(Question + Answer) 단위로 묶음. 토큰이 너무 길면 의미 단위로 분할.
3. **Embedding:** OpenAI `text-embedding-3-small` 모델 사용 (저렴하고 빠름).
4. **Upsert:** Supabase에 `(content, embedding, metadata)` 저장. 중복 방지를 위해 대화 ID를 PK로 활용.

---

## 3. 데이터베이스 스키마 (Supabase)

테이블은 딱 3개만 운영합니다.

### A. `knowledge_base` (RAG용 지식 저장소)

로컬에서 추출한 데이터가 저장되는 곳입니다.

```sql
create table knowledge_base (
  id text primary key,               -- 대화의 고유 ID (Cursor의 message ID 등)
  content text not null,             -- "Q: 리액트 훅 패턴이... A: 그건 말이죠..." (검색용 텍스트)
  source text not null,              -- 'cursor', 'vscode', 'claude-cli'
  project_name text,                 -- 어느 프로젝트에서 나눈 대화인지 (폴더명)
  embedding vector(1536),            -- 벡터 데이터
  created_at timestamptz default now()
);

```

### B. `chat_logs` (방문자 데이터 수집)

채용 담당자가 무엇을 물어봤는지 기록합니다.

```sql
create table chat_logs (
  id uuid default gen_random_uuid() primary key,
  session_id uuid,                   -- 방문자 식별용
  user_question text,                -- 방문자 질문
  ai_answer text,                    -- 내 페르소나의 답변
  retrieved_context text,            -- 답변할 때 참고한 내 과거 기록 (디버깅용)
  created_at timestamptz default now()
);

```

---

## 4. 웹 애플리케이션 (Astro)

Astro의 **Content Collections(MDX)**와 **Islands Architecture**를 활용해 성능과 생산성을 모두 잡습니다.

### A. 기술 스택

* **Framework:** Astro (Output Mode: `server` or `hybrid` for API)
* **Content:** MDX (이력서 및 정적 콘텐츠 관리)
* **UI Integration:** React (챗봇 컴포넌트용 - `client:only` 또는 `client:load`)
* **Styling:** TailwindCSS + Shadcn/ui (React 버전)
* **AI SDK:** Vercel AI SDK (Core & React hooks)

### B. RAG (검색 증강 생성) 로직 (`src/pages/api/chat.ts`)

Astro의 API Endpoint(Server Function)에서 처리합니다.

1. **Input:** 방문자 질문 "이 개발자 FSD 아키텍처 써봤나요?"
2. **Search:** 질문을 임베딩 -> `knowledge_base`에서 유사도 높은 상위 5개 청크 검색 (`rpc` 함수 사용).
3. **System Prompt:**
> "너는 프론트엔드 개발자 최기환의 AI 페르소나다. 아래의 **[Context]**는 최기환이 실제로 과거에 Cursor와 나눈 기술적 대화 로그다. 이 내용을 바탕으로 최기환인 것처럼 답변해라. **[Context]**에 없는 내용은 지어내지 말고 모른다고 해라."


4. **Generate:** GPT-4o-mini로 답변 생성 및 스트리밍 응답 반환 (`TextStream`).
5. **Log:** 답변 완료 후 `chat_logs`에 저장 (비동기 처리).

---

## 5. 단계별 구현 계획 (Roadmap)

### Phase 1: Ingestor (데이터 추출기) - *가장 중요*

* [ ] 로컬 Node.js 프로젝트 생성 (`dev-persona-cli`).
* [ ] `sqlite3`로 내 컴퓨터의 Cursor DB 연결 테스트.
* [ ] 대화 내용 JSON으로 뽑아서 콘솔에 찍어보기.
* [ ] OpenAI Embedding API 연동해서 Supabase에 넣어보기.

### Phase 2: Viewer (이력서 웹 - Astro)

* [ ] Astro 프로젝트 세팅 (`npm create astro@latest`).
* [ ] TailwindCSS 및 React 통합 설정.
* [ ] **MDX** 기반 이력서(경력, 스택) 콘텐츠 작성 및 레이아웃 구현.
* [ ] 우측 하단 챗봇 UI (React + Shadcn)를 Astro Island로 부착 (`client:load`).

### Phase 3: Brain (지능 연결)

* [ ] Supabase Vector Search 함수(RPC) 작성.
* [ ] Astro API Endpoint(`api/chat.ts`)에서 RAG 로직 연결.
* [ ] Vercel 배포 (Adapter 설정: `@astrojs/vercel`).