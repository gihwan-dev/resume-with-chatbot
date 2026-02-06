/**
 * Work Agent 프롬프트 모듈
 * 의도 분류, 반복 호출 분석, 동적 프롬프트 생성
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

export interface SearchSufficiencyCheck {
  isReady: boolean
  currentCount: number
  minRequired: number
  reason: string
}

// ============================================
// 상수 정의
// ============================================

/**
 * 의도별 최소 검색 횟수
 * - contact_inquiry: 연락처는 이력서에 있으므로 최소 1회
 * - career_inquiry/technical_inquiry: searchDocuments + readDocument
 * - general_chat: 최소한의 확인
 */
export const MIN_SEARCH_COUNT: Record<UserIntent, number> = {
  career_inquiry: 2, // searchDocuments + readDocument
  technical_inquiry: 2, // searchDocuments + readDocument
  contact_inquiry: 1, // 이력서 정보로 충분
  general_chat: 1, // 최소한의 확인
}

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
    "포트폴리오",
    "portfolio",
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
  career_inquiry: `## 현재 모드: 커리어 상담가

사용자가 경력/프로젝트 관련 질문을 했습니다. 다음 지침을 따르세요:

1. **검색 전략**: Exem 업무 기록을 우선 검색하여 실제 업무 내용 파악
2. **답변 스타일**: 구체적인 업무 경험과 성과 중심으로 답변
3. **상세 조회 필수**: searchDocuments로 관련 문서 찾은 후 반드시 readDocument로 내용 확인`,

  technical_inquiry: `## 현재 모드: 기술 전문가

사용자가 기술적 질문을 했습니다. 다음 지침을 따르세요:

1. **검색 전략**: 기술 카테고리와 업무 기록을 함께 검색
2. **답변 스타일**: 기술적으로 정확하고 구체적인 설명 제공
3. **코드/구현 언급**: 가능하면 사용된 기술과 구현 방식 설명
4. **상세 조회 필수**: searchDocuments 결과에서 유망한 문서는 반드시 readDocument로 확인`,

  contact_inquiry: `## 현재 모드: 연결 담당자

사용자가 연락처/연결 관련 질문을 했습니다. 다음 지침을 따르세요:

1. **검색 전략**: 검색 최소화, 이력서 정보로 충분
2. **답변 스타일**: 친절하게 연락처 정보 안내
3. **정보 범위**: 이력서에 있는 공개 정보만 제공
4. **추가 안내**: 필요시 GitHub, LinkedIn 등 프로필 링크 안내`,

  general_chat: `## 현재 모드: 친근한 어시스턴트

사용자가 일반적인 대화를 시작했습니다. 다음 지침을 따르세요:

1. **검색 전략**: 질문 내용에 따라 유연하게 판단
2. **답변 스타일**: 친근하고 도움이 되는 톤 유지
3. **안내**: 더 구체적인 질문이 있으면 도움 가능함을 안내
4. **자연스러움**: 로봇처럼 느껴지지 않게 자연스럽게 대화`,
}

/**
 * Reflexion 프로토콜: 반복 호출 감지 시 사용
 */
export const REFLEXION_PROTOCOL = `## ⚠️ 반복 호출 감지

동일한 도구가 3회 연속 호출되었습니다. 다음 지침을 따르세요:

### 자기 성찰 (Reflexion)
1. **이전 검색 결과 검토**: 지금까지 찾은 정보가 충분한지 평가
2. **접근 방식 변경**: 다른 키워드나 다른 도구 사용 고려
3. **종료 판단**: 충분한 정보가 있으면 answer 도구로 답변

### 대안 전략
- 다른 키워드로 검색 시도
- searchDocuments와 readDocument를 번갈아 활용
- 검색 결과가 없다면 이력서 기본 정보로 답변

### 주의
- 같은 검색을 반복하지 마세요
- 정보를 찾지 못했다면 솔직히 답변하세요`

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

**위 쿼리와 다른 접근을 시도하세요.**`)
      }
    }
  }

  return parts.join("\n\n")
}

/**
 * 검색 충분성을 확인하여 answer 도구 허용 여부를 결정합니다.
 */
export function shouldAllowAnswer(
  intent: UserIntent,
  analysis: StepAnalysis
): SearchSufficiencyCheck {
  const minRequired = MIN_SEARCH_COUNT[intent]
  const currentCount = analysis.totalSearchCount

  if (currentCount < minRequired) {
    return {
      isReady: false,
      currentCount,
      minRequired,
      reason: `최소 검색 미달: ${currentCount}/${minRequired}회 (의도: ${intent})`,
    }
  }

  return {
    isReady: true,
    currentCount,
    minRequired,
    reason: `검색 충족: ${currentCount}/${minRequired}회 이상 완료`,
  }
}
