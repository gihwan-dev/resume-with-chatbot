import { describe, expect, it } from "vitest"
import type { ResumeSummaryBlock } from "@/lib/resume-portfolio/contracts"
import { buildResumePortfolioContracts } from "@/lib/resume-portfolio/derive"
import { validateResumePortfolioMapping } from "@/lib/resume-portfolio/validation"

const MOCK_PROJECTS = [
  {
    id: "exem-customer-dashboard",
    data: {
      title: "고객 특화 DB 모니터링 대시보드 개발",
      techStack: ["React", "TypeScript", "TanStack Query"],
    },
  },
  {
    id: "exem-data-grid",
    data: {
      title: "데이터 그리드 개발",
      techStack: ["React", "TanStack Table", "TanStack Virtual"],
    },
  },
  {
    id: "exem-new-generation",
    data: {
      title: "차세대 데이터베이스 성능 모니터링 제품 개발",
      techStack: ["React", "TypeScript", "Zustand"],
    },
  },
  {
    id: "exem-dx-improvement",
    data: {
      title: "개발 생산성 향상 및 자동화 인프라 구축",
      techStack: ["Nest.js", "TypeScript", "Docker"],
    },
  },
] as const

function createContracts() {
  return buildResumePortfolioContracts(MOCK_PROJECTS)
}

describe("validateResumePortfolioMapping", () => {
  it("정상 케이스: 4개 프로젝트가 1:1 매핑되면 isValid=true", () => {
    const contracts = createContracts()
    const result = validateResumePortfolioMapping({
      resumeItems: contracts.resumeItems,
      mappings: contracts.mappings,
      cases: contracts.cases,
      summaryBlocks: contracts.summaryBlocks,
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it("누락 케이스: resume 항목 매핑 누락 시 오류를 반환한다", () => {
    const contracts = createContracts()
    const result = validateResumePortfolioMapping({
      resumeItems: contracts.resumeItems,
      mappings: contracts.mappings.slice(0, -1),
      cases: contracts.cases,
      summaryBlocks: contracts.summaryBlocks,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("매핑이 누락된 resumeItemId")])
    )
  })

  it("중복 케이스: 동일 resumeItemId 중복 매핑 시 오류를 반환한다", () => {
    const contracts = createContracts()
    const duplicateMappings = contracts.mappings.map((item) => ({ ...item }))
    duplicateMappings[1] = {
      ...duplicateMappings[1],
      resumeItemId: duplicateMappings[0].resumeItemId,
    }

    const result = validateResumePortfolioMapping({
      resumeItems: contracts.resumeItems,
      mappings: duplicateMappings,
      cases: contracts.cases,
      summaryBlocks: contracts.summaryBlocks,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("resumeItemId가 중복 매핑되었습니다")])
    )
  })

  it("깨진 링크 케이스: 존재하지 않는 portfolioCaseId면 오류를 반환한다", () => {
    const contracts = createContracts()
    const brokenMappings = contracts.mappings.map((item) => ({ ...item }))
    brokenMappings[0] = {
      ...brokenMappings[0],
      portfolioCaseId: "unknown-case",
    }

    const result = validateResumePortfolioMapping({
      resumeItems: contracts.resumeItems,
      mappings: brokenMappings,
      cases: contracts.cases,
      summaryBlocks: contracts.summaryBlocks,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("알 수 없는 portfolioCaseId")])
    )
  })

  it("깨진 섹션 케이스: 허용되지 않은 sectionId면 오류를 반환한다", () => {
    const contracts = createContracts()
    const brokenMappings = contracts.mappings.map((item) => ({ ...item }))
    brokenMappings[0] = {
      ...brokenMappings[0],
      defaultSectionId: "invalid-section" as (typeof brokenMappings)[number]["defaultSectionId"],
    }

    const result = validateResumePortfolioMapping({
      resumeItems: contracts.resumeItems,
      mappings: brokenMappings,
      cases: contracts.cases,
      summaryBlocks: contracts.summaryBlocks,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("허용되지 않은 sectionId")])
    )
  })

  it("선택 매핑 케이스: hasPortfolio=false 항목 누락 시 warning만 반환한다", () => {
    const contracts = createContracts()
    const result = validateResumePortfolioMapping({
      resumeItems: [
        ...contracts.resumeItems,
        {
          resumeItemId: "project-side-quest",
          hasPortfolio: false,
        },
      ],
      mappings: contracts.mappings,
      cases: contracts.cases,
      summaryBlocks: contracts.summaryBlocks,
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.warnings).toEqual(
      expect.arrayContaining([expect.stringContaining("선택 매핑 항목이 누락되었습니다")])
    )
  })

  it("호환성: resumeItemIds 입력도 기존처럼 검증된다", () => {
    const contracts = createContracts()
    const result = validateResumePortfolioMapping({
      resumeItemIds: contracts.resumeItems.map((item) => item.resumeItemId),
      mappings: contracts.mappings.slice(0, -1),
      cases: contracts.cases,
      summaryBlocks: contracts.summaryBlocks,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("매핑이 누락된 resumeItemId")])
    )
  })

  it("CTA 누락 케이스: hasPortfolio=true 항목의 ctaHref 누락 시 오류를 반환한다", () => {
    const contracts = createContracts()
    const brokenSummaryBlocks = contracts.summaryBlocks.map((item) => ({ ...item }))
    brokenSummaryBlocks[0] = {
      ...brokenSummaryBlocks[0],
      ctaHref: undefined,
    }

    const result = validateResumePortfolioMapping({
      resumeItems: contracts.resumeItems,
      mappings: contracts.mappings,
      cases: contracts.cases,
      summaryBlocks: brokenSummaryBlocks,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("CTA href가 누락된 resumeItemId")])
    )
  })

  it("CTA 형식 오류 케이스: /portfolio/[slug]#section 형식이 아니면 오류를 반환한다", () => {
    const contracts = createContracts()
    const brokenSummaryBlocks = contracts.summaryBlocks.map((item) => ({ ...item }))
    brokenSummaryBlocks[0] = {
      ...brokenSummaryBlocks[0],
      ctaHref: "/portfolio#exem-customer-dashboard.overview",
    }

    const result = validateResumePortfolioMapping({
      resumeItems: contracts.resumeItems,
      mappings: contracts.mappings,
      cases: contracts.cases,
      summaryBlocks: brokenSummaryBlocks,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("CTA href 형식이 잘못되었습니다")])
    )
  })

  it("CTA caseId 불일치 케이스: 매핑과 다르면 오류를 반환한다", () => {
    const contracts = createContracts()
    const brokenSummaryBlocks = contracts.summaryBlocks.map((item) => ({ ...item }))
    brokenSummaryBlocks[0] = {
      ...brokenSummaryBlocks[0],
      ctaHref: "/portfolio/exem-data-grid#overview",
    }

    const result = validateResumePortfolioMapping({
      resumeItems: contracts.resumeItems,
      mappings: contracts.mappings,
      cases: contracts.cases,
      summaryBlocks: brokenSummaryBlocks,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("CTA href의 caseId가 매핑과 다릅니다")])
    )
  })

  it("CTA sectionId 불일치 케이스: 매핑 기본 섹션과 다르면 오류를 반환한다", () => {
    const contracts = createContracts()
    const brokenSummaryBlocks = contracts.summaryBlocks.map((item) => ({ ...item }))
    brokenSummaryBlocks[0] = {
      ...brokenSummaryBlocks[0],
      ctaHref: "/portfolio/exem-customer-dashboard#problem",
    }

    const result = validateResumePortfolioMapping({
      resumeItems: contracts.resumeItems,
      mappings: contracts.mappings,
      cases: contracts.cases,
      summaryBlocks: brokenSummaryBlocks,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("CTA href의 sectionId가 매핑과 다릅니다")])
    )
  })

  it("근거 누락 케이스: evidenceIds가 비어 있으면 오류를 반환한다", () => {
    const contracts = createContracts()
    const brokenSummaryBlocks = contracts.summaryBlocks.map((item) => ({ ...item }))
    brokenSummaryBlocks[0] = {
      ...brokenSummaryBlocks[0],
      evidenceIds: [],
    }

    const result = validateResumePortfolioMapping({
      resumeItems: contracts.resumeItems,
      mappings: contracts.mappings,
      cases: contracts.cases,
      summaryBlocks: brokenSummaryBlocks,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("evidenceIds가 누락된 resumeItemId")])
    )
  })

  it("근거 중복 케이스: evidenceIds가 중복되면 오류를 반환한다", () => {
    const contracts = createContracts()
    const brokenSummaryBlocks = contracts.summaryBlocks.map((item) => ({ ...item }))
    brokenSummaryBlocks[0] = {
      ...brokenSummaryBlocks[0],
      evidenceIds: ["ACH-20260206-001", "ACH-20260206-001"],
    }

    const result = validateResumePortfolioMapping({
      resumeItems: contracts.resumeItems,
      mappings: contracts.mappings,
      cases: contracts.cases,
      summaryBlocks: brokenSummaryBlocks as ResumeSummaryBlock[],
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("evidenceIds가 중복된 resumeItemId")])
    )
  })
})
