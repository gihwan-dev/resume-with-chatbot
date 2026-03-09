import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { SourceCarousel } from "@/components/chat/source-carousel"

const { dispatchChatPromptRequestSpy, trackEventSpy } = vi.hoisted(() => ({
  dispatchChatPromptRequestSpy: vi.fn(),
  trackEventSpy: vi.fn(),
}))

vi.mock("@/lib/chat-prompt", () => ({
  dispatchChatPromptRequest: dispatchChatPromptRequestSpy,
}))

vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventSpy,
}))

function createDeferredResponse() {
  let resolveResponse!: (value: Response) => void
  const promise = new Promise<Response>((resolve) => {
    resolveResponse = resolve
  })

  return {
    promise,
    resolve: resolveResponse,
  }
}

describe("SourceCarousel", () => {
  beforeEach(() => {
    dispatchChatPromptRequestSpy.mockClear()
    trackEventSpy.mockClear()
    vi.restoreAllMocks()
    vi.spyOn(window, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "doc-1",
          sourceType: "obsidian",
          title: "DataGrid 리팩토링 노트",
          category: "Exem",
          path: "Exem/Projects/datagrid.md",
          summary: "요약",
          excerpt: "발췌",
          tags: ["Exem"],
        }),
        { status: 200 }
      )
    )
  })

  it("source preview를 열고 CTA로 질문 전송", async () => {
    render(
      <SourceCarousel
        sources={[
          {
            id: "doc-1",
            title: "DataGrid 리팩토링 노트",
            content: "Obsidian 문서",
            category: "Obsidian 문서",
            sourceType: "obsidian",
            previewAvailable: true,
          },
        ]}
      />
    )

    const user = userEvent.setup()
    await user.click(screen.getByTestId("source-card-doc-1"))

    await waitFor(() => {
      expect(screen.getByTestId("source-preview-content")).toBeTruthy()
    })

    await user.click(screen.getByTestId("source-preview-ask-ai"))

    expect(dispatchChatPromptRequestSpy).toHaveBeenCalledWith({
      prompt: '"DataGrid 리팩토링 노트" 문서를 근거로 문제, 해결, 성과를 자세히 설명해줘.',
      resetThread: false,
      source: "source_preview",
    })
  })

  it("늦게 도착한 이전 preview 응답이 현재 선택을 덮어쓰지 않는다", async () => {
    const firstResponse = createDeferredResponse()
    const secondResponse = createDeferredResponse()

    vi.spyOn(window, "fetch")
      .mockImplementationOnce(() => firstResponse.promise)
      .mockImplementationOnce(() => secondResponse.promise)

    render(
      <SourceCarousel
        sources={[
          {
            id: "doc-1",
            title: "첫 번째 문서",
            content: "Obsidian 문서",
            category: "Obsidian 문서",
            sourceType: "obsidian",
            previewAvailable: true,
          },
          {
            id: "doc-2",
            title: "두 번째 문서",
            content: "Obsidian 문서",
            category: "Obsidian 문서",
            sourceType: "obsidian",
            previewAvailable: true,
          },
        ]}
      />
    )

    const user = userEvent.setup()
    await user.click(screen.getByTestId("source-card-doc-1"))
    fireEvent.keyDown(document, { key: "Escape" })
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull()
    })
    await user.click(screen.getByTestId("source-card-doc-2"))

    secondResponse.resolve(
      new Response(
        JSON.stringify({
          id: "doc-2",
          sourceType: "obsidian",
          title: "두 번째 문서",
          category: "Exem",
          path: "Exem/Projects/doc-2.md",
          summary: "두 번째 요약",
          excerpt: "두 번째 발췌",
          tags: ["Exem"],
        }),
        { status: 200 }
      )
    )

    await waitFor(() => {
      expect(screen.getByTestId("source-preview-content").textContent).toContain("두 번째 문서")
    })

    firstResponse.resolve(
      new Response(
        JSON.stringify({
          id: "doc-1",
          sourceType: "obsidian",
          title: "첫 번째 문서",
          category: "Exem",
          path: "Exem/Projects/doc-1.md",
          summary: "첫 번째 요약",
          excerpt: "첫 번째 발췌",
          tags: ["Exem"],
        }),
        { status: 200 }
      )
    )

    await waitFor(() => {
      const previewText = screen.getByTestId("source-preview-content").textContent ?? ""
      expect(previewText).toContain("두 번째 문서")
      expect(previewText).not.toContain("첫 번째 문서")
    })
  })
})
