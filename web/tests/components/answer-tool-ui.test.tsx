import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AnswerToolContent } from "@/components/chat/answer-tool-ui"

const sampleSources = [
  {
    type: "obsidian" as const,
    title: "W3C Recommendation ARIA in HTML 번역",
    id: "doc-1",
  },
]

describe("AnswerToolContent", () => {
  it("answer만 있어도 본문을 렌더링한다", () => {
    render(<AnswerToolContent answer="접근성 경험을 정리했습니다." sources={[]} />)

    expect(screen.getByText("접근성 경험을 정리했습니다.")).toBeTruthy()
    expect(screen.queryByText(/참고한 경험/)).toBeNull()
  })

  it("answer + sources가 있으면 본문과 참고한 경험을 함께 렌더링한다", () => {
    render(<AnswerToolContent answer="해석 기준: 웹 접근성 경험" sources={sampleSources} />)

    expect(screen.getByText("해석 기준: 웹 접근성 경험")).toBeTruthy()
    expect(screen.getByText("참고한 경험 (1)")).toBeTruthy()
    expect(screen.getByText("W3C Recommendation ARIA in HTML 번역")).toBeTruthy()
  })

  it("markdown 리스트와 강조를 렌더링한다", () => {
    render(<AnswerToolContent answer={"**핵심 요약**\n- 항목 1\n- 항목 2"} sources={[]} />)

    const strongText = screen.getByText("핵심 요약")
    expect(strongText.tagName.toLowerCase()).toBe("strong")
    expect(screen.getByText("항목 1").closest("li")).toBeTruthy()
    expect(screen.getByText("항목 2").closest("li")).toBeTruthy()
  })

  it("answer와 sources가 모두 비어 있으면 null을 반환한다", () => {
    const { container } = render(<AnswerToolContent answer="   " sources={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
