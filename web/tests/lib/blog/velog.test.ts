import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const DAY_MS = 24 * 60 * 60 * 1000

const RSS_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title><![CDATA[첫 번째 글]]></title>
      <link>https://velog.io/@koreanthuglife/first-post</link>
      <pubDate>Sun, 11 Jan 2026 08:17:53 GMT</pubDate>
      <description><![CDATA[<p>첫 번째 <strong>요약</strong> 문장입니다.</p>]]></description>
    </item>
    <item>
      <title><![CDATA[두 번째 글]]></title>
      <link>https://velog.io/@koreanthuglife/second-post</link>
      <pubDate>Sat, 10 Jan 2026 08:17:53 GMT</pubDate>
      <description><![CDATA[<p>두 번째 글 설명입니다.</p>]]></description>
    </item>
  </channel>
</rss>`

async function loadVelogModule() {
  vi.resetModules()
  return import("../../../src/lib/blog/velog")
}

describe("velog blog rss", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("RSS를 파싱하고 limit를 적용한다", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(RSS_SAMPLE, { status: 200, statusText: "OK" }))
    vi.stubGlobal("fetch", fetchMock)

    const { getVelogPosts } = await loadVelogModule()
    const posts = await getVelogPosts({ limit: 1 })

    expect(posts).toHaveLength(1)
    expect(posts[0]).toMatchObject({
      title: "첫 번째 글",
      url: "https://velog.io/@koreanthuglife/first-post",
      publishedAt: "2026-01-11T08:17:53.000Z",
    })
    expect(posts[0].summary).toBe("첫 번째 요약 문장입니다.")
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("캐시가 유효하면 재호출 시 fetch를 생략한다", async () => {
    let currentTime = 0
    vi.spyOn(Date, "now").mockImplementation(() => currentTime)

    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(RSS_SAMPLE, { status: 200, statusText: "OK" }))
    vi.stubGlobal("fetch", fetchMock)

    const { getVelogPosts } = await loadVelogModule()

    const first = await getVelogPosts({ limit: 5 })
    currentTime = 60 * 1000
    const second = await getVelogPosts({ limit: 5 })

    expect(second).toEqual(first)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("캐시가 만료된 뒤 fetch 실패 시 stale 캐시를 반환한다", async () => {
    let currentTime = 0
    vi.spyOn(Date, "now").mockImplementation(() => currentTime)
    vi.spyOn(console, "error").mockImplementation(() => {})

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(RSS_SAMPLE, { status: 200, statusText: "OK" }))
      .mockRejectedValueOnce(new Error("network error"))
    vi.stubGlobal("fetch", fetchMock)

    const { getVelogPosts } = await loadVelogModule()

    const cached = await getVelogPosts({ limit: 5 })
    currentTime = DAY_MS + 1
    const stale = await getVelogPosts({ limit: 5 })

    expect(stale).toEqual(cached)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("초기 fetch 실패 시 빈 배열을 반환한다", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const fetchMock = vi.fn().mockRejectedValue(new Error("network error"))
    vi.stubGlobal("fetch", fetchMock)

    const { getVelogPosts } = await loadVelogModule()
    const posts = await getVelogPosts({ limit: 5 })

    expect(posts).toEqual([])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
