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
  function setupCollections(options?: { includeOptionalFields?: boolean }) {
    const includeOptionalFields = options?.includeOptionalFields ?? false

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
                        context: "문제 배경",
                        architectureSummary: "구조 전환으로 렌더링 병목을 해소했습니다.",
                        measurementMethod: "React Profiler 동일 시나리오 30회 평균값 기준",
                        impacts: [
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
                        ],
                        threads: [
                          {
                            issueTitle: "분산된 폴링 규칙",
                            problems: ["정책 편차가 있었습니다."],
                            thoughtProcess: "중앙화가 필요했습니다.",
                            actions: ["Polling Manager 적용"],
                            tradeOff: "복잡도는 증가했지만 운영 일관성이 높아졌습니다.",
                            result: "운영 일관성을 확보했습니다.",
                          },
                          {
                            issueTitle: "렌더링 경합",
                            problems: ["리렌더링이 과도했습니다."],
                            thoughtProcess: "렌더링 경계 재설계가 필요했습니다.",
                            actions: ["구조 전환"],
                            tradeOff: "복잡도는 증가했지만 운영 일관성이 높아졌습니다.",
                            result: "성능 안정성을 확보했습니다.",
                          },
                        ],
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
                ...(includeOptionalFields
                  ? {
                      storyThread: {
                        context: "문제 배경",
                        impacts: [
                          {
                            value: "90%",
                            label: "DOM 감소",
                            description: "렌더링 부담을 낮췄습니다.",
                          },
                          {
                            value: "22ms -> 0.5ms",
                            label: "리사이즈 개선",
                            description: "반응성을 높였습니다.",
                          },
                        ],
                        threads: [
                          {
                            issueTitle: "table 구조 한계",
                            problems: ["DOM이 과다했습니다."],
                            thoughtProcess: "가상화가 필요했습니다.",
                            actions: ["div 전환", "가상화 적용"],
                            result: "DOM 부담이 감소했습니다.",
                          },
                          {
                            issueTitle: "이벤트 오버헤드",
                            problems: ["핸들러가 분산됐습니다."],
                            thoughtProcess: "이벤트 위임이 필요했습니다.",
                            actions: ["컨테이너 위임"],
                            result: "오버헤드가 줄었습니다.",
                          },
                        ],
                        lessonsLearned: "구조와 검증을 함께 설계해야 합니다.",
                      },
                    }
                  : {}),
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
                ...(includeOptionalFields
                  ? {
                      coreStrengths: [
                        {
                          title: "대규모 렌더링 아키텍처",
                          summary: "렌더링 경계를 재설계해 고밀도 화면을 안정화합니다.",
                        },
                        {
                          title: "성능 최적화",
                          summary: "측정 기반으로 병목을 제거하고 회귀를 방지합니다.",
                        },
                      ],
                    }
                  : {}),
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
    expect(result.projects[0].summary).toContain("장애 인지 시간을 10초에서 3초로 단축")
    expect(result.projects[0].accomplishments.length).toBeGreaterThan(0)
    expect(result.projects[0].evidenceIds.length).toBeGreaterThan(0)
    expect(result.work).toHaveLength(2)
    expect(result.work[0].projectTitles).toEqual([
      "고객 특화 DB 모니터링 대시보드 개발",
      "데이터 그리드 개발",
      "차세대 데이터베이스 성능 모니터링 제품 개발",
      "개발 생산성 향상 및 자동화 인프라 구축",
    ])
    expect(result.work[1].projectTitles).toEqual([])
    expect(result.work[1].highlights).toEqual([
      "총 12건의 프로젝트에서 요구사항 정의부터 배포까지 전 과정을 단독 수행",
      "5점 만점 리뷰 9건 확보",
    ])
    expect(result.profile.heroMetrics).toBeUndefined()
    expect(result.coreStrengths).toBeUndefined()
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
    expect(result.coreStrengths).toEqual([
      {
        title: "대규모 렌더링 아키텍처",
        summary: "렌더링 경계를 재설계해 고밀도 화면을 안정화합니다.",
      },
      {
        title: "성능 최적화",
        summary: "측정 기반으로 병목을 제거하고 회귀를 방지합니다.",
      },
    ])

    const dashboardProject = result.projects.find(
      (project) => project.resumeItemId === "project-exem-customer-dashboard"
    )
    expect(dashboardProject?.architectureSummary).toBe("구조 전환으로 렌더링 병목을 해소했습니다.")
    expect(dashboardProject?.measurementMethod).toBe(
      "React Profiler 동일 시나리오 30회 평균값 기준"
    )
    expect(dashboardProject?.tradeOffs).toEqual(["복잡도는 증가했지만 운영 일관성이 높아졌습니다."])

    const dataGridProject = result.projects.find(
      (project) => project.resumeItemId === "project-exem-data-grid"
    )
    expect(dataGridProject?.architectureSummary).toBeUndefined()
    expect(dataGridProject?.measurementMethod).toBeUndefined()
    expect(dataGridProject?.tradeOffs).toBeUndefined()
  })
})
