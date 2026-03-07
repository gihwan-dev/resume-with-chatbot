import { describe, expect, it } from "vitest"
import { RESUME_PORTFOLIO_CONTENT_V2 } from "@/lib/resume-portfolio/content"
import { buildResumePortfolioContracts } from "@/lib/resume-portfolio/derive"

const MOCK_PROJECTS = [
  {
    id: "exem-customer-dashboard",
    data: {
      title: "인스턴스 통합 모니터링 대시보드 개발",
      techStack: ["React", "TypeScript", "TanStack Query"],
    },
  },
  {
    id: "exem-data-grid",
    data: {
      title: "20+ 기능의 고성능 데이터 그리드 개발",
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
      title: "레거시 프론트엔드 안정화 및 진단 구조 개선",
      techStack: ["ExtJS", "TypeScript", "Oracle"],
    },
  },
] as const

describe("resume portfolio content schema", () => {
  it("정상 케이스: 4개 콘텐츠에서 계약을 파생한다", () => {
    const contracts = buildResumePortfolioContracts(MOCK_PROJECTS)

    expect(contracts.resumeItems).toHaveLength(4)
    expect(contracts.summaryBlocks).toHaveLength(4)
    expect(contracts.mappings).toHaveLength(4)
    expect(contracts.cases).toHaveLength(4)

    const firstSummaryBlock = contracts.summaryBlocks[0]
    expect(firstSummaryBlock.ctaHref).toBe("/portfolio/exem-customer-dashboard#tldr")
  })

  it("실패 케이스: projectId에 해당하는 프로젝트가 없으면 예외를 던진다", () => {
    const brokenProjects = MOCK_PROJECTS.filter((project) => project.id !== "exem-data-grid")

    expect(() => buildResumePortfolioContracts(brokenProjects)).toThrow(
      "Missing project content entry for projectId: exem-data-grid"
    )
  })

  it("실패 케이스: resumeItemId가 중복되면 예외를 던진다", () => {
    const duplicatedContent = RESUME_PORTFOLIO_CONTENT_V2.map((item) => ({ ...item }))
    duplicatedContent[1] = {
      ...duplicatedContent[1],
      resumeItemId: duplicatedContent[0].resumeItemId,
    }

    expect(() => buildResumePortfolioContracts(MOCK_PROJECTS, duplicatedContent)).toThrow(
      "Duplicate resumeItemId in resume portfolio content"
    )
  })

  it("실패 케이스: sections 계약이 어긋나면 예외를 던진다", () => {
    const brokenContent = RESUME_PORTFOLIO_CONTENT_V2.map((item) => ({ ...item }))
    brokenContent[0] = {
      ...brokenContent[0],
      sections: ["tldr", "problem-definition"],
    }

    expect(() => buildResumePortfolioContracts(MOCK_PROJECTS, brokenContent)).toThrow(
      "sections must exactly match portfolio section contract"
    )
  })
})
