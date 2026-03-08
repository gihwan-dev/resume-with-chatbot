import { describe, expect, it } from "vitest"
import { buildLiveResumeFeedItems } from "@/lib/work-agent/obsidian.server"
import type { ObsidianDocument } from "@/lib/work-agent/types"

describe("buildLiveResumeFeedItems", () => {
  const baseDoc = (overrides: Partial<ObsidianDocument>): ObsidianDocument => ({
    id: "doc",
    title: "title",
    category: "Exem",
    path: "Exem/doc.md",
    summary: "summary",
    tags: ["Exem"],
    ...overrides,
  })

  it("date 기준 최신순 정렬 + 최대 개수 제한", () => {
    const docs: ObsidianDocument[] = [
      baseDoc({ id: "doc-1", title: "1", activityAt: "2026-03-01T00:00:00+09:00" }),
      baseDoc({ id: "doc-2", title: "2", activityAt: "2026-03-03T00:00:00+09:00" }),
      baseDoc({ id: "doc-3", title: "3", activityAt: "2026-03-02T00:00:00+09:00" }),
    ]

    const items = buildLiveResumeFeedItems(docs, 2)
    expect(items).toHaveLength(2)
    expect(items.map((item) => item.id)).toEqual(["doc-2", "doc-3"])
  })

  it("summary 또는 activityAt이 없는 문서는 제외", () => {
    const docs: ObsidianDocument[] = [
      baseDoc({ id: "valid", activityAt: "2026-03-01T00:00:00+09:00", summary: "유효 요약" }),
      baseDoc({ id: "no-summary", activityAt: "2026-03-02T00:00:00+09:00", summary: "" }),
      baseDoc({ id: "no-date", summary: "요약 있음" }),
      baseDoc({ id: "invalid-date", activityAt: "not-a-date", summary: "요약 있음" }),
    ]

    const items = buildLiveResumeFeedItems(docs, 5)
    expect(items).toHaveLength(1)
    expect(items[0]?.id).toBe("valid")
  })

  it("activityAt을 그대로 사용한다", () => {
    const docs: ObsidianDocument[] = [
      baseDoc({ id: "updated-only", activityAt: "2026-03-08T13:20:00+09:00" }),
    ]

    const items = buildLiveResumeFeedItems(docs, 5)
    expect(items).toHaveLength(1)
    expect(items[0]?.activityAt).toBe("2026-03-08T13:20:00+09:00")
    expect(items[0]?.promptText).toContain("title")
  })

  it("eventDate가 있어도 feed 정렬은 activityAt을 사용한다", () => {
    const docs: ObsidianDocument[] = [
      baseDoc({
        id: "older-activity",
        eventDate: "2026-03-30",
        activityAt: "2026-03-01T01:00:00+09:00",
      }),
      baseDoc({
        id: "newer-activity",
        eventDate: "2026-03-01",
        activityAt: "2026-03-10T09:00:00+09:00",
      }),
    ]

    const items = buildLiveResumeFeedItems(docs, 5)
    expect(items.map((item) => item.id)).toEqual(["newer-activity", "older-activity"])
  })
})
