import { describe, expect, it } from "vitest"
import {
  PORTFOLIO_CASES_V1,
  RESUME_ITEMS_V1,
  RESUME_PORTFOLIO_MAPPING_V1,
  RESUME_SUMMARY_BLOCKS_V1,
} from "@/lib/resume-portfolio/mapping"
import { validateResumePortfolioMapping } from "@/lib/resume-portfolio/validation"

describe("validateResumePortfolioMapping", () => {
  it("정상 케이스: 4개 프로젝트가 1:1 매핑되면 isValid=true", () => {
    const result = validateResumePortfolioMapping({
      resumeItems: RESUME_ITEMS_V1,
      mappings: RESUME_PORTFOLIO_MAPPING_V1,
      cases: PORTFOLIO_CASES_V1,
      summaryBlocks: RESUME_SUMMARY_BLOCKS_V1,
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it("누락 케이스: resume 항목 매핑 누락 시 오류를 반환한다", () => {
    const result = validateResumePortfolioMapping({
      resumeItems: RESUME_ITEMS_V1,
      mappings: RESUME_PORTFOLIO_MAPPING_V1.slice(0, -1),
      cases: PORTFOLIO_CASES_V1,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("매핑이 누락된 resumeItemId")])
    )
  })

  it("중복 케이스: 동일 resumeItemId 중복 매핑 시 오류를 반환한다", () => {
    const duplicateMappings = RESUME_PORTFOLIO_MAPPING_V1.map((item) => ({ ...item }))
    duplicateMappings[1] = {
      ...duplicateMappings[1],
      resumeItemId: duplicateMappings[0].resumeItemId,
    }

    const result = validateResumePortfolioMapping({
      resumeItems: RESUME_ITEMS_V1,
      mappings: duplicateMappings,
      cases: PORTFOLIO_CASES_V1,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("resumeItemId가 중복 매핑되었습니다")])
    )
  })

  it("깨진 링크 케이스: 존재하지 않는 portfolioCaseId면 오류를 반환한다", () => {
    const brokenMappings = RESUME_PORTFOLIO_MAPPING_V1.map((item) => ({ ...item }))
    brokenMappings[0] = {
      ...brokenMappings[0],
      portfolioCaseId: "unknown-case",
    }

    const result = validateResumePortfolioMapping({
      resumeItems: RESUME_ITEMS_V1,
      mappings: brokenMappings,
      cases: PORTFOLIO_CASES_V1,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("알 수 없는 portfolioCaseId")])
    )
  })

  it("깨진 섹션 케이스: 허용되지 않은 sectionId면 오류를 반환한다", () => {
    const brokenMappings = RESUME_PORTFOLIO_MAPPING_V1.map((item) => ({ ...item }))
    brokenMappings[0] = {
      ...brokenMappings[0],
      defaultSectionId: "invalid-section" as (typeof brokenMappings)[number]["defaultSectionId"],
    }

    const result = validateResumePortfolioMapping({
      resumeItems: RESUME_ITEMS_V1,
      mappings: brokenMappings,
      cases: PORTFOLIO_CASES_V1,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("허용되지 않은 sectionId")])
    )
  })

  it("선택 매핑 케이스: hasPortfolio=false 항목 누락 시 warning만 반환한다", () => {
    const result = validateResumePortfolioMapping({
      resumeItems: [
        ...RESUME_ITEMS_V1,
        {
          resumeItemId: "project-side-quest",
          hasPortfolio: false,
        },
      ],
      mappings: RESUME_PORTFOLIO_MAPPING_V1,
      cases: PORTFOLIO_CASES_V1,
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.warnings).toEqual(
      expect.arrayContaining([expect.stringContaining("선택 매핑 항목이 누락되었습니다")])
    )
  })

  it("호환성: resumeItemIds 입력도 기존처럼 검증된다", () => {
    const result = validateResumePortfolioMapping({
      resumeItemIds: RESUME_ITEMS_V1.map((item) => item.resumeItemId),
      mappings: RESUME_PORTFOLIO_MAPPING_V1.slice(0, -1),
      cases: PORTFOLIO_CASES_V1,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("매핑이 누락된 resumeItemId")])
    )
  })

  it("CTA 누락 케이스: hasPortfolio=true 항목의 ctaHref 누락 시 오류를 반환한다", () => {
    const brokenSummaryBlocks = RESUME_SUMMARY_BLOCKS_V1.map((item) => ({ ...item }))
    brokenSummaryBlocks[0] = {
      ...brokenSummaryBlocks[0],
      ctaHref: undefined,
    }

    const result = validateResumePortfolioMapping({
      resumeItems: RESUME_ITEMS_V1,
      mappings: RESUME_PORTFOLIO_MAPPING_V1,
      cases: PORTFOLIO_CASES_V1,
      summaryBlocks: brokenSummaryBlocks,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("CTA href가 누락된 resumeItemId")])
    )
  })

  it("CTA 형식 오류 케이스: /portfolio/[slug]#section 형식이 아니면 오류를 반환한다", () => {
    const brokenSummaryBlocks = RESUME_SUMMARY_BLOCKS_V1.map((item) => ({ ...item }))
    brokenSummaryBlocks[0] = {
      ...brokenSummaryBlocks[0],
      ctaHref: "/portfolio#exem-customer-dashboard.overview",
    }

    const result = validateResumePortfolioMapping({
      resumeItems: RESUME_ITEMS_V1,
      mappings: RESUME_PORTFOLIO_MAPPING_V1,
      cases: PORTFOLIO_CASES_V1,
      summaryBlocks: brokenSummaryBlocks,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("CTA href 형식이 잘못되었습니다")])
    )
  })

  it("CTA caseId 불일치 케이스: 매핑과 다르면 오류를 반환한다", () => {
    const brokenSummaryBlocks = RESUME_SUMMARY_BLOCKS_V1.map((item) => ({ ...item }))
    brokenSummaryBlocks[0] = {
      ...brokenSummaryBlocks[0],
      ctaHref: "/portfolio/exem-data-grid#overview",
    }

    const result = validateResumePortfolioMapping({
      resumeItems: RESUME_ITEMS_V1,
      mappings: RESUME_PORTFOLIO_MAPPING_V1,
      cases: PORTFOLIO_CASES_V1,
      summaryBlocks: brokenSummaryBlocks,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("CTA href의 caseId가 매핑과 다릅니다")])
    )
  })

  it("CTA sectionId 불일치 케이스: 매핑 기본 섹션과 다르면 오류를 반환한다", () => {
    const brokenSummaryBlocks = RESUME_SUMMARY_BLOCKS_V1.map((item) => ({ ...item }))
    brokenSummaryBlocks[0] = {
      ...brokenSummaryBlocks[0],
      ctaHref: "/portfolio/exem-customer-dashboard#problem",
    }

    const result = validateResumePortfolioMapping({
      resumeItems: RESUME_ITEMS_V1,
      mappings: RESUME_PORTFOLIO_MAPPING_V1,
      cases: PORTFOLIO_CASES_V1,
      summaryBlocks: brokenSummaryBlocks,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("CTA href의 sectionId가 매핑과 다릅니다")])
    )
  })
})
