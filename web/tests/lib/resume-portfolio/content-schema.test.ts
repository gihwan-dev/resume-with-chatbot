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

  it("점진 도입: storyThread 유무가 혼합되어도 기존 계약 파생은 유지된다", () => {
    const mixedProjects = MOCK_PROJECTS.map((project, index) => {
      if (index !== 0) return project

      return {
        ...project,
        data: {
          ...project.data,
          storyThread: {
            tldrSummary: "핵심 병목을 구조 전환으로 해결했습니다.",
            keyMetrics: [
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
              {
                value: "20%+",
                label: "DOM 감소",
                description: "렌더링 비용을 줄였습니다.",
              },
            ],
            coreApproach: "정책 통합, 구조 전환, 회귀 자동화를 결합 설계했습니다.",
            problemDefinition: "분산 정책과 화면 밀도 한계가 동시에 병목이었습니다.",
            problemPoints: [
              "정책 편차가 있었습니다.",
              "렌더 경합이 있었습니다.",
              "수동 검증 비용이 컸습니다.",
            ],
            decisions: [
              {
                title: "중앙 정책 통합",
                whyThisChoice: "운영 일관성 확보가 우선이었습니다.",
                alternative: "A안: 분산 유지 / B안: 통합",
                tradeOff: "설계 복잡도는 늘지만 회귀 안정성이 높아집니다.",
              },
              {
                title: "그리드 전환",
                whyThisChoice: "대량 비교 속도가 핵심이었습니다.",
                alternative: "A안: 카드 유지 / B안: 그리드",
                tradeOff: "적응 비용은 늘지만 판단 속도가 빨라집니다.",
              },
            ],
            implementationHighlights: [
              "정책 통합을 설계했습니다.",
              "그리드 화면을 재설계했습니다.",
              "회귀 게이트를 표준화했습니다.",
            ],
            validationImpact: {
              measurementMethod: "Profiler 동일 시나리오 30회 평균값",
              metrics: ["인지 시간 10초 -> 3초", "지연 73~82% 감소"],
              operationalImpact: "운영 대응 흐름이 빨라졌습니다.",
            },
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
