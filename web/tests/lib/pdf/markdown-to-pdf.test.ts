import { describe, expect, it } from "vitest"
import { normalizeMarkdownForPdf } from "../../../src/lib/pdf/markdown-to-pdf"

describe("normalizeMarkdownForPdf", () => {
  it("HTML/MDX 태그를 PDF 친화 마크다운으로 정규화한다", () => {
    const input = [
      'import CompareToggle from "@/components/portfolio/compare-toggle.astro"',
      "",
      '<CompareToggle beforeLabel="before" afterLabel="after">',
      '  <div slot="before">',
      "  - before item",
      "  </div>",
      "</CompareToggle>",
      "",
      '<h3 id="problem">Problem</h3>',
      "<blockquote>대시보드 코어 레이아웃 설계</blockquote>",
      "",
      "* bullet item",
    ].join("\n")

    const normalized = normalizeMarkdownForPdf(input)

    expect(normalized).toContain("### Problem")
    expect(normalized).toContain("> 대시보드 코어 레이아웃 설계")
    expect(normalized).toContain("- before item")
    expect(normalized).toContain("* bullet item")

    expect(normalized).not.toContain("<h3")
    expect(normalized).not.toContain("<CompareToggle")
    expect(normalized).not.toContain("<div")
  })
})
