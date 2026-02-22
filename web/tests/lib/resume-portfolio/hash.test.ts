import { describe, expect, it } from "vitest"
import {
  buildPortfolioCtaHref,
  buildPortfolioPath,
  parsePortfolioCtaHref,
  parsePortfolioPath,
} from "@/lib/resume-portfolio/hash"

describe("resume-portfolio hash", () => {
  it("buildPortfolioCtaHref: caseId와 sectionId를 CTA 링크 규칙으로 생성한다", () => {
    expect(buildPortfolioCtaHref("exem-data-grid", "key-decisions")).toBe(
      "/portfolio/exem-data-grid#key-decisions"
    )
  })

  it("buildPortfolioPath: 하위 호환 path 규칙을 생성한다", () => {
    expect(buildPortfolioPath("exem-data-grid", "tldr")).toBe("/exem-data-grid#tldr")
  })

  it("buildPortfolioCtaHref: 유효하지 않은 caseId면 에러를 던진다", () => {
    expect(() => buildPortfolioCtaHref("Exem Data Grid", "tldr")).toThrow("Invalid caseId format")
  })

  it("parsePortfolioCtaHref: 유효한 CTA 링크를 파싱한다", () => {
    expect(parsePortfolioCtaHref("/portfolio/exem-customer-dashboard#validation-impact")).toEqual({
      caseId: "exem-customer-dashboard",
      sectionId: "validation-impact",
    })
  })

  it("parsePortfolioCtaHref: 허용되지 않은 section이면 null을 반환한다", () => {
    expect(parsePortfolioCtaHref("/portfolio/exem-data-grid#overview")).toBeNull()
  })

  it("parsePortfolioCtaHref: 레거시 /portfolio#case.section 포맷은 null을 반환한다", () => {
    expect(parsePortfolioCtaHref("/portfolio#exem-data-grid.overview")).toBeNull()
  })

  it("parsePortfolioPath: 유효한 해시를 파싱한다", () => {
    expect(parsePortfolioPath("/exem-customer-dashboard#implementation-highlights")).toEqual({
      caseId: "exem-customer-dashboard",
      sectionId: "implementation-highlights",
    })
  })

  it("parsePortfolioPath: / 없이 들어와도 파싱한다", () => {
    expect(parsePortfolioPath("exem-new-generation#problem-definition")).toEqual({
      caseId: "exem-new-generation",
      sectionId: "problem-definition",
    })
  })

  it("parsePortfolioPath: 허용되지 않은 section이면 null을 반환한다", () => {
    expect(parsePortfolioPath("/exem-data-grid#threads")).toBeNull()
  })

  it("parsePortfolioPath: section이 없으면 null을 반환한다", () => {
    expect(parsePortfolioPath("/exem-data-grid")).toBeNull()
  })

  it("parsePortfolioPath: 허용되지 않은 caseId 포맷이면 null을 반환한다", () => {
    expect(parsePortfolioPath("/exem_data_grid#tldr")).toBeNull()
  })
})
