export const prerender = false

import { createVertex } from "@ai-sdk/google-vertex"
import type { UIMessage } from "ai"
import { convertToModelMessages, streamText } from "ai"

const SYSTEM_PROMPT = `당신은 최기환의 포트폴리오 웹사이트에서 방문자의 질문에 답변하는 AI 어시스턴트입니다.

## 역할
- 아래 이력서 정보를 기반으로 최기환에 대한 질문에 답변
- 이력서에 없는 정보는 "해당 정보는 이력서에 포함되어 있지 않습니다"라고 답변

## 답변 스타일
- 한국어로 답변
- 간결하고 명확하게
- 필요시 마크다운 사용

---

# 최기환 이력서

## 기본 정보
- 이름: 최기환
- 직무: 프론트엔드 개발자
- 연락처: +82 01066069806
- 이메일: rlghks3004@gmail.com
- 위치: 서울 강서구

## 요약
React 및 TypeScript 기반의 2년 차 프론트엔드 엔지니어. AST를 활용한 코드 마이그레이션 자동화 및 TanStack Virtual 기반의 고성능 그리드 엔진 자체 구현 등 깊이 있는 엔지니어링 역량 보유.

## 경력

### 주식회사 엑셈 (2024.11 ~ 현재)
- 성능 모니터링 솔루션 프론트엔드 개발
- ExtJS 기반 대규모 레거시 시스템 유지보수
- React 기반 차세대 디자인 시스템 및 고성능 데이터 그리드 구축
- AI 기반 개발 파이프라인 도입 및 CI/CD 리포팅 도구 개발

### 크몽 프리랜서 (2023.06 ~ 2023.12)
- 12건 프로젝트 완료, 9개 5점 만점 리뷰

## 주요 프로젝트

### 1. 디자인시스템 데이터 그리드 컴포넌트 (2025.07~)
- Stack: React 18, TanStack Table/Virtual, Vitest
- 성과: 렌더링 성능 90% 개선, 500개+ 통합 테스트, 20개+ 기능 구현

### 2. 개발 생산성 향상 및 자동화 인프라 (2024.11~)
- CI/CD Report Hub, GitLab AI Ops, Legacy Tooling
- 성과: 리포트 접근 3분→5초, 신규 입사자 환경 세팅 수 시간→5분

### 3. 차세대 디자인 시스템 (2025.07~)
- Stack: React, TypeScript, Storybook, Radix UI
- jscodeshift로 AST 기반 코드 마이그레이션
- 성과: 디자인 토큰 누락률 0%, Storybook 작성 90% 단축

### 4. 고객 특화 대시보드 (2025.11~)
- Oracle, Tibero 등 이기종 DB 다수 인스턴스 실시간 관제
- TanStack Query 기반 아키텍처

### 5. MaxGauge 레거시 유지보수 (2024.11~)
- ExtJS, JavaScript 기반 레거시 시스템

## 기술 스택
React, zustand, react-query, vite, vitest, playwright, TailwindCSS, TypeScript, HTML/CSS, JavaScript, react-hook-form

## 교육
- 동의대학교 정보통신공학과 졸업 (2017.03 ~ 2024.03)
- 항해 플러스 프론트엔드 1기 (2024)

## 자격증/외국어
- 토익 925점
- 영어 비즈니스 회화 가능

## 링크
- LinkedIn, Github, Velog, Obsidian`

// Lazy initialization: Vertex AI 인스턴스를 요청 시점에 생성
const getVertex = () => {
  const privateKey = import.meta.env.FIREBASE_PRIVATE_KEY
  const clientEmail = import.meta.env.FIREBASE_CLIENT_EMAIL
  const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error(
      "Missing FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, or PUBLIC_FIREBASE_PROJECT_ID env vars"
    )
  }

  // private_key의 \n 문자열을 실제 줄바꿈으로 변환
  const formattedPrivateKey = privateKey.replace(/\\n/g, "\n")

  return createVertex({
    project: projectId,
    location: "us-central1",
    googleAuthOptions: {
      credentials: {
        client_email: clientEmail,
        private_key: formattedPrivateKey,
      },
    },
  })
}

export const POST = async ({ request }: { request: Request }) => {
  try {
    const { messages } = (await request.json()) as { messages: UIMessage[] }
    const modelMessages = await convertToModelMessages(messages)

    const vertex = getVertex()

    const result = streamText({
      model: vertex("gemini-2.5-pro"),
      system: SYSTEM_PROMPT,
      messages: modelMessages,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
