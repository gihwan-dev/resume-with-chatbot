# AI 도구 로컬 히스토리 저장 위치 조사 결과

## 요약

| 도구 | 저장 위치 | 크기 | 히스토리 형식 |
|------|----------|------|--------------|
| Claude Code | `~/.claude/` | 914MB | JSONL |
| Claude Desktop | `~/Library/Application Support/Claude/` | ~100MB | LevelDB/IndexedDB |
| Cursor | `~/.cursor/` + `~/Library/Application Support/Cursor/` | 2.9GB | SQLite |
| Codex | `~/.codex/` | 55MB | JSONL |
| ChatGPT | `~/Library/Application Support/com.openai.chat/` | 3.8MB | 이진(.data) |
| Antigravity | `~/Library/Application Support/Antigravity/` | 1.2GB | JSON + Markdown |

---

## 1. Claude Code

**경로**: `/Users/choegihwan/.claude/`

| 파일/폴더 | 용도 | 형식 |
|-----------|------|------|
| `history.jsonl` | 전체 대화 히스토리 (2,299줄) | JSONL |
| `projects/` | 프로젝트별 상세 대화 기록 (448MB) | JSONL |
| `file-history/` | 파일 변경 이력 (481개 파일) | 텍스트 |
| `plans/` | 작업 계획 (59개 파일) | Markdown |
| `todos/` | TODO 항목 (3,363개) | - |
| `debug/` | 디버그 정보 (642개) | - |

**대화 기록 형식 예시**:
```json
{
  "display": "사용자 입력 텍스트",
  "timestamp": 1759119161233,
  "project": "/Users/choegihwan/Documents/Projects/..."
}
```

---

## 2. Claude Desktop

**경로**: `/Users/choegihwan/Library/Application Support/Claude/`

| 파일/폴더 | 용도 |
|-----------|------|
| `config.json` | 앱 설정 (다크모드, 언어 등) |
| `claude_desktop_config.json` | MCP 서버 구성 |
| `IndexedDB/` | 대화 데이터 (LevelDB 형식) |
| `Session Storage/` | 세션 데이터 |
| `Cache/Cache_Data/` | 캐시 (11,150개 파일) |

---

## 3. Cursor

**경로 1**: `/Users/choegihwan/.cursor/` (1.0GB)

| 폴더 | 용도 |
|------|------|
| `extensions/` | 확장 프로그램 (68개) |
| `projects/` | 프로젝트 메타데이터 (21개) |

**경로 2**: `/Users/choegihwan/Library/Application Support/Cursor/` (1.9GB)

| 파일/폴더 | 용도 |
|-----------|------|
| `User/settings.json` | 사용자 설정 |
| `User/workspaceStorage/` | 워크스페이스 데이터 (173개) |
| `User/workspaceStorage/*/state.vscdb` | 상태 DB (SQLite) |

---

## 4. Codex (OpenAI CLI)

**경로**: `/Users/choegihwan/.codex/`

| 파일/폴더 | 용도 | 형식 |
|-----------|------|------|
| `history.jsonl` | 전체 채팅 히스토리 (49줄) | JSONL |
| `sessions/YYYY/MM/DD/` | 세션별 상세 대화 기록 | JSONL |
| `config.toml` | 설정 (모델: gpt-5.2-codex) | TOML |
| `auth.json` | 인증 정보 (JWT 토큰) | JSON |

**대화 기록 형식 예시**:
```json
{
  "session_id": "f6b2f613-aa08-405b-8aa4-ba7a1f94d74a",
  "ts": 1757494366,
  "text": "사용자 입력 텍스트..."
}
```

---

## 5. ChatGPT

**경로**: `/Users/choegihwan/Library/Application Support/com.openai.chat/`

| 폴더 | 용도 |
|------|------|
| `conversations-v3-<UUID>/` | 계정별 대화 기록 |
| `drafts-v2-*/` | 임시 저장본 |
| `gizmos-*/` | Custom GPT 데이터 |

- **대화 파일**: 74개의 `.data` 파일 (이진 형식)
- **3개 계정** UUID로 분리 저장

---

## 6. Antigravity

**경로**: `/Users/choegihwan/Library/Application Support/Antigravity/`

| 파일/폴더 | 용도 | 형식 |
|-----------|------|------|
| `User/History/` | 편집 히스토리 (1,240개 폴더) | JSON + Markdown |
| `User/globalStorage/state.vscdb` | 상태 정보 | SQLite |
| `User/globalStorage/storage.json` | 설정 및 메타데이터 | JSON |
| `User/settings.json` | 사용자 설정 | JSON |

**히스토리 구조**:
```
User/History/<UUID>/
├── entries.json      (메타데이터)
├── qn1U.md          (파일 콘텐츠)
└── ...
```

---

## 데이터 접근 방법

| 도구 | 직접 읽기 가능 | 도구 필요 |
|------|---------------|----------|
| Claude Code | history.jsonl, plans/ | - |
| Claude Desktop | - | LevelDB 뷰어 |
| Cursor | settings.json | SQLite 뷰어 (state.vscdb) |
| Codex | history.jsonl, sessions/ | - |
| ChatGPT | - | 이진 복호화 필요 |
| Antigravity | entries.json, .md 파일 | SQLite 뷰어 (state.vscdb) |
