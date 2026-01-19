# [Step 2. 기술 명세서] Dev-Persona: Local-First Edition (v2.0)

## 1. 시스템 아키텍처 (System Architecture)

**"Static Core, Dynamic Islands"** 전략입니다. 이력서는 정적(Static)으로 빌드하여 CDN에 캐싱하고, AI 기능만 서버리스로 수행합니다.

1. **Local PC (Data Source):** Cursor(`state.vscdb`), VS Code/Copilot 로그.
2. **CLI Tool (Ingestor):** Node.js 스크립트. 로컬 DB 파싱 → 정제 → 임베딩 → Supabase Sync.
3. **Database (Supabase):**
* `knowledge_base` (pgvector): 내 기술적 자아.
* `chat_logs`: 채용 담당자 관심사 분석 데이터.


4. **Web (Astro):** **MDX 기반** 이력서(SSG) + **React** AI 챗봇(SSR/Island).

---

## 2. 데이터 파이프라인 (The Local Ingestor)

웹 어드민 없이 로컬 터미널(`npm run sync`)로 제어합니다. **(개선: 비용 절감 및 보안 로직 추가)**

* **구현 언어:** Node.js (TypeScript)

### A. 데이터 소스 및 추출 전략 (Source)

1. **Cursor & VS Code:** `state.vscdb` (SQLite) 직접 조회.
2. **Claude CLI:** 로그 파일 파싱.
3. **[New] .personaignore:** `.gitignore` 처럼 특정 프로젝트 폴더나 민감한 파일 경로를 배제하는 설정 파일 도입 (보안 강화).

### B. 데이터 가공 (ETL Process)

**"Garbage In, Garbage Out"**을 방지하기 위한 전처리 강화.

1. **Cleaning & Sanitizing:**
* 기본적인 UI 텍스트 제거.
* **PII Masking:** 이메일, 전화번호, AWS Key 등 민감 정보 정규식으로 마스킹 처리.


2. **Smart Chunking:** 단순 길이 자르기가 아닌, 의미론적(Semantic) 청킹 시도 (마침표, 개행, 코드 블록 기준).
3. **Deduplication (비용 절감 핵심):**
* 콘텐츠의 **Hash(SHA-256)**를 생성하여 기존 DB와 비교.
* 변경된 데이터만 Embedding API를 호출하여 OpenAI 비용 최소화.


4. **Upsert:** Supabase에 저장. (Hash 값도 메타데이터로 저장하여 추후 비교에 사용).

---

## 3. 데이터베이스 스키마 (Supabase)

### A. `knowledge_base` (RAG Knowledge)

메타데이터 필드를 JSONB로 확장하여 유연성을 확보합니다.

```sql
create table knowledge_base (
  id uuid default gen_random_uuid() primary key,
  content text not null,             -- 실제 청크 데이터
  embedding vector(1536),            -- OpenAI Embedding
  metadata jsonb,                    -- { source: 'cursor', project: 'blog', file_type: 'ts', timestamp: ... }
  content_hash text,                 -- [New] 중복 임베딩 방지용 해시
  created_at timestamptz default now()
);

```

### B. `chat_logs` (Analytics)

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

## 4. 웹 애플리케이션 (Astro v5)

### A. 기술 스택

* **Framework:** **Astro** (Adapter: `@astrojs/vercel`)
* **Rendering:** Hybrid (기본 Static, API/Chat만 Server)
* **Content:** **Content Collections (MDX)** - 이력서 데이터 타입 안정성 확보.
* **UI Component:** **React** (챗봇 위젯용) + Shadcn/ui.
* **AI SDK:** Vercel AI SDK (Core + React Hooks).

### B. RAG 로직 (`src/pages/api/chat.ts`)

Astro의 API Endpoint 기능을 사용합니다.

1. **API Route:** `export const POST`로 엔드포인트 생성.
2. **Context Injection:**
* User Question 임베딩.
* Supabase RPC로 유사 청크 검색.
* 검색된 청크의 `metadata.project` 정보를 포함하여 답변의 신뢰도 상승 ("A 프로젝트를 진행할 때...").


3. **Prompt Engineering:**
> "당신은 개발자 [이름]입니다. 주어진 Context를 바탕으로 면접관(사용자)에게 답변하세요. 모르는 내용은 솔직히 모른다고 하고, 사용자의 질문이 채용과 관련 없다면 정중히 거절하세요."


4. **Streaming:** `StreamingTextResponse` (AI SDK)를 통해 빠른 UX 제공.

---

## 5. 단계별 구현 계획 (Roadmap)

### Phase 1: Ingestor (데이터 추출기) - *Quality First*

* [ ] Node.js CLI 환경 구성 (`commander` 등 라이브러리 활용).
* [ ] **SQLite 연결 및 데이터 추출 로직 구현 (Cursor/VSCode).**
* [ ] **`.personaignore` 로직 구현 (민감 프로젝트 제외).**
* [ ] 해시 비교를 통한 **증분 업데이트(Incremental Update)** 구현.

### Phase 2: Viewer (Astro Foundation)

* [ ] `npm create astro@latest` 및 Vercel 어댑터 설치.
* [ ] **Content Collections** 스키마 정의 (`work.mdx`, `projects.mdx`).
* [ ] 정적 이력서 페이지 퍼블리싱 (TailwindCSS).

### Phase 3: Brain (Islands Interaction)

* [ ] React 기반 Chat Widget 컴포넌트 개발 (`client:visible` 활용).
* [ ] Astro API Route에 OpenAI & Supabase 연동.
* [ ] Vercel 배포 및 환경 변수 설정.
