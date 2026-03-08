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

import { buildResumePrompt } from "../../../src/lib/resume-prompt"

describe("buildResumePrompt", () => {
  function setupCollections() {
    mockGetCollection.mockImplementation(async (collectionName) => {
      switch (collectionName) {
        case "basics":
          return [
            {
              data: {
                variant: "frontend",
                name: "최기환",
                label: "Frontend Developer",
                email: "frontend@example.com",
                url: "https://resume-with-ai.gihwan-dev.com",
                summary: "frontend summary",
                profiles: [],
              },
            },
            {
              data: {
                variant: "ai-agent",
                name: "최기환",
                label: "AI Native Frontend Developer",
                email: "ai@example.com",
                url: "https://resume-with-ai.gihwan-dev.com/ai-agent",
                summary: "ai summary",
                profiles: [],
              },
            },
          ] as never
        case "work":
          return [
            {
              id: "exem",
              data: {
                companyId: "exem",
                company: "Exem",
                role: "Frontend Engineer",
                dateStart: new Date("2024-11-01"),
                isCurrent: true,
                highlights: ["shared work"],
              },
            },
            {
              id: "ai-automation",
              data: {
                companyId: "ai-automation",
                company: "개인 R&D",
                role: "AI Automation / Agent Systems",
                dateStart: new Date("2024-11-01"),
                isCurrent: true,
                variants: ["ai-agent"],
                highlights: [],
              },
            },
          ] as never
        case "projects":
          return [
            {
              id: "ai-automation-swagger-parser-mcp",
              data: {
                companyId: "ai-automation",
                title: "Swagger Parser MCP 서버 개발 및 npm 배포",
                techStack: ["Node.js", "MCP"],
                dateStart: new Date("2024-11-01"),
                priority: 4,
                variants: ["ai-agent"],
                summary: "ai project summary",
                accomplishments: [
                  "npm 배포 링크: https://www.npmjs.com/package/swagger-parser-mcp-server",
                ],
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
                variant: "frontend",
                categories: [{ name: "Frontend", items: ["React"] }],
              },
            },
            {
              data: {
                variant: "ai-agent",
                categories: [{ name: "AI", items: ["MCP"] }],
              },
            },
          ] as never
        default:
          return [] as never
      }
    })
  }

  it("ai-agent variant 프롬프트에 AI 라벨/요약/프로젝트와 npm 링크를 포함한다", async () => {
    setupCollections()
    mockGetObsidianBlogPosts.mockResolvedValue([])

    const prompt = await buildResumePrompt("ai-agent")

    expect(prompt).toContain("AI Native Frontend Developer")
    expect(prompt).toContain("ai summary")
    expect(prompt).toContain("Swagger Parser MCP 서버 개발 및 npm 배포")
    expect(prompt).toContain("https://www.npmjs.com/package/swagger-parser-mcp-server")
  })

  it("invalid variant 요청은 frontend 프롬프트로 fallback 한다", async () => {
    setupCollections()
    mockGetObsidianBlogPosts.mockResolvedValue([])

    const prompt = await buildResumePrompt("invalid")

    expect(prompt).toContain("Frontend Developer")
    expect(prompt).not.toContain("AI Native Frontend Developer")
  })

  it("최근 블로그 글 섹션을 포함한다", async () => {
    setupCollections()
    mockGetObsidianBlogPosts.mockResolvedValue([
      {
        title: "리액트로 바라보는 정책과 메커니즘의 분리",
        url: "https://publish.obsidian.md/gihwan-dev/50-Blog/sample-post",
        publishedAt: "2026-01-11T08:17:53.000Z",
      },
    ])

    const prompt = await buildResumePrompt("frontend")

    expect(mockGetObsidianBlogPosts).toHaveBeenCalledWith({ limit: 5 })
    expect(prompt).toContain("## 최근 블로그 글")
    expect(prompt).toContain("리액트로 바라보는 정책과 메커니즘의 분리")
  })
})
