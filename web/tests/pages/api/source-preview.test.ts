import { beforeEach, describe, expect, it, vi } from "vitest"

const { mockReadDocumentContent } = vi.hoisted(() => ({
  mockReadDocumentContent: vi.fn(),
}))

vi.mock("@/lib/work-agent/obsidian.server", () => ({
  readDocumentContent: mockReadDocumentContent,
}))

import { buildExcerpt, GET } from "@/pages/api/source-preview"

describe("/api/source-preview", () => {
  beforeEach(() => {
    mockReadDocumentContent.mockReset()
  })

  it("id 누락 시 400 반환", async () => {
    const response = await GET({
      request: new Request("http://localhost/api/source-preview"),
    })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: "Missing source id" })
  })

  it("문서가 없으면 404 반환", async () => {
    mockReadDocumentContent.mockReturnValue(null)

    const response = await GET({
      request: new Request("http://localhost/api/source-preview?id=unknown"),
    })

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: "Source not found" })
  })

  it("summary 관련 본문 발췌를 우선 반환", async () => {
    mockReadDocumentContent.mockReturnValue({
      id: "doc-1",
      title: "DataGrid 개선",
      category: "Exem",
      path: "Exem/Projects/datagrid.md",
      summary: "리사이즈 성능을 개선했습니다.",
      tags: ["Exem"],
      content: `# DataGrid\n\n기존 구조를 분석했습니다.\n\n리사이즈 성능을 개선했습니다. 22ms에서 0.5ms로 단축되었습니다.`,
    })

    const response = await GET({
      request: new Request("http://localhost/api/source-preview?id=doc-1"),
    })

    expect(response.status).toBe(200)
    const payload = (await response.json()) as { excerpt: string; title: string }
    expect(payload.title).toBe("DataGrid 개선")
    expect(payload.excerpt).toContain("리사이즈 성능을 개선했습니다")
  })

  it("summary 매칭 실패 시 첫 유효 문단 fallback", () => {
    const excerpt = buildExcerpt(
      `# 제목\n\n---\n\n첫 번째 유효 문단입니다.\n\n두 번째 문단입니다.`,
      "매칭되지 않는 키워드"
    )
    expect(excerpt).toContain("첫 번째 유효 문단입니다.")
  })
})
