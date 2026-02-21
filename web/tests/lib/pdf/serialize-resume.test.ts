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
  it("blogPosts를 포함해 직렬화한다", async () => {
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
                company: "Exem",
                role: "Frontend Engineer",
                dateStart: new Date("2024-11-01"),
                dateEnd: undefined,
                isCurrent: true,
                location: "Seoul",
                summary: "work summary",
              },
            },
          ] as never
        case "projects":
          return [
            {
              id: "exem-customer-dashboard",
              data: {
                title: "고객 특화 DB 모니터링 대시보드 개발",
                company: "Exem",
                description: "project summary",
                techStack: ["React", "TypeScript", "TanStack Query"],
                link: undefined,
                github: undefined,
                dateStart: new Date("2025-01-01"),
                dateEnd: undefined,
                priority: 1,
              },
              body: "project body",
            },
            {
              id: "exem-data-grid",
              data: {
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
              },
            },
          ] as never
        default:
          return [] as never
      }
    })

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
    expect(result.work).toHaveLength(1)
  })
})
