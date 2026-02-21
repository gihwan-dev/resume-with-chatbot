import { describe, expect, it } from "vitest"
import { buildPortfolioPath, parsePortfolioPath } from "@/lib/resume-portfolio/hash"

describe("resume-portfolio hash", () => {
  it("buildPortfolioPath: caseId와 sectionId를 해시 규칙으로 생성한다", () => {
    expect(buildPortfolioPath("exem-data-grid", "problem")).toBe("/exem-data-grid#problem")
  })

  it("buildPortfolioPath: 유효하지 않은 caseId면 에러를 던진다", () => {
    expect(() => buildPortfolioPath("Exem Data Grid", "overview")).toThrow("Invalid caseId format")
  })

  it("parsePortfolioPath: 유효한 해시를 파싱한다", () => {
    expect(parsePortfolioPath("/exem-customer-dashboard#result")).toEqual({
      caseId: "exem-customer-dashboard",
      sectionId: "result",
    })
  })

  it("parsePortfolioPath: / 없이 들어와도 파싱한다", () => {
    expect(parsePortfolioPath("exem-new-generation#decision")).toEqual({
      caseId: "exem-new-generation",
      sectionId: "decision",
    })
  })

  it("parsePortfolioPath: section이 없으면 null을 반환한다", () => {
    expect(parsePortfolioPath("/exem-data-grid")).toBeNull()
  })

  it("parsePortfolioPath: 허용되지 않은 section이면 null을 반환한다", () => {
    expect(parsePortfolioPath("/exem-data-grid#invalid-section")).toBeNull()
  })

  it("parsePortfolioPath: 허용되지 않은 caseId 포맷이면 null을 반환한다", () => {
    expect(parsePortfolioPath("/exem_data_grid#problem")).toBeNull()
  })
})
