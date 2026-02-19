import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const DAY_MS = 24 * 60 * 60 * 1000

const BLOG_SECTION_HTML = `<!doctype html>
<html>
  <head>
    <script>
      window.siteInfo={"uid":"test-site-uid","host":"publish-01.obsidian.md","status":"active","slug":"gihwan-dev"};
    </script>
  </head>
</html>`

async function loadObsidianPublishModule() {
  vi.resetModules()
  return import("../../../src/lib/blog/obsidian-publish")
}

describe("obsidian publish blog", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("blog-post만 필터링하고 최신순으로 정렬한 뒤 limit를 적용한다", async () => {
    const cachePayload = {
      "50-Blog/README.md": {
        frontmatter: {
          type: "blog-post",
          title: "README",
          published: "2026-01-20T08:17:53.000Z",
        },
      },
      "50-Blog/노트.md": {
        frontmatter: {
          type: "note",
          title: "노트",
          published: "2026-01-19T08:17:53.000Z",
        },
      },
      "50-Blog/드래프트.md": {
        frontmatter: {
          type: "blog-post",
          title: "드래프트",
          draft: true,
          published: "2026-01-18T08:17:53.000Z",
        },
      },
      "50-Blog/첫 글.md": {
        frontmatter: {
          type: "blog-post",
          title: "첫 글",
          published: "2026-01-11T08:17:53.000Z",
          description: "첫 번째 글 요약",
        },
      },
      "50-Blog/둘 글.md": {
        frontmatter: {
          type: "blog-post",
          title: "둘 글",
          pubDatetime: "2026-01-10T08:17:53.000Z",
        },
      },
      "50-Blog/셋 글.md": {
        frontmatter: {
          type: "blog-post",
          title: "셋 글",
          updated: "2026-01-09T08:17:53.000Z",
        },
      },
      "10-Projects/outside.md": {
        frontmatter: {
          type: "blog-post",
          title: "outside",
          published: "2026-01-12T08:17:53.000Z",
        },
      },
    }

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(BLOG_SECTION_HTML, { status: 200, statusText: "OK" }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(cachePayload), { status: 200, statusText: "OK" })
      )
    vi.stubGlobal("fetch", fetchMock)

    const { getObsidianBlogPosts } = await loadObsidianPublishModule()
    const posts = await getObsidianBlogPosts({ limit: 2 })

    expect(posts).toHaveLength(2)
    expect(posts[0]).toMatchObject({
      title: "첫 글",
      url: "https://publish.obsidian.md/gihwan-dev/50-Blog/%EC%B2%AB%20%EA%B8%80",
      publishedAt: "2026-01-11T08:17:53.000Z",
      summary: "첫 번째 글 요약",
    })
    expect(posts[1]).toMatchObject({
      title: "둘 글",
      publishedAt: "2026-01-10T08:17:53.000Z",
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("한글/공백/특수문자가 포함된 파일명을 URL 인코딩한다", async () => {
    const fileName = "React Fiber란? (정리)"
    const cachePayload = {
      [`50-Blog/${fileName}.md`]: {
        frontmatter: {
          type: "blog-post",
          title: fileName,
          published: "2026-01-11T08:17:53.000Z",
        },
      },
    }

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(BLOG_SECTION_HTML, { status: 200, statusText: "OK" }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(cachePayload), { status: 200, statusText: "OK" })
      )
    vi.stubGlobal("fetch", fetchMock)

    const { getObsidianBlogPosts } = await loadObsidianPublishModule()
    const posts = await getObsidianBlogPosts({ limit: 5 })

    expect(posts).toHaveLength(1)
    expect(posts[0].url).toBe(
      `https://publish.obsidian.md/gihwan-dev/50-Blog/${encodeURIComponent(fileName)}`
    )
  })

  it("캐시가 유효하면 재호출 시 fetch를 생략한다", async () => {
    let currentTime = 0
    vi.spyOn(Date, "now").mockImplementation(() => currentTime)

    const cachePayload = {
      "50-Blog/첫 글.md": {
        frontmatter: {
          type: "blog-post",
          title: "첫 글",
          published: "2026-01-11T08:17:53.000Z",
        },
      },
    }

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(BLOG_SECTION_HTML, { status: 200, statusText: "OK" }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(cachePayload), { status: 200, statusText: "OK" })
      )
    vi.stubGlobal("fetch", fetchMock)

    const { getObsidianBlogPosts } = await loadObsidianPublishModule()
    const first = await getObsidianBlogPosts({ limit: 5 })
    currentTime = 60 * 1000
    const second = await getObsidianBlogPosts({ limit: 5 })

    expect(second).toEqual(first)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("캐시가 만료된 뒤 fetch 실패 시 stale 캐시를 반환한다", async () => {
    let currentTime = 0
    vi.spyOn(Date, "now").mockImplementation(() => currentTime)
    vi.spyOn(console, "error").mockImplementation(() => {})

    const cachePayload = {
      "50-Blog/첫 글.md": {
        frontmatter: {
          type: "blog-post",
          title: "첫 글",
          published: "2026-01-11T08:17:53.000Z",
        },
      },
    }

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(BLOG_SECTION_HTML, { status: 200, statusText: "OK" }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(cachePayload), { status: 200, statusText: "OK" })
      )
      .mockRejectedValueOnce(new Error("network error"))
    vi.stubGlobal("fetch", fetchMock)

    const { getObsidianBlogPosts } = await loadObsidianPublishModule()
    const cached = await getObsidianBlogPosts({ limit: 5 })
    currentTime = DAY_MS + 1
    const stale = await getObsidianBlogPosts({ limit: 5 })

    expect(stale).toEqual(cached)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it("초기 fetch 실패 시 빈 배열을 반환한다", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const fetchMock = vi.fn().mockRejectedValue(new Error("network error"))
    vi.stubGlobal("fetch", fetchMock)

    const { getObsidianBlogPosts } = await loadObsidianPublishModule()
    const posts = await getObsidianBlogPosts({ limit: 5 })

    expect(posts).toEqual([])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
