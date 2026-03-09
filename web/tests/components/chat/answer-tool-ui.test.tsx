import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
  AnswerMessageContent,
  extractLatestAnswerToolArgs,
  extractLatestCompletedAnswerToolArgs,
} from "@/components/chat/answer-tool-ui"

vi.mock("@/components/chat/source-carousel", () => ({
  SourceCarousel: ({ sources }: { sources: Array<{ id: string }> }) => (
    <div data-testid="source-carousel">{`sources:${sources.length}`}</div>
  ),
}))

describe("extractLatestAnswerToolArgs", () => {
  it("마지막 answer tool-call args를 추출한다", () => {
    const result = extractLatestAnswerToolArgs([
      {
        type: "tool-call",
        toolName: "answer",
        args: {
          answer: "초기 답변",
          sources: [],
          confidence: "low",
        },
      },
      {
        type: "tool-call",
        toolName: "searchDocuments",
        args: { query: "접근성" },
      },
      {
        type: "tool-call",
        toolName: "answer",
        args: {
          answer: "최종 답변",
          sources: [{ type: "resume", title: "이력서" }],
          confidence: "high",
        },
      },
    ])

    expect(result).toMatchObject({
      answer: "최종 답변",
      confidence: "high",
    })
    expect(result?.sources).toHaveLength(1)
  })

  it("유효한 answer 문자열이 없으면 null을 반환한다", () => {
    const result = extractLatestAnswerToolArgs([
      {
        type: "tool-call",
        toolName: "answer",
        args: {
          answer: "",
          sources: [],
          confidence: "low",
        },
      },
    ])

    expect(result).toBeNull()
  })

  it("args가 없어도 result에 answer가 있으면 추출한다", () => {
    const result = extractLatestAnswerToolArgs([
      {
        type: "tool-call",
        toolName: "answer",
        result: {
          answer: "result 기반 답변",
          sources: [{ type: "obsidian", title: "문서 A" }],
          confidence: "medium",
        },
      },
    ])

    expect(result).toMatchObject({
      answer: "result 기반 답변",
      confidence: "medium",
    })
    expect(result?.sources).toHaveLength(1)
  })
})

describe("extractLatestCompletedAnswerToolArgs", () => {
  const content = [
    {
      type: "tool-call",
      toolName: "answer",
      args: {
        answer: "완료 후 노출 답변",
        sources: [],
        confidence: "low",
      },
    },
  ] as const

  it("메시지 상태가 complete가 아니면 null을 반환한다", () => {
    expect(extractLatestCompletedAnswerToolArgs(content, "running")).toBeNull()
    expect(extractLatestCompletedAnswerToolArgs(content, undefined)).toBeNull()
  })

  it("메시지 상태가 complete면 answer를 추출한다", () => {
    const result = extractLatestCompletedAnswerToolArgs(content, "complete")
    expect(result?.answer).toBe("완료 후 노출 답변")
  })
})

describe("AnswerMessageContent", () => {
  it("sources가 없어도 answer 본문을 렌더링한다", () => {
    render(
      <AnswerMessageContent
        answer={"**핵심 결과**\n\n- 접근성 수치 미확인"}
        sources={[]}
        confidence="low"
      />
    )

    expect(screen.getByText("핵심 결과")).toBeTruthy()
    expect(screen.getByText("접근성 수치 미확인")).toBeTruthy()
    expect(screen.queryByTestId("source-carousel")).toBeNull()
  })

  it("sources가 있으면 source carousel을 함께 렌더링한다", () => {
    render(
      <AnswerMessageContent
        answer="최종 답변"
        sources={[
          { type: "resume", title: "이력서" },
          { type: "obsidian", title: "프로젝트 문서", id: "doc-1" },
        ]}
        confidence="high"
      />
    )

    expect(screen.getByText("최종 답변")).toBeTruthy()
    expect(screen.getByTestId("source-carousel").textContent).toContain("sources:2")
  })
})
