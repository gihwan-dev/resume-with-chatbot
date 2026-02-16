import { describe, expect, it } from "vitest"
import { parseFollowUpQuestions, SUGGESTED_QUESTIONS } from "../../src/lib/chat-utils"

describe("chat-utils", () => {
  describe("SUGGESTED_QUESTIONS", () => {
    it("채용 관점 빠른 질문 5개를 제공한다", () => {
      expect(SUGGESTED_QUESTIONS).toHaveLength(5)
      expect(SUGGESTED_QUESTIONS.map((question) => question.id)).toEqual([
        "accessibility-wcag",
        "typescript-quality",
        "ai-tools",
        "design-system",
        "meta-framework",
      ])
    })

    it("핵심 역량 키워드를 모두 포함한다", () => {
      const texts = SUGGESTED_QUESTIONS.map((question) => question.text).join(" ")

      expect(texts).toContain("접근성")
      expect(texts).toContain("TypeScript")
      expect(texts).toContain("AI")
      expect(texts).toContain("디자인 시스템")
      expect(texts).toContain("SSR")
      expect(texts).toContain("서버리스")
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
