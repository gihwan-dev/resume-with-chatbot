import { describe, expect, it, vi } from "vitest"

const { mockGetCollection, mockGetObsidianBlogPosts } = vi.hoisted(() => ({
  mockGetCollection: vi.fn(),
  mockGetObsidianBlogPosts: vi.fn(),
}))

vi.mock("@/lib/blog/obsidian-publish", () => ({
  getObsidianBlogPosts: mockGetObsidianBlogPosts,
}))

vi.mock("astro:content", () => ({
  getCollection: mockGetCollection,
}))

import { serializeResumeData } from "../../../src/lib/pdf/serialize-resume"

describe("serializeResumeData", () => {
  function setupCollections(options?: {
    includeOptionalFields?: boolean
    includeUnmappedCompanyProject?: boolean
    includeDuplicateTitleUnmappedProject?: boolean
  }) {
    const includeOptionalFields = options?.includeOptionalFields ?? false
    const includeUnmappedCompanyProject = options?.includeUnmappedCompanyProject ?? false
    const includeDuplicateTitleUnmappedProject =
      options?.includeDuplicateTitleUnmappedProject ?? false

    mockGetCollection.mockReset()
    mockGetObsidianBlogPosts.mockReset()
    mockGetCollection.mockImplementation(async (collectionName) => {
      switch (collectionName) {
        case "basics":
          return [
            {
              data: {
                name: "최기환",
                label: "Frontend Developer",
                email: "test@example.com",
                url: "https://resume-with-ai.gihwan-dev.com",
                summary: "summary",
                profiles: [],
                ...(includeOptionalFields
                  ? {
                      heroMetrics: [
                        {
                          value: "10초 -> 3초",
                          label: "장애 인지 시간 단축",
                          description: "운영 대응 시작 시점을 앞당겼습니다.",
                        },
                        {
                          value: "90%",
                          label: "DOM 감소",
                        },
                      ],
                    }
                  : {}),
              },
            },
          ] as never
        case "work":
          return [
            {
              data: {
                companyId: "exem",
                company: "Exem",
                role: "Frontend Engineer",
                dateStart: new Date("2024-11-01"),
                dateEnd: undefined,
                isCurrent: true,
                location: "Seoul",
                summary: "work summary",
                highlights: [],
              },
            },
            {
              data: {
                companyId: "kmong",
                company: "Kmong",
                role: "Freelancer",
                dateStart: new Date("2023-06-01"),
                dateEnd: new Date("2023-12-01"),
                isCurrent: false,
                location: undefined,
                summary: "freelance summary",
                highlights: [
                  "총 12건의 프로젝트에서 요구사항 정의부터 배포까지 전 과정을 단독 수행",
                  "5점 만점 리뷰 9건 확보",
                ],
              },
            },
          ] as never
        case "projects":
          return [
            {
              id: "exem-customer-dashboard",
              data: {
                companyId: "exem",
                title: "고객 특화 DB 모니터링 대시보드 개발",
                company: "Exem",
                description: "project summary",
                techStack: ["React", "TypeScript", "TanStack Query"],
                link: undefined,
                github: undefined,
                dateStart: new Date("2025-01-01"),
                dateEnd: undefined,
                priority: 1,
                ...(includeOptionalFields
                  ? {
                      storyThread: {
                        tldrSummary: "핵심 병목을 구조 전환으로 해결했습니다.",
                        keyMetrics: [
                          {
                            value: "10초 -> 3초",
                            label: "장애 인지 시간 단축",
                            description: "초기 대응 속도를 높였습니다.",
                          },
                          {
                            value: "73~82%",
                            label: "인터랙션 지연 개선",
                            description: "조작 중 지연을 완화했습니다.",
                          },
                          {
                            value: "20%+",
                            label: "DOM 감소",
                            description: "렌더링 비용을 줄였습니다.",
                          },
                        ],
                        coreApproach: "정책 통합과 구조 전환, 회귀 자동화를 결합 설계했습니다.",
                        problemDefinition: "분산 정책과 화면 밀도 한계가 병목이었습니다.",
                        problemPoints: ["정책 편차가 있었습니다.", "렌더 경합이 있었습니다."],
                        decisions: [
                          {
                            title: "중앙 정책 통합",
                            whyThisChoice: "운영 일관성이 필요했습니다.",
                            alternative: "A안: 분산 유지 / B안: 통합",
                            tradeOff: "복잡도는 증가했지만 운영 일관성이 높아졌습니다.",
                          },
                          {
                            title: "그리드 전환",
                            whyThisChoice: "대량 비교 속도가 중요했습니다.",
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
                          measurementMethod: "React Profiler 동일 시나리오 30회 평균값 기준",
                          metrics: ["인지 시간: 10초 -> 3초", "지연: 73~82% 감소"],
                          operationalImpact: "운영 대응 속도가 빨라졌습니다.",
                        },
                        lessonsLearned: "구조 개선과 검증 자동화는 함께 설계해야 합니다.",
                      },
                    }
                  : {}),
              },
              body: "project body",
            },
            {
              id: "exem-data-grid",
              data: {
                companyId: "exem",
                title: "데이터 그리드 개발",
                company: "Exem",
                description: "project summary",
                techStack: ["React", "TanStack Table", "TanStack Virtual"],
                link: undefined,
                github: undefined,
                dateStart: new Date("2025-02-01"),
                dateEnd: undefined,
                priority: 2,
              },
              body: "project body",
            },
            {
              id: "exem-new-generation",
              data: {
                companyId: "exem",
                title: "차세대 데이터베이스 성능 모니터링 제품 개발",
                company: "Exem",
                description: "project summary",
                techStack: ["React", "TypeScript", "Zustand"],
                link: undefined,
                github: undefined,
                dateStart: new Date("2025-03-01"),
                dateEnd: undefined,
                priority: 3,
              },
              body: "project body",
            },
            {
              id: "exem-dx-improvement",
              data: {
                companyId: "exem",
                title: "개발 생산성 향상 및 자동화 인프라 구축",
                company: "Exem",
                description: "project summary",
                techStack: ["Nest.js", "TypeScript", "Docker"],
                link: undefined,
                github: undefined,
                dateStart: new Date("2025-04-01"),
                dateEnd: undefined,
                priority: 4,
              },
              body: "project body",
            },
            ...(includeUnmappedCompanyProject
              ? [
                  {
                    id: "exem-unmapped-maintenance",
                    data: {
                      companyId: "exem",
                      title: "매핑 누락 프로젝트",
                      company: "Exem",
                      description: "project summary",
                      techStack: ["React"],
                      link: undefined,
                      github: undefined,
                      dateStart: new Date("2025-05-01"),
                      dateEnd: undefined,
                      priority: 5,
                    },
                    body: "project body",
                  },
                ]
              : []),
            ...(includeDuplicateTitleUnmappedProject
              ? [
                  {
                    id: "exem-unmapped-same-title",
                    data: {
                      companyId: "exem",
                      title: "고객 특화 DB 모니터링 대시보드 개발",
                      company: "Exem",
                      description: "project summary",
                      techStack: ["React"],
                      link: undefined,
                      github: undefined,
                      dateStart: new Date("2025-06-01"),
                      dateEnd: undefined,
                      priority: 6,
                    },
                    body: "project body",
                  },
                ]
              : []),
          ] as never
        case "education":
          return [] as never
        case "certificates":
          return [] as never
        case "awards":
          return [] as never
        case "skills":
          return [
            {
              data: {
                categories: [{ name: "Frontend", items: ["React"] }],
              },
            },
          ] as never
        default:
          return [] as never
      }
    })
  }

  it("신규 필드가 없을 때도 기존 구조를 유지하며 직렬화한다", async () => {
    setupCollections()

    const blogPosts = [
      {
        title: "리액트 아키텍처 글",
        url: "https://publish.obsidian.md/gihwan-dev/50-Blog/sample-post",
        publishedAt: "2026-01-11T08:17:53.000Z",
        summary: "요약",
      },
    ]
    mockGetObsidianBlogPosts.mockResolvedValue(blogPosts)

    const result = await serializeResumeData()

    expect(mockGetObsidianBlogPosts).toHaveBeenCalledWith({ limit: 5 })
    expect(result.blogPosts).toEqual(blogPosts)
    expect(result.projects).toHaveLength(4)
    expect(result.projects[0].summary).toContain("장애 인지 시간을 70% 단축")
    expect(result.projects[0].accomplishments.length).toBeGreaterThan(0)
    expect(result.projects[0].evidenceIds.length).toBeGreaterThan(0)
    expect(result.work).toHaveLength(2)
    expect(result.work[0].projectTitles).toEqual([])
    expect(result.work[0].projectCases).toHaveLength(4)
    expect(result.work[0].projectCases?.map((projectCase) => projectCase.projectId)).toEqual([
      "exem-customer-dashboard",
      "exem-data-grid",
      "exem-new-generation",
      "exem-dx-improvement",
    ])
    for (const projectCase of result.work[0].projectCases ?? []) {
      expect(projectCase.accomplishments.length).toBeLessThanOrEqual(2)
      expect(projectCase.architectureSummary).toBeUndefined()
      expect(projectCase.measurementMethod).toBeUndefined()
      expect(projectCase.tradeOffs).toBeUndefined()
    }
    expect(result.work[1].projectCases).toBeUndefined()
    expect(result.work[1].projectTitles).toEqual([])
    expect(result.work[1].highlights).toEqual([
      "총 12건의 프로젝트에서 요구사항 정의부터 배포까지 전 과정을 단독 수행",
      "5점 만점 리뷰 9건 확보",
    ])
    expect(result.profile.heroMetrics).toBeUndefined()
    for (const project of result.projects) {
      expect(project.architectureSummary).toBeUndefined()
      expect(project.measurementMethod).toBeUndefined()
      expect(project.tradeOffs).toBeUndefined()
    }
  })

  it("신규 optional 필드가 존재하면 PDF 직렬화에 반영한다", async () => {
    setupCollections({ includeOptionalFields: true })

    const blogPosts = [
      {
        title: "리액트 아키텍처 글",
        url: "https://publish.obsidian.md/gihwan-dev/50-Blog/sample-post",
        publishedAt: "2026-01-11T08:17:53.000Z",
        summary: "요약",
      },
    ]
    mockGetObsidianBlogPosts.mockResolvedValue(blogPosts)

    const result = await serializeResumeData()

    expect(result.profile.heroMetrics).toEqual([
      {
        value: "10초 -> 3초",
        label: "장애 인지 시간 단축",
        description: "운영 대응 시작 시점을 앞당겼습니다.",
      },
      {
        value: "90%",
        label: "DOM 감소",
      },
    ])
    expect(result.work[0].projectCases).toHaveLength(4)
    const dashboardCase = result.work[0].projectCases?.[0]
    expect(dashboardCase?.projectId).toBe("exem-customer-dashboard")
    expect(dashboardCase?.title).toBe("고객 특화 DB 모니터링 대시보드 개발")
    expect(dashboardCase?.summary).toContain("장애 인지 시간을 70% 단축")
    expect(dashboardCase?.accomplishments).toHaveLength(2)
    expect(dashboardCase?.measurementMethod).toBe("React Profiler 동일 시나리오 30회 평균값 기준")
    expect(dashboardCase?.tradeOffs).toEqual([
      "복잡도는 증가했지만 운영 일관성이 높아졌습니다.",
      "적응 비용은 늘지만 판단 속도가 빨라집니다.",
    ])
    expect(result.work[1].projectCases).toBeUndefined()

    const dashboardProject = result.projects.find(
      (project) => project.resumeItemId === "project-exem-customer-dashboard"
    )
    expect(dashboardProject?.architectureSummary).toBe(
      "정책 통합과 구조 전환, 회귀 자동화를 결합 설계했습니다."
    )
    expect(dashboardProject?.measurementMethod).toBe(
      "React Profiler 동일 시나리오 30회 평균값 기준"
    )
    expect(dashboardProject?.tradeOffs).toEqual([
      "복잡도는 증가했지만 운영 일관성이 높아졌습니다.",
      "적응 비용은 늘지만 판단 속도가 빨라집니다.",
    ])

    const dataGridProject = result.projects.find(
      (project) => project.resumeItemId === "project-exem-data-grid"
    )
    expect(dataGridProject?.architectureSummary).toBeUndefined()
    expect(dataGridProject?.measurementMethod).toBeUndefined()
    expect(dataGridProject?.tradeOffs).toBeUndefined()
  })

  it("일부 프로젝트만 projectCases로 매핑돼도 unmapped projectTitles는 유지한다", async () => {
    setupCollections({ includeUnmappedCompanyProject: true })
    mockGetObsidianBlogPosts.mockResolvedValue([])

    const result = await serializeResumeData()
    const exemWork = result.work[0]

    expect(exemWork.projectCases).toHaveLength(4)
    expect(exemWork.projectCases?.map((projectCase) => projectCase.projectId)).toEqual([
      "exem-customer-dashboard",
      "exem-data-grid",
      "exem-new-generation",
      "exem-dx-improvement",
    ])
    expect(exemWork.projectTitles).toEqual(["매핑 누락 프로젝트"])
    expect(
      exemWork.projectCases?.some((projectCase) => projectCase.title === "매핑 누락 프로젝트")
    ).toBe(false)
  })

  it("동명 프로젝트가 있어도 mapped/unmapped를 projectId 기준으로 분리한다", async () => {
    setupCollections({ includeDuplicateTitleUnmappedProject: true })
    mockGetObsidianBlogPosts.mockResolvedValue([])

    const result = await serializeResumeData()
    const exemWork = result.work[0]

    expect(exemWork.projectCases).toHaveLength(4)
    expect(exemWork.projectCases?.map((projectCase) => projectCase.projectId)).toContain(
      "exem-customer-dashboard"
    )
    expect(
      exemWork.projectCases?.filter(
        (projectCase) => projectCase.title === "고객 특화 DB 모니터링 대시보드 개발"
      )
    ).toHaveLength(1)
    expect(exemWork.projectTitles).toEqual(["고객 특화 DB 모니터링 대시보드 개발"])
  })
})
