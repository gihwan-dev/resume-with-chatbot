# Resume with AI

> AI 에이전트 기반의 인터랙티브 이력서 — Notion/ClickUp의 실제 업무 데이터를 실시간 검색하여 질문에 답변합니다.

## 🛠 Tech Stack

![Astro](https://img.shields.io/badge/astro-%232C2052.svg?style=for-the-badge&logo=astro&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/google%20gemini-8E75B2?style=for-the-badge&logo=google%20gemini&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![Radix UI](https://img.shields.io/badge/radix%20ui-161618.svg?style=for-the-badge&logo=radix-ui&logoColor=white)
![Vitest](https://img.shields.io/badge/vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

## 📝 Project Summary

정적인 이력서의 한계를 해결하기 위해 시작된 프로젝트입니다. AI 채팅 어시스턴트를 통해 방문자가 이력서에 대해 자유롭게 질문하고, Notion·ClickUp에 기록된 실제 업무 데이터를 기반으로 근거 있는 답변을 받을 수 있습니다.

* **기간:** 2025.01 ~
* **인원:** 1인 개인 프로젝트
* **배포:** https://resume-with-ai.gihwan-dev.com

## ✨ Key Features

* **AI 채팅 어시스턴트:** Gemini 2.5 Pro 기반 멀티스텝 에이전트가 ReAct + Reflexion 패턴으로 도구를 순차 호출하며 질문에 답변합니다.
* **실시간 업무 데이터 연동:** Notion API·ClickUp API를 통해 프로젝트 노트, 기술 의사결정, 업무 태스크를 실시간 검색합니다.
* **환각 방지 시스템:** Source Tracker로 AI가 실제 검색 결과에 기반한 답변만 생성하도록 보장합니다. 컨텍스트 분리, 시간 기반 필터링, 신뢰도 레벨을 포함합니다.
* **토큰 최적화:** TOON 포맷 기반 커스텀 인코딩으로 약 38% 토큰 절감.
* **의도 분류 및 동적 프롬프트:** 질문을 4가지 유형(경력·기술·연락처·일반)으로 분류하고 유형별 검색 전략·프롬프트를 동적 생성합니다.
* **사고 과정 시각화:** Gemini Extended Thinking으로 AI 추론 과정을 실시간 표시합니다.

## 🚀 Getting Started

**Prerequisites**

* Node.js 18.x 이상
* pnpm

**Installation**

```bash
git clone https://github.com/gihwan-dev/resume-with-chatbot.git
cd resume-with-chatbot/web
pnpm install
```

**Environment Variables**

`.env.example`을 참고하여 `.env` 파일을 생성합니다:

```bash
cp .env.example .env
```

| 변수명 | 설명 |
|--------|------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API 키 |
| `NOTION_API_TOKEN` | Notion API 토큰 |
| `CLICKUP_API_TOKEN` | ClickUp API 토큰 |
| `CLICKUP_TEAM_ID` | ClickUp 워크스페이스 ID |
| `CLICKUP_WORKSPACE_ID` | ClickUp 워크스페이스 ID |
| `CLICKUP_USER_ID` | ClickUp 사용자 ID |

**Run**

```bash
pnpm dev
```

## 🧪 Testing

```bash
pnpm test          # watch 모드
pnpm test:run      # 단일 실행
pnpm test:coverage # 커버리지 리포트
```
