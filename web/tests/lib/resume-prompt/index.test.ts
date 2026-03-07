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

    mockGetObsidianBlogPosts.mockResolvedValue([
      {
        title: "리액트로 바라보는 정책과 메커니즘의 분리",
        url: "https://publish.obsidian.md/gihwan-dev/50-Blog/sample-post",
        publishedAt: "2026-01-11T08:17:53.000Z",
      },
    ])

    const prompt = await buildResumePrompt()

    expect(mockGetObsidianBlogPosts).toHaveBeenCalledWith({ limit: 5 })
    expect(prompt).toContain("## 최근 블로그 글")
    expect(prompt).toContain("리액트로 바라보는 정책과 메커니즘의 분리")
    expect(prompt).toContain("https://publish.obsidian.md/gihwan-dev/50-Blog/sample-post")
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

    mockGetObsidianBlogPosts.mockResolvedValue([])

    const prompt = await buildResumePrompt()

    expect(prompt).not.toContain("## 최근 블로그 글")
  })

  it("프로젝트 요약은 TL;DR 첫 문단에서 파생한다", async () => {
    mockGetCollection.mockImplementation(async (collectionName) => {
      switch (collectionName) {
        case "basics":
          return [
            {
              data: {
                name: "최기환",
                label: "Frontend Developer",
                email: "test@example.com",
                summary: "summary",
                profiles: [],
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
                techStack: ["React", "TanStack Table"],
                dateStart: new Date("2025-07-01"),
                priority: 2,
              },
              body: `
## TL;DR
**table 기반 구조의 기능 조합 충돌**을 해결했습니다.

## 문제 정의
문제 정의 내용

## 핵심 의사결정
의사결정 내용

## 구현 전략
구현 전략 내용

## 검증 및 결과
검증 및 결과 내용

## What I Learned
회고 내용
`.trim(),
            },
          ] as never
        default:
          return [] as never
      }
    })

    mockGetObsidianBlogPosts.mockResolvedValue([])

    const prompt = await buildResumePrompt()

    expect(prompt).toContain("- 요약: table 기반 구조의 기능 조합 충돌을 해결했습니다.")
  })
})
