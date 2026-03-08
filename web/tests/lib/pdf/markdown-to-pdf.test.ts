import { render } from "@testing-library/react"
import { createElement, Fragment, type ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"
import { markdownInlineToPdf, normalizeMarkdownForPdf } from "../../../src/lib/pdf/markdown-to-pdf"

vi.mock("@react-pdf/renderer", async () => {
  const React = await vi.importActual<typeof import("react")>("react")

  const createRendererElement = (tag: "div" | "span" | "a") => {
    return ({ children, src }: { children?: ReactNode; src?: string }) => {
      if (tag === "a") {
        return React.createElement("a", { href: src }, children)
      }
      return React.createElement(tag, null, children)
    }
  }

  return {
    Link: createRendererElement("a"),
    Text: createRendererElement("span"),
    View: createRendererElement("div"),
    StyleSheet: {
      create: <T extends Record<string, unknown>>(styleMap: T) => styleMap,
    },
  }
})

describe("normalizeMarkdownForPdf", () => {
  it("HTML/MDX 태그를 PDF 친화 마크다운으로 정규화한다", () => {
    const input = [
      'import DemoCard from "@/components/ui/card"',
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

  it("inline code가 backtick 없이 본문 흐름 텍스트로 렌더링된다", () => {
    const node = markdownInlineToPdf("비교 기준은 `areTableRowPropsEqual` 입니다.")
    const { container } = render(createElement(Fragment, null, node))
    const text = container.textContent ?? ""

    expect(text).toContain("비교 기준은 areTableRowPropsEqual 입니다.")
    expect(text).not.toContain("`")
  })

  it("bold + inline code 조합도 backtick 없이 렌더링된다", () => {
    const node = markdownInlineToPdf("**`memo`** 최적화")
    const { container } = render(createElement(Fragment, null, node))
    const text = container.textContent ?? ""

    expect(text).toContain("memo 최적화")
    expect(text).not.toContain("`")
  })
})
