import { describe, expect, it, vi } from "vitest"
import { RESUME_PORTFOLIO_CONTENT_V2 } from "../../../src/lib/resume-portfolio/content"

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

const expectedAccomplishmentCounts = new Map(
  RESUME_PORTFOLIO_CONTENT_V2.map((item) => [item.projectId, item.accomplishments.length])
)

function createProjectBody(summary: string): string {
  return `
## TL;DR
${summary}

## 문제 정의
핵심 병목을 먼저 정의했습니다.

## 핵심 의사결정
1. 구조 전환
2. 검증 자동화

## 구현 전략
- 단계별로 기능을 전환했습니다.

## 검증 및 결과
- 지표를 반복 측정했습니다.

## What I Learned
구조와 검증을 함께 설계해야 유지보수가 쉬워집니다.
`.trim()
}

describe("serializeResumeData", () => {
  function setupCollections(options?: {
    includeUnmappedCompanyProject?: boolean
    includeDuplicateTitleUnmappedProject?: boolean
  }) {
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
                title: "인스턴스 통합 모니터링 대시보드 개발",
                techStack: ["React", "TypeScript", "TanStack Query"],
                dateStart: new Date("2025-01-01"),
                priority: 1,
              },
              body: createProjectBody("운영 지표를 한 화면에서 빠르게 판단하도록 개선했습니다."),
            },
            {
              id: "exem-data-grid",
              data: {
                companyId: "exem",
                title: "20+ 기능의 고성능 데이터 그리드 개발",
                techStack: ["React", "TanStack Table", "TanStack Virtual"],
                dateStart: new Date("2025-02-01"),
                priority: 2,
              },
              body: createProjectBody("공용 그리드의 성능과 기능 조합 확장성을 함께 확보했습니다."),
            },
            {
              id: "exem-new-generation",
              data: {
                companyId: "exem",
                title: "차세대 데이터베이스 성능 모니터링 제품 개발",
                techStack: ["React", "TypeScript", "Zustand"],
                dateStart: new Date("2025-03-01"),
                priority: 3,
              },
              body: createProjectBody("신규 차트 추가와 상태 생성 방식을 일관되게 정리했습니다."),
            },
            {
              id: "exem-dx-improvement",
              data: {
                companyId: "exem",
                title: "레거시 프론트엔드 안정화 및 진단 구조 개선",
                techStack: ["ExtJS", "TypeScript", "Oracle"],
                dateStart: new Date("2025-02-01"),
                priority: 4,
              },
              body: createProjectBody("레거시 유지보수의 진단 가능성과 추적 효율을 개선했습니다."),
            },
            ...(includeUnmappedCompanyProject
              ? [
                  {
                    id: "exem-unmapped-maintenance",
                    data: {
                      companyId: "exem",
                      title: "매핑 누락 프로젝트",
                      techStack: ["React"],
                      dateStart: new Date("2025-05-01"),
                      priority: 5,
                    },
                    body: createProjectBody("매핑되지 않은 유지보수 작업을 진행했습니다."),
                  },
                ]
              : []),
            ...(includeDuplicateTitleUnmappedProject
              ? [
                  {
                    id: "exem-unmapped-same-title",
                    data: {
                      companyId: "exem",
                      title: "인스턴스 통합 모니터링 대시보드 개발",
                      techStack: ["React"],
                      dateStart: new Date("2025-06-01"),
                      priority: 6,
                    },
                    body: createProjectBody("동명 프로젝트를 별도 트랙으로 운영했습니다."),
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

  it("기본 구조를 직렬화한다", async () => {
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
    const customerDashboardProject = result.projects.find(
      (project) => project.resumeItemId === "project-exem-customer-dashboard"
    )
    const expectedCustomerDashboard = RESUME_PORTFOLIO_CONTENT_V2.find(
      (item) => item.resumeItemId === "project-exem-customer-dashboard"
    )
    expect(customerDashboardProject).toBeDefined()
    expect(expectedCustomerDashboard).toBeDefined()
    expect(customerDashboardProject?.summary).toBe(expectedCustomerDashboard?.resumeSummary)
    expect(customerDashboardProject?.accomplishments.length).toBe(
      expectedCustomerDashboard?.accomplishments.length
    )
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
      expect(projectCase.accomplishments.length).toBe(
        expectedAccomplishmentCounts.get(projectCase.projectId)
      )
    }
    expect(result.work[1].projectCases).toBeUndefined()
    expect(result.work[1].projectTitles).toEqual([])
    expect(result.work[1].highlights).toEqual([
      "총 12건의 프로젝트에서 요구사항 정의부터 배포까지 전 과정을 단독 수행",
      "5점 만점 리뷰 9건 확보",
    ])
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
        (projectCase) => projectCase.title === "인스턴스 통합 모니터링 대시보드 개발"
      )
    ).toHaveLength(1)
    expect(exemWork.projectTitles).toEqual(["인스턴스 통합 모니터링 대시보드 개발"])
  })
})
