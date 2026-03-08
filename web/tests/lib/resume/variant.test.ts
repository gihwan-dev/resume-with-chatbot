import { describe, expect, it } from "vitest"
import { isResumeRoutePath, parseResumeVariant, parseResumeVariantFromPath } from "@/lib/resume/variant"

describe("resume variant route smoke", () => {
  it("/와 /ai-agent를 resume route로 인식한다", () => {
    expect(isResumeRoutePath("/")).toBe(true)
    expect(isResumeRoutePath("/ai-agent")).toBe(true)
  })

  it("지원하지 않는 path는 resume route가 아니다", () => {
    expect(isResumeRoutePath("/portfolio")).toBe(false)
  })

  it("variant 파서는 invalid 입력에서 frontend로 fallback 한다", () => {
    expect(parseResumeVariant("ai-agent")).toBe("ai-agent")
    expect(parseResumeVariant("invalid")).toBe("frontend")
    expect(parseResumeVariantFromPath("/ai-agent")).toBe("ai-agent")
    expect(parseResumeVariantFromPath("/unknown")).toBe("frontend")
  })
})
