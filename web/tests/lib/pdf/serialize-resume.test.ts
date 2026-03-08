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
  function setupCollections() {
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
                highlights: ["프로젝트 전 과정을 단독 수행"],
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
                techStack: ["React", "TypeScript"],
                dateStart: new Date("2025-01-01"),
                priority: 1,
                summary: "운영 대시보드 구조를 개선했습니다.",
                accomplishments: ["성과 1", "성과 2"],
              },
            },
            {
              id: "exem-data-grid",
              data: {
                companyId: "exem",
                title: "대규모 데이터 화면용 공용 데이터 그리드 개발",
                techStack: ["React"],
                dateStart: new Date("2025-02-01"),
                priority: 2,
                summary: "그리드 렌더링 경로를 최적화했습니다.",
                accomplishments: ["성과 A"],
              },
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
  }

  it("work.projects 기반으로 데이터를 직렬화한다", async () => {
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
    expect(result.work).toHaveLength(2)
    expect(result.work[0].projects).toEqual([
      {
        projectId: "exem-customer-dashboard",
        title: "인스턴스 통합 모니터링 대시보드 개발",
        summary: "운영 대시보드 구조를 개선했습니다.",
        accomplishments: ["성과 1", "성과 2"],
      },
      {
        projectId: "exem-data-grid",
        title: "대규모 데이터 화면용 공용 데이터 그리드 개발",
        summary: "그리드 렌더링 경로를 최적화했습니다.",
        accomplishments: ["성과 A"],
      },
    ])
    expect(result.work[1].projects).toBeUndefined()
    expect(result.work[1].highlights).toEqual(["프로젝트 전 과정을 단독 수행"])
  })

  it("기본 프로필 데이터가 없으면 오류를 던진다", async () => {
    mockGetCollection.mockReset()
    mockGetCollection.mockResolvedValue([] as never)
    mockGetObsidianBlogPosts.mockResolvedValue([])

    await expect(serializeResumeData()).rejects.toThrow(
      "Profile data is required in basics collection."
    )
  })
})
