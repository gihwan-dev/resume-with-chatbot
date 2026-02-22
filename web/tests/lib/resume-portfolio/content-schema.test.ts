import { describe, expect, it } from "vitest"
import { RESUME_PORTFOLIO_CONTENT_V2 } from "@/lib/resume-portfolio/content"
import { buildResumePortfolioContracts } from "@/lib/resume-portfolio/derive"

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

describe("resume portfolio content schema", () => {
  it("정상 케이스: 4개 콘텐츠에서 계약을 파생한다", () => {
    const contracts = buildResumePortfolioContracts(MOCK_PROJECTS)

    expect(contracts.resumeItems).toHaveLength(4)
    expect(contracts.summaryBlocks).toHaveLength(4)
    expect(contracts.mappings).toHaveLength(4)
    expect(contracts.cases).toHaveLength(4)

    const firstSummaryBlock = contracts.summaryBlocks[0]
    expect(firstSummaryBlock.ctaHref).toBe("/portfolio/exem-customer-dashboard#hook")
    expect(firstSummaryBlock.evidenceIds.length).toBeGreaterThan(0)
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

  it("실패 케이스: hasPortfolio=true인데 evidenceIds가 비어 있으면 예외를 던진다", () => {
    const invalidEvidenceContent = RESUME_PORTFOLIO_CONTENT_V2.map((item) => ({ ...item }))
    invalidEvidenceContent[0] = {
      ...invalidEvidenceContent[0],
      evidenceIds: [],
    }

    expect(() => buildResumePortfolioContracts(MOCK_PROJECTS, invalidEvidenceContent)).toThrow(
      "Evidence IDs are required for hasPortfolio=true"
    )
  })

  it("점진 도입: storyThread 유무가 혼합되어도 기존 계약 파생은 유지된다", () => {
    const mixedProjects = MOCK_PROJECTS.map((project, index) => {
      if (index !== 0) return project

      return {
        ...project,
        data: {
          ...project.data,
          storyThread: {
            context: "문제 배경",
            impacts: [
              {
                value: "10초 -> 3초",
                label: "인지 속도 개선",
                description: "운영 대응이 빨라졌습니다.",
              },
              {
                value: "73~82%",
                label: "지연 개선",
                description: "상호작용 품질이 개선됐습니다.",
              },
            ],
            threads: [
              {
                issueTitle: "분산 폴링",
                problems: ["정책 편차가 있었습니다."],
                thoughtProcess: "정책 통합이 필요했습니다.",
                actions: ["Polling Manager 적용"],
                result: "운영 일관성을 확보했습니다.",
              },
              {
                issueTitle: "렌더 경합",
                problems: ["DOM 과다 생성이 발생했습니다."],
                thoughtProcess: "화면 구조를 재설계했습니다.",
                actions: ["그리드 구조 전환"],
                result: "렌더링 부담을 줄였습니다.",
              },
            ],
            lessonsLearned: "구조와 검증 자동화를 함께 설계해야 합니다.",
          },
        },
      }
    })

    const contracts = buildResumePortfolioContracts(mixedProjects)
    expect(contracts.resumeItems).toHaveLength(4)
    expect(contracts.summaryBlocks).toHaveLength(4)
    expect(contracts.mappings).toHaveLength(4)
    expect(contracts.cases).toHaveLength(4)
  })
})
