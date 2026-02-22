import { describe, expect, it } from "vitest"
import type { ObsidianBlogPost } from "@/lib/blog/obsidian-publish"
import { curateTechnicalWritingPosts } from "@/lib/blog/technical-writing-curation"

function createPost(params: {
  title: string
  date: string
  summary?: string
  slug: string
}): ObsidianBlogPost {
  return {
    title: params.title,
    summary: params.summary,
    publishedAt: `${params.date}T00:00:00.000Z`,
    url: `https://publish.obsidian.md/gihwan-dev/50-Blog/${params.slug}`,
  }
}

describe("curateTechnicalWritingPosts", () => {
  it("대표 글은 제목/요약 키워드 점수 기준으로 선택한다", () => {
    const posts = [
      createPost({
        title: "일반 회고",
        summary: "개발 과정 정리",
        date: "2026-01-12",
        slug: "retrospective",
      }),
      createPost({
        title: "UI 구현 노트",
        summary: "아키텍처 의사결정과 트레이드오프 정리",
        date: "2026-01-08",
        slug: "ui-note",
      }),
    ]

    const result = curateTechnicalWritingPosts(posts)

    expect(result.featuredPost?.title).toBe("UI 구현 노트")
    expect(result.latestPosts.map((post) => post.title)).toEqual(["일반 회고"])
  })

  it("대표 글은 최신 목록에서 중복 없이 제외된다", () => {
    const posts = [
      createPost({
        title: "아키텍처 설계 가이드",
        summary: "설계 원칙 정리",
        date: "2026-01-10",
        slug: "architecture-guide",
      }),
      createPost({
        title: "성능 개선 회고",
        summary: "성능 측정과 개선기",
        date: "2026-01-09",
        slug: "performance-retro",
      }),
      createPost({
        title: "테스트 자동화",
        summary: "회귀 테스트 설계",
        date: "2026-01-08",
        slug: "test-automation",
      }),
    ]

    const result = curateTechnicalWritingPosts(posts)

    expect(result.featuredPost).not.toBeNull()
    expect(result.latestPosts).toHaveLength(2)
    expect(result.latestPosts.some((post) => post.url === result.featuredPost?.url)).toBe(false)
  })

  it("키워드 점수가 모두 0이면 최신 글을 대표로 선택한다", () => {
    const posts = [
      createPost({
        title: "작업 기록 1",
        summary: "이번 주 작업 메모",
        date: "2026-01-14",
        slug: "weekly-log-1",
      }),
      createPost({
        title: "작업 기록 2",
        summary: "이번 주 작업 메모 2",
        date: "2026-01-12",
        slug: "weekly-log-2",
      }),
    ]

    const result = curateTechnicalWritingPosts(posts)

    expect(result.featuredPost?.title).toBe("작업 기록 1")
    expect(result.latestPosts.map((post) => post.title)).toEqual(["작업 기록 2"])
  })

  it("글 수가 5개 미만이어도 정상 동작한다", () => {
    const posts = [
      createPost({
        title: "성능 개선 가이드",
        summary: "측정 기반 개선 전략",
        date: "2026-01-10",
        slug: "performance-guide",
      }),
    ]

    const result = curateTechnicalWritingPosts(posts)

    expect(result.featuredPost?.title).toBe("성능 개선 가이드")
    expect(result.latestPosts).toEqual([])
  })
})
