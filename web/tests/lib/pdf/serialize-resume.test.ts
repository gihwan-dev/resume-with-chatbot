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
                dateEnd: undefined,
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
                dateEnd: undefined,
                isCurrent: true,
                variants: ["ai-agent"],
                highlights: [],
              },
            },
          ] as never
        case "projects":
          return [
            {
              id: "exem-data-grid",
              data: {
                companyId: "exem",
                title: "대규모 데이터 화면용 공용 데이터 그리드 개발",
                techStack: ["React"],
                dateStart: new Date("2025-02-01"),
                priority: 2,
                summary: "shared project",
                accomplishments: ["shared accomplishment"],
              },
            },
            {
              id: "ai-automation-swagger-parser-mcp",
              data: {
                companyId: "ai-automation",
                title: "Swagger Parser MCP 서버 개발 및 npm 배포",
                techStack: ["Node.js", "MCP"],
                dateStart: new Date("2024-11-01"),
                priority: 4,
                variants: ["ai-agent"],
                summary: "ai project",
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
                categories: [{ name: "AI", items: ["MCP", "n8n"] }],
              },
            },
          ] as never
        default:
          return [] as never
      }
    })
  }

  it("ai-agent variant에서 shared 경력 + AI 전용 경력/프로젝트와 AI 프로필/스킬을 함께 직렬화한다", async () => {
    setupCollections()
    mockGetObsidianBlogPosts.mockResolvedValue([])

    const result = await serializeResumeData("ai-agent")

    expect(result.profile.label).toBe("AI Native Frontend Developer")
    expect(result.skills?.[0]?.items).toContain("MCP")

    const companies = result.work.map((entry) => entry.company)
    expect(companies).toContain("Exem")
    expect(companies).toContain("개인 R&D")

    const aiWork = result.work.find((entry) => entry.company === "개인 R&D")
    expect(aiWork?.projects?.[0]?.title).toBe("Swagger Parser MCP 서버 개발 및 npm 배포")
    expect(aiWork?.projects?.[0]?.accomplishments.join("\n")).toContain(
      "https://www.npmjs.com/package/swagger-parser-mcp-server"
    )

    const sharedWork = result.work.find((entry) => entry.company === "Exem")
    expect(sharedWork?.projects?.[0]?.title).toBe("대규모 데이터 화면용 공용 데이터 그리드 개발")
  })

  it("invalid variant는 frontend로 fallback 한다", async () => {
    setupCollections()
    mockGetObsidianBlogPosts.mockResolvedValue([])

    const result = await serializeResumeData("unknown-variant")

    expect(result.profile.label).toBe("Frontend Developer")
    expect(result.skills?.[0]?.items).toContain("React")
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
