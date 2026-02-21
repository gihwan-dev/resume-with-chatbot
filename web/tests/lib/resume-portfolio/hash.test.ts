import { describe, expect, it } from "vitest"
import { buildPortfolioHash, parsePortfolioHash } from "@/lib/resume-portfolio/hash"

describe("resume-portfolio hash", () => {
  it("buildPortfolioHash: caseId와 sectionId를 해시 규칙으로 생성한다", () => {
    expect(buildPortfolioHash("exem-data-grid", "problem")).toBe("#exem-data-grid.problem")
  })

  it("buildPortfolioHash: 유효하지 않은 caseId면 에러를 던진다", () => {
    expect(() => buildPortfolioHash("Exem Data Grid", "overview")).toThrow("Invalid caseId format")
  })

  it("parsePortfolioHash: 유효한 해시를 파싱한다", () => {
    expect(parsePortfolioHash("#exem-customer-dashboard.result")).toEqual({
      caseId: "exem-customer-dashboard",
      sectionId: "result",
    })
  })

  it("parsePortfolioHash: # 없이 들어와도 파싱한다", () => {
    expect(parsePortfolioHash("exem-new-generation.decision")).toEqual({
      caseId: "exem-new-generation",
      sectionId: "decision",
    })
  })

  it("parsePortfolioHash: section이 없으면 null을 반환한다", () => {
    expect(parsePortfolioHash("#exem-data-grid")).toBeNull()
  })

  it("parsePortfolioHash: 허용되지 않은 section이면 null을 반환한다", () => {
    expect(parsePortfolioHash("#exem-data-grid.invalid-section")).toBeNull()
  })

  it("parsePortfolioHash: 허용되지 않은 caseId 포맷이면 null을 반환한다", () => {
    expect(parsePortfolioHash("#exem_data_grid.problem")).toBeNull()
  })
})
