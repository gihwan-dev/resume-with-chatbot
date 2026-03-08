import { describe, expect, it } from "vitest"
import { normalizeKoreanMarkdown } from "@/lib/markdown/normalize-korean-markdown"

describe("normalizeKoreanMarkdown", () => {
  it("한글 조사 앞 strong 패턴을 보정한다", () => {
    const input = "문장 **강조**를 확인합니다."
    const result = normalizeKoreanMarkdown(input)

    expect(result).toBe("문장 <strong>강조</strong>를 확인합니다.")
  })

  it("inline code 내부 패턴은 그대로 유지한다", () => {
    const input = "코드 `**강조**를` 그대로 보여줍니다."
    const result = normalizeKoreanMarkdown(input)

    expect(result).toBe("코드 `**강조**를` 그대로 보여줍니다.")
  })

  it("fenced code block 내부 패턴은 그대로 유지하고 일반 문장만 보정한다", () => {
    const input = [
      "```ts",
      'const label = "**강조**를";',
      "```",
      "문장 **강조**를 확인합니다.",
    ].join("\n")

    const result = normalizeKoreanMarkdown(input)

    expect(result).toContain('const label = "**강조**를";')
    expect(result).toContain("문장 <strong>강조</strong>를 확인합니다.")
  })

  it("mixed fence opener는 fence로 인식하지 않고 일반 문장을 계속 보정한다", () => {
    const input = ["```~", "문장 **강조**를 확인합니다."].join("\n")

    const result = normalizeKoreanMarkdown(input)

    expect(result).toContain("```~")
    expect(result).toContain("문장 <strong>강조</strong>를 확인합니다.")
  })
})
