import { describe, expect, it } from "vitest"
import { parseFollowUpQuestions, SUGGESTED_QUESTIONS } from "../../src/lib/chat-utils"

describe("chat-utils", () => {
  describe("SUGGESTED_QUESTIONS", () => {
    it("채용 관점 빠른 질문 4개를 제공한다", () => {
      expect(SUGGESTED_QUESTIONS).toHaveLength(4)
      expect(SUGGESTED_QUESTIONS.map((question) => question.id)).toEqual([
        "architecture-philosophy",
        "performance-bottleneck-order",
        "tradeoff-rationale",
        "regression-test-strategy",
      ])
    })

    it("핵심 역량 키워드를 모두 포함한다", () => {
      const texts = SUGGESTED_QUESTIONS.map((question) => question.text).join(" ")

      expect(texts).toContain("아키텍처")
      expect(texts).toContain("성능 병목")
      expect(texts).toContain("트레이드오프")
      expect(texts).toContain("테스트 전략")
    })
  })

  describe("parseFollowUpQuestions", () => {
    it("번호 목록에서 물음표 문장만 추출한다", () => {
      const completion = [
        "1. 접근성 개선 사례가 있나요?",
        "2. 어떤 TypeScript 품질 기준을 사용했나요?",
        "3. 정량 성과를 수치로 설명해주실 수 있나요?",
      ].join("\n")

      expect(parseFollowUpQuestions(completion)).toEqual([
        "접근성 개선 사례가 있나요?",
        "어떤 TypeScript 품질 기준을 사용했나요?",
        "정량 성과를 수치로 설명해주실 수 있나요?",
      ])
    })
  })
})
