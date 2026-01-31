/**
 * Prompts Module Tests
 * 의도 분류, 반복 호출 분석, 동적 프롬프트 생성 테스트
 */

import { describe, expect, it } from "vitest"
import {
  analyzeToolCallPattern,
  buildDynamicSystemPrompt,
  classifyIntent,
  INTENT_KEYWORDS,
  MIN_SEARCH_COUNT,
  PERSONA_PROMPTS,
  REFLEXION_PROTOCOL,
  shouldAllowAnswer,
  type UserIntent,
} from "../../../src/lib/work-agent/prompts"

describe("prompts", () => {
  // ============================================
  // classifyIntent Tests
  // ============================================
  describe("classifyIntent", () => {
    describe("career_inquiry 분류", () => {
      it("경력 관련 질문 인식", () => {
        const result = classifyIntent("어떤 프로젝트를 담당하셨나요?")
        expect(result.intent).toBe("career_inquiry")
        expect(result.confidence).toBeGreaterThan(0.5)
        expect(result.keywords.length).toBeGreaterThan(0)
      })

      it("현재 업무 관련 질문 인식", () => {
        const result = classifyIntent("현재 진행 중인 개발 업무가 무엇인가요?")
        expect(result.intent).toBe("career_inquiry")
        expect(result.keywords).toContain("현재")
      })
    })

    describe("technical_inquiry 분류", () => {
      it("기술 스택 질문 인식", () => {
        const result = classifyIntent("React와 TypeScript를 어떻게 사용하시나요?")
        expect(result.intent).toBe("technical_inquiry")
        expect(result.confidence).toBeGreaterThan(0.5)
      })

      it("구현 방법 질문 인식", () => {
        const result = classifyIntent("DataGrid 가상화는 어떻게 구현했나요?")
        expect(result.intent).toBe("technical_inquiry")
        expect(
          result.keywords.some((k) =>
            ["datagrid", "가상화", "구현", "어떻게"].includes(k.toLowerCase())
          )
        ).toBe(true)
      })
    })

    describe("contact_inquiry 분류", () => {
      it("연락처 질문 인식", () => {
        const result = classifyIntent("이메일 주소가 어떻게 되나요?")
        expect(result.intent).toBe("contact_inquiry")
        expect(result.confidence).toBeGreaterThan(0.5)
      })

      it("GitHub 링크 질문 인식", () => {
        const result = classifyIntent("GitHub 계정이 있나요?")
        expect(result.intent).toBe("contact_inquiry")
        expect(result.keywords).toContain("github")
      })
    })

    describe("general_chat 분류", () => {
      it("인사말 인식", () => {
        const result = classifyIntent("안녕하세요!")
        expect(result.intent).toBe("general_chat")
      })

      it("키워드 없는 일반 질문", () => {
        const result = classifyIntent("뭐해?")
        expect(result.intent).toBe("general_chat")
      })
    })

    describe("우선순위 처리", () => {
      it("contact_inquiry는 단일 키워드로도 우선", () => {
        // contact와 다른 키워드가 섞여 있어도 contact 우선
        const result = classifyIntent("이메일로 연락드려도 될까요?")
        expect(result.intent).toBe("contact_inquiry")
      })

      it("키워드 없으면 general_chat 기본값", () => {
        const result = classifyIntent("abc xyz 123")
        expect(result.intent).toBe("general_chat")
        expect(result.confidence).toBeLessThan(0.5)
      })
    })
  })

  // ============================================
  // analyzeToolCallPattern Tests
  // ============================================
  describe("analyzeToolCallPattern", () => {
    it("빈 steps에서 기본값 반환", () => {
      const result = analyzeToolCallPattern([])
      expect(result.consecutiveSameToolCount).toBe(0)
      expect(result.lastToolName).toBeNull()
      expect(result.lastQueries).toEqual([])
      expect(result.totalSearchCount).toBe(0)
    })

    it("단일 도구 호출 분석", () => {
      const steps = [
        {
          toolCalls: [{ toolName: "searchNotion", args: { query: "test" } }],
        },
      ]
      const result = analyzeToolCallPattern(steps)
      expect(result.consecutiveSameToolCount).toBe(1)
      expect(result.lastToolName).toBe("searchNotion")
      expect(result.lastQueries).toEqual(["test"])
      expect(result.totalSearchCount).toBe(1)
    })

    it("연속 동일 도구 3회 호출 감지", () => {
      const steps = [
        { toolCalls: [{ toolName: "searchNotion", args: { query: "query1" } }] },
        { toolCalls: [{ toolName: "searchNotion", args: { query: "query2" } }] },
        { toolCalls: [{ toolName: "searchNotion", args: { query: "query3" } }] },
      ]
      const result = analyzeToolCallPattern(steps)
      expect(result.consecutiveSameToolCount).toBe(3)
      expect(result.lastToolName).toBe("searchNotion")
      expect(result.lastQueries).toEqual(["query1", "query2", "query3"])
    })

    it("중간에 다른 도구 호출 시 연속 카운트 리셋", () => {
      const steps = [
        { toolCalls: [{ toolName: "searchNotion", args: { query: "q1" } }] },
        { toolCalls: [{ toolName: "searchClickUpTasks", args: { query: "q2" } }] },
        { toolCalls: [{ toolName: "searchNotion", args: { query: "q3" } }] },
      ]
      const result = analyzeToolCallPattern(steps)
      expect(result.consecutiveSameToolCount).toBe(1)
      expect(result.lastToolName).toBe("searchNotion")
      expect(result.lastQueries).toEqual(["q3"])
    })

    it("검색 도구 총 호출 횟수 계산", () => {
      const steps = [
        { toolCalls: [{ toolName: "searchNotion", args: { query: "q1" } }] },
        { toolCalls: [{ toolName: "getNotionPage", args: { pageId: "id1" } }] },
        { toolCalls: [{ toolName: "searchClickUpTasks", args: { query: "q2" } }] },
        { toolCalls: [{ toolName: "searchClickUpDocs", args: { query: "q3" } }] },
        { toolCalls: [{ toolName: "answer", args: { text: "response" } }] },
      ]
      const result = analyzeToolCallPattern(steps)
      expect(result.totalSearchCount).toBe(4) // answer 제외
    })

    it("toolCalls 없는 step 처리", () => {
      const steps = [
        { text: "some text" },
        { toolCalls: [{ toolName: "searchNotion", args: { query: "test" } }] },
      ] as Parameters<typeof analyzeToolCallPattern>[0]
      const result = analyzeToolCallPattern(steps)
      expect(result.consecutiveSameToolCount).toBe(1)
      expect(result.lastToolName).toBe("searchNotion")
    })
  })

  // ============================================
  // buildDynamicSystemPrompt Tests
  // ============================================
  describe("buildDynamicSystemPrompt", () => {
    it("career_inquiry 의도에 맞는 프롬프트 생성", () => {
      const result = buildDynamicSystemPrompt({ intent: "career_inquiry" })
      expect(result).toContain("커리어 상담가")
      expect(result).toContain("ClickUp 태스크를 우선 검색")
    })

    it("technical_inquiry 의도에 맞는 프롬프트 생성", () => {
      const result = buildDynamicSystemPrompt({ intent: "technical_inquiry" })
      expect(result).toContain("기술 전문가")
      expect(result).toContain("Notion 기술 문서")
    })

    it("contact_inquiry 의도에 맞는 프롬프트 생성", () => {
      const result = buildDynamicSystemPrompt({ intent: "contact_inquiry" })
      expect(result).toContain("연결 담당자")
      expect(result).toContain("검색 최소화")
    })

    it("general_chat 의도에 맞는 프롬프트 생성", () => {
      const result = buildDynamicSystemPrompt({ intent: "general_chat" })
      expect(result).toContain("친근한 어시스턴트")
    })

    it("반복 호출 감지 시 Reflexion 프로토콜 추가", () => {
      const analysis = {
        consecutiveSameToolCount: 3,
        lastToolName: "searchNotion",
        lastQueries: ["query1", "query2", "query3"],
        totalSearchCount: 3,
      }
      const result = buildDynamicSystemPrompt({
        intent: "career_inquiry",
        analysis,
        includeReflexion: true,
      })
      expect(result).toContain("반복 호출 감지")
      expect(result).toContain("자기 성찰")
      expect(result).toContain("이전 검색 쿼리")
      expect(result).toContain("query1")
      expect(result).toContain("query2")
      expect(result).toContain("query3")
    })

    it("연속 호출 3회 미만이면 Reflexion 미포함", () => {
      const analysis = {
        consecutiveSameToolCount: 2,
        lastToolName: "searchNotion",
        lastQueries: ["query1", "query2"],
        totalSearchCount: 2,
      }
      const result = buildDynamicSystemPrompt({
        intent: "career_inquiry",
        analysis,
        includeReflexion: true,
      })
      expect(result).not.toContain("반복 호출 감지")
    })

    it("includeReflexion false면 Reflexion 미포함", () => {
      const analysis = {
        consecutiveSameToolCount: 5,
        lastToolName: "searchNotion",
        lastQueries: ["q1", "q2", "q3", "q4", "q5"],
        totalSearchCount: 5,
      }
      const result = buildDynamicSystemPrompt({
        intent: "career_inquiry",
        analysis,
        includeReflexion: false,
      })
      expect(result).not.toContain("반복 호출 감지")
    })
  })

  // ============================================
  // shouldAllowAnswer Tests
  // ============================================
  describe("shouldAllowAnswer", () => {
    const createAnalysis = (totalSearchCount: number) => ({
      consecutiveSameToolCount: 0,
      lastToolName: null,
      lastQueries: [],
      totalSearchCount,
    })

    describe("career_inquiry (최소 3회)", () => {
      it("검색 0회: 미달", () => {
        const result = shouldAllowAnswer("career_inquiry", createAnalysis(0))
        expect(result.isReady).toBe(false)
        expect(result.currentCount).toBe(0)
        expect(result.minRequired).toBe(3)
        expect(result.reason).toContain("최소 검색 미달")
      })

      it("검색 2회: 미달", () => {
        const result = shouldAllowAnswer("career_inquiry", createAnalysis(2))
        expect(result.isReady).toBe(false)
        expect(result.currentCount).toBe(2)
        expect(result.minRequired).toBe(3)
      })

      it("검색 3회: 충족", () => {
        const result = shouldAllowAnswer("career_inquiry", createAnalysis(3))
        expect(result.isReady).toBe(true)
        expect(result.currentCount).toBe(3)
        expect(result.reason).toContain("검색 충족")
      })

      it("검색 5회: 충족", () => {
        const result = shouldAllowAnswer("career_inquiry", createAnalysis(5))
        expect(result.isReady).toBe(true)
        expect(result.currentCount).toBe(5)
      })
    })

    describe("contact_inquiry (최소 1회)", () => {
      it("검색 0회: 미달", () => {
        const result = shouldAllowAnswer("contact_inquiry", createAnalysis(0))
        expect(result.isReady).toBe(false)
        expect(result.minRequired).toBe(1)
      })

      it("검색 1회: 충족", () => {
        const result = shouldAllowAnswer("contact_inquiry", createAnalysis(1))
        expect(result.isReady).toBe(true)
        expect(result.currentCount).toBe(1)
        expect(result.minRequired).toBe(1)
      })
    })

    describe("general_chat (최소 2회)", () => {
      it("검색 1회: 미달", () => {
        const result = shouldAllowAnswer("general_chat", createAnalysis(1))
        expect(result.isReady).toBe(false)
        expect(result.minRequired).toBe(2)
      })

      it("검색 2회: 충족", () => {
        const result = shouldAllowAnswer("general_chat", createAnalysis(2))
        expect(result.isReady).toBe(true)
      })
    })

    describe("technical_inquiry (최소 3회)", () => {
      it("검색 2회: 미달", () => {
        const result = shouldAllowAnswer("technical_inquiry", createAnalysis(2))
        expect(result.isReady).toBe(false)
        expect(result.minRequired).toBe(3)
      })

      it("검색 3회: 충족", () => {
        const result = shouldAllowAnswer("technical_inquiry", createAnalysis(3))
        expect(result.isReady).toBe(true)
      })
    })
  })

  // ============================================
  // 상수 검증 Tests
  // ============================================
  describe("상수 검증", () => {
    it("INTENT_KEYWORDS에 모든 의도 정의됨", () => {
      const intents: UserIntent[] = [
        "career_inquiry",
        "technical_inquiry",
        "contact_inquiry",
        "general_chat",
      ]
      for (const intent of intents) {
        expect(INTENT_KEYWORDS[intent]).toBeDefined()
        expect(INTENT_KEYWORDS[intent].length).toBeGreaterThan(0)
      }
    })

    it("PERSONA_PROMPTS에 모든 의도 정의됨", () => {
      const intents: UserIntent[] = [
        "career_inquiry",
        "technical_inquiry",
        "contact_inquiry",
        "general_chat",
      ]
      for (const intent of intents) {
        expect(PERSONA_PROMPTS[intent]).toBeDefined()
        expect(PERSONA_PROMPTS[intent].length).toBeGreaterThan(0)
      }
    })

    it("REFLEXION_PROTOCOL이 정의됨", () => {
      expect(REFLEXION_PROTOCOL).toBeDefined()
      expect(REFLEXION_PROTOCOL).toContain("반복 호출 감지")
    })

    it("MIN_SEARCH_COUNT에 모든 의도 정의됨", () => {
      const intents: UserIntent[] = [
        "career_inquiry",
        "technical_inquiry",
        "contact_inquiry",
        "general_chat",
      ]
      for (const intent of intents) {
        expect(MIN_SEARCH_COUNT[intent]).toBeDefined()
        expect(MIN_SEARCH_COUNT[intent]).toBeGreaterThanOrEqual(1)
      }
    })

    it("MIN_SEARCH_COUNT 값이 의도에 맞게 설정됨", () => {
      expect(MIN_SEARCH_COUNT.contact_inquiry).toBe(1) // 연락처: 최소
      expect(MIN_SEARCH_COUNT.general_chat).toBe(2) // 일반: 중간
      expect(MIN_SEARCH_COUNT.career_inquiry).toBe(3) // 경력: 높음
      expect(MIN_SEARCH_COUNT.technical_inquiry).toBe(3) // 기술: 높음
    })
  })
})
