import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { FinalAnswerFromToolCall } from "@/components/assistant-ui/thread"

const sampleSources = [
  {
    type: "obsidian" as const,
    title: "W3C Recommendation ARIA in HTML 번역",
    id: "doc-1",
  },
]

describe("FinalAnswerFromToolCall", () => {
  it("answer tool only content에서도 답변 본문을 렌더링한다", () => {
    render(
      <FinalAnswerFromToolCall
        isComplete
        content={[
          {
            type: "tool-call",
            toolName: "answer",
            args: { answer: "tool only final answer", sources: [] },
          },
        ]}
      />
    )

    expect(screen.getByText("tool only final answer")).toBeTruthy()
  })

  it("text 파트가 있으면 answer text 중복 렌더링 없이 sources만 유지한다", () => {
    render(
      <FinalAnswerFromToolCall
        isComplete
        content={[
          { type: "text", text: "assistant text response" },
          {
            type: "tool-call",
            toolName: "answer",
            args: { answer: "tool answer should be hidden", sources: sampleSources },
          },
        ]}
      />
    )

    expect(screen.queryByText("tool answer should be hidden")).toBeNull()
    expect(screen.getByText("참고한 경험 (1)")).toBeTruthy()
    expect(screen.getByText("W3C Recommendation ARIA in HTML 번역")).toBeTruthy()
  })

  it("answer tool only content에서도 source 카드까지 함께 렌더링한다", () => {
    render(
      <FinalAnswerFromToolCall
        isComplete
        content={[
          {
            type: "tool-call",
            toolName: "answer",
            args: { answer: "answer from tool", sources: sampleSources },
          },
        ]}
      />
    )

    expect(screen.getByText("answer from tool")).toBeTruthy()
    expect(screen.getByText("참고한 경험 (1)")).toBeTruthy()
  })

  it("malformed answer payload는 complete 상태에서만 fallback 문구를 렌더링한다", () => {
    render(
      <FinalAnswerFromToolCall
        isComplete
        content={[
          {
            type: "tool-call",
            toolName: "answer",
            args: "invalid-payload",
          },
        ]}
      />
    )

    expect(
      screen.getByText("응답을 표시하는 중 문제가 발생했습니다. 다시 생성해 주세요.")
    ).toBeTruthy()
  })

  it("malformed answer payload는 streaming 상태면 null을 유지한다", () => {
    const { container } = render(
      <FinalAnswerFromToolCall
        isComplete={false}
        content={[
          {
            type: "tool-call",
            toolName: "answer",
            args: "invalid-payload",
          },
        ]}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it("answer tool call이 아예 없으면 null을 유지한다", () => {
    const { container } = render(
      <FinalAnswerFromToolCall
        isComplete
        content={[
          {
            type: "tool-call",
            toolName: "searchDocuments",
            args: { query: "wcag" },
          },
        ]}
      />
    )

    expect(container.firstChild).toBeNull()
  })
})
