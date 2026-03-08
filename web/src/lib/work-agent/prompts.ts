/**
 * Work Agent 프롬프트 모듈
 * 의도 분류, 반복 호출 분석, 동적 프롬프트/Thinking Level 생성
 * Obsidian 볼트 기반 아키텍처
 */

// ============================================
// 타입 정의
// ============================================

export type UserIntent = "career_inquiry" | "technical_inquiry" | "contact_inquiry" | "general_chat"

export interface IntentClassification {
  intent: UserIntent
  confidence: number
  keywords: string[]
}

export interface ToolCallHistory {
  toolName: string
  query?: string
  stepNumber: number
}

export interface StepAnalysis {
  consecutiveSameToolCount: number
  lastToolName: string | null
  lastQueries: string[]
  totalSearchCount: number
}

export interface DynamicPromptOptions {
  intent: UserIntent
  analysis?: StepAnalysis
  includeReflexion?: boolean
}

export type ThinkingLevel = "high" | "low"

// ============================================
// 상수 정의
// ============================================

/**
 * 의도별 키워드 매핑
 */
export const INTENT_KEYWORDS: Record<UserIntent, string[]> = {
  career_inquiry: [
    // 경력/프로젝트 관련
    "경력",
    "프로젝트",
    "업무",
    "담당",
    "개발",
    "구현",
    "진행",
    "성과",
    "기여",
    "맡",
    "했",
    "하셨",
    "어떤 일",
    "무슨 일",
    "work",
    "project",
    "experience",
    "career",
    "responsibility",
    // 회사/직장 관련
    "회사",
    "팀",
    "부서",
    "역할",
    "직무",
    // 기간/상태 관련
    "현재",
    "최근",
    "요즘",
    "지금",
  ],
  technical_inquiry: [
    // 기술 스택
    "기술",
    "스택",
    "언어",
    "프레임워크",
    "라이브러리",
    "react",
    "typescript",
    "javascript",
    "node",
    "python",
    "extjs",
    "radix",
    "tanstack",
    "vitest",
    "astro",
    // 기술적 개념
    "구현",
    "아키텍처",
    "설계",
    "패턴",
    "컴포넌트",
    "api",
    "테스트",
    "배포",
    "CI/CD",
    "성능",
    "최적화",
    "가상화",
    "virtualization",
    "데이터그리드",
    "datagrid",
    // 기술적 질문 패턴
    "어떻게",
    "왜",
    "방법",
    "원리",
    "구조",
    "tech",
    "stack",
    "how",
    "implement",
  ],
  contact_inquiry: [
    // 연락처 관련
    "연락",
    "이메일",
    "메일",
    "email",
    "전화",
    "phone",
    "깃허브",
    "github",
    "링크드인",
    "linkedin",
    "블로그",
    "blog",
    "사이트",
    "site",
    "주소",
    "url",
    // 연락 의도
    "연락처",
    "contact",
    "reach",
    "get in touch",
    "문의",
    "컨택",
    "연결",
  ],
  general_chat: [
    // 인사/일반
    "안녕",
    "반가워",
    "hello",
    "hi",
    "hey",
    "감사",
    "고마워",
    "thanks",
    "thank you",
    "도움",
    "help",
    "뭐해",
    "뭐야",
    // 일반 질문
    "누구",
    "who",
    "소개",
    "introduce",
  ],
}

/**
 * 의도별 페르소나 프롬프트
 */
export const PERSONA_PROMPTS: Record<UserIntent, string> = {
  career_inquiry: `## 모드: 커리어 답변
- 먼저 searchDocuments로 근거를 찾고, 필요한 문서는 readDocument로 확인하세요.
- 답변은 문제/해결/성과 순서로 간결하게 작성하세요.
- 확인되지 않은 수치나 사실은 추측하지 마세요.`,

  technical_inquiry: `## 모드: 기술 답변
- 기술 질문은 반드시 검색 근거를 확보한 뒤 답변하세요.
- 문서 제목만으로 단정하지 말고, 구현 세부는 readDocument로 검증하세요.
- 설명은 기술 선택 이유와 구현 포인트 중심으로 작성하세요.`,

  contact_inquiry: `## 모드: 연락처 안내
- 공개된 이력서/볼트 정보만 사용하세요.
- 정보가 없으면 없다고 명확히 말하세요.
- 짧고 직접적으로 안내하세요.`,

  general_chat: `## 모드: 일반 대화
- 사실성 질문은 검색 후 답변하세요.
- 잡담은 간결하고 자연스럽게 응답하세요.
- 근거가 없으면 추측하지 마세요.`,
}

/**
 * 반복 호출 시 전략 전환 힌트(soft guidance)
 */
export const REFLEXION_PROTOCOL = `## 전략 전환 힌트
- 동일한 도구 호출이 반복되고 있습니다.
- 이전 쿼리를 그대로 반복하지 말고 키워드를 바꾸거나 다른 문서를 읽으세요.
- 충분한 근거가 모이면 answer 도구로 마무리하세요.
- 근거가 부족하면 "확인되지 않음"으로 답변하세요.`

export function resolveThinkingLevel(intent: UserIntent): ThinkingLevel {
  if (intent === "career_inquiry" || intent === "technical_inquiry") {
    return "high"
  }
  return "low"
}

// ============================================
// 함수 정의
// ============================================

/**
 * 사용자 메시지에서 의도를 분류합니다.
 */
export function classifyIntent(userMessage: string): IntentClassification {
  const lowerMessage = userMessage.toLowerCase()
  const matchedKeywords: Record<UserIntent, string[]> = {
    career_inquiry: [],
    technical_inquiry: [],
    contact_inquiry: [],
    general_chat: [],
  }

  // 각 의도별 키워드 매칭
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [UserIntent, string[]][]) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        matchedKeywords[intent].push(keyword)
      }
    }
  }

  // 가장 많이 매칭된 의도 찾기
  const scores: Record<UserIntent, number> = {
    career_inquiry: matchedKeywords.career_inquiry.length,
    technical_inquiry: matchedKeywords.technical_inquiry.length,
    contact_inquiry: matchedKeywords.contact_inquiry.length,
    general_chat: matchedKeywords.general_chat.length,
  }

  // 우선순위: contact > career > technical > general
  // (contact는 명확하고 처리가 간단하므로 최우선)
  let selectedIntent: UserIntent = "general_chat"
  let maxScore = 0

  // contact_inquiry는 1개만 매칭되어도 우선
  if (scores.contact_inquiry >= 1) {
    selectedIntent = "contact_inquiry"
    maxScore = scores.contact_inquiry
  } else {
    // 나머지는 점수 비교
    for (const [intent, score] of Object.entries(scores) as [UserIntent, number][]) {
      if (score > maxScore) {
        maxScore = score
        selectedIntent = intent
      }
    }
  }

  // 신뢰도 계산 (매칭된 키워드 수 기반)
  const totalMatched = Object.values(matchedKeywords).flat().length
  const confidence = totalMatched === 0 ? 0.3 : Math.min(0.5 + maxScore * 0.15, 0.95)

  return {
    intent: selectedIntent,
    confidence,
    keywords: matchedKeywords[selectedIntent],
  }
}

/**
 * 단계 이력에서 도구 호출 패턴을 분석합니다.
 */
export function analyzeToolCallPattern(
  steps: Array<{ toolCalls?: Array<{ toolName: string; args?: unknown }> }>
): StepAnalysis {
  const history: ToolCallHistory[] = []

  // 모든 도구 호출 기록 수집
  steps.forEach((step, stepIndex) => {
    if (step.toolCalls) {
      for (const call of step.toolCalls) {
        const query = extractQueryFromArgs(call.args)
        history.push({
          toolName: call.toolName,
          query,
          stepNumber: stepIndex,
        })
      }
    }
  })

  if (history.length === 0) {
    return {
      consecutiveSameToolCount: 0,
      lastToolName: null,
      lastQueries: [],
      totalSearchCount: 0,
    }
  }

  // 마지막 도구 이름
  const lastToolName = history[history.length - 1].toolName

  // 연속 동일 도구 횟수 계산 (뒤에서부터)
  let consecutiveCount = 0
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].toolName === lastToolName) {
      consecutiveCount++
    } else {
      break
    }
  }

  // 마지막 연속 호출들의 쿼리 수집
  const lastQueries: string[] = []
  for (let i = history.length - 1; i >= 0 && history[i].toolName === lastToolName; i--) {
    if (history[i].query) {
      lastQueries.unshift(history[i].query as string)
    }
  }

  // 검색 도구 총 호출 횟수
  const searchTools = ["searchDocuments", "readDocument"]
  const totalSearchCount = history.filter((h) => searchTools.includes(h.toolName)).length

  return {
    consecutiveSameToolCount: consecutiveCount,
    lastToolName,
    lastQueries,
    totalSearchCount,
  }
}

/**
 * 도구 인자에서 query 값을 추출합니다.
 */
function extractQueryFromArgs(args: unknown): string | undefined {
  if (!args || typeof args !== "object") return undefined
  const obj = args as Record<string, unknown>
  if ("query" in obj && typeof obj.query === "string") {
    return obj.query
  }
  return undefined
}

/**
 * 동적 시스템 프롬프트를 생성합니다.
 */
export function buildDynamicSystemPrompt(options: DynamicPromptOptions): string {
  const parts: string[] = []

  // 의도별 페르소나 추가
  parts.push(PERSONA_PROMPTS[options.intent])

  // 반복 호출 감지 시 Reflexion 프로토콜 추가
  if (options.includeReflexion && options.analysis) {
    if (options.analysis.consecutiveSameToolCount >= 3) {
      parts.push(REFLEXION_PROTOCOL)

      // 반복된 쿼리 정보 추가
      if (options.analysis.lastQueries.length > 0) {
        parts.push(`
### 이전 검색 쿼리
${options.analysis.lastQueries.map((q, i) => `${i + 1}. "${q}"`).join("\n")}

위 쿼리와 다른 접근을 시도하세요.`)
      }
    }
  }

  return parts.join("\n\n")
}
