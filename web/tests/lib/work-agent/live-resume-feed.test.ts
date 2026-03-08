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
      baseDoc({ id: "doc-1", title: "1", eventDate: "2026-03-01" }),
      baseDoc({ id: "doc-2", title: "2", eventDate: "2026-03-03" }),
      baseDoc({ id: "doc-3", title: "3", eventDate: "2026-03-02" }),
    ]

    const items = buildLiveResumeFeedItems(docs, 2)
    expect(items).toHaveLength(2)
    expect(items.map((item) => item.id)).toEqual(["doc-2", "doc-3"])
  })

  it("summary 또는 date가 없는 문서는 제외", () => {
    const docs: ObsidianDocument[] = [
      baseDoc({ id: "valid", eventDate: "2026-03-01", summary: "유효 요약" }),
      baseDoc({ id: "no-summary", eventDate: "2026-03-02", summary: "" }),
      baseDoc({ id: "no-date", summary: "요약 있음" }),
      baseDoc({ id: "invalid-date", eventDate: "not-a-date", summary: "요약 있음" }),
    ]

    const items = buildLiveResumeFeedItems(docs, 5)
    expect(items).toHaveLength(1)
    expect(items[0]?.id).toBe("valid")
  })

  it("updatedAt fallback 사용", () => {
    const docs: ObsidianDocument[] = [
      baseDoc({ id: "updated-only", eventDate: undefined, updatedAt: "2026-03-08" }),
    ]

    const items = buildLiveResumeFeedItems(docs, 5)
    expect(items).toHaveLength(1)
    expect(items[0]?.date).toBe("2026-03-08")
    expect(items[0]?.promptText).toContain("title")
  })

  it("timezone offset이 포함된 날짜도 날짜 경계를 유지한다", () => {
    const docs: ObsidianDocument[] = [
      baseDoc({
        id: "tz-doc",
        eventDate: "2026-03-01T00:30:00+09:00",
        summary: "timezone summary",
      }),
    ]

    const items = buildLiveResumeFeedItems(docs, 5)
    expect(items).toHaveLength(1)
    expect(items[0]?.date).toBe("2026-03-01")
  })
})
