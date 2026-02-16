import { describe, expect, it, vi } from "vitest"

const { mockGetCollection, mockGetVelogPosts } = vi.hoisted(() => ({
  mockGetCollection: vi.fn(),
  mockGetVelogPosts: vi.fn(),
}))

vi.mock("@/lib/blog/velog", () => ({
  getVelogPosts: mockGetVelogPosts,
}))

vi.mock("astro:content", () => ({
  getCollection: mockGetCollection,
}))

import { buildResumePrompt } from "../../../src/lib/resume-prompt"

describe("buildResumePrompt", () => {
  it("최근 블로그 글 섹션을 포함한다", async () => {
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
          return [] as never
        case "projects":
          return [] as never
        case "education":
          return [] as never
        case "certificates":
          return [] as never
        case "awards":
          return [] as never
        default:
          return [] as never
      }
    })

    mockGetVelogPosts.mockResolvedValue([
      {
        title: "리액트로 바라보는 정책과 메커니즘의 분리",
        url: "https://velog.io/@koreanthuglife/sample-post",
        publishedAt: "2026-01-11T08:17:53.000Z",
      },
    ])

    const prompt = await buildResumePrompt()

    expect(mockGetVelogPosts).toHaveBeenCalledWith({ limit: 5 })
    expect(prompt).toContain("## 최근 블로그 글")
    expect(prompt).toContain("리액트로 바라보는 정책과 메커니즘의 분리")
    expect(prompt).toContain("https://velog.io/@koreanthuglife/sample-post")
  })

  it("블로그 데이터가 없으면 최근 블로그 글 섹션을 생략한다", async () => {
    mockGetCollection.mockImplementation(async (collectionName) => {
      if (collectionName === "basics") {
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
      }

      return [] as never
    })

    mockGetVelogPosts.mockResolvedValue([])

    const prompt = await buildResumePrompt()

    expect(prompt).not.toContain("## 최근 블로그 글")
  })
})
