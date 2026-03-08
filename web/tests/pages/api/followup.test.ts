import { beforeEach, describe, expect, it, vi } from "vitest"

const { mockCreateVertex, mockVertexModel, mockStreamText, mockCaptureException, mockFlush } =
  vi.hoisted(() => ({
    mockCreateVertex: vi.fn(),
    mockVertexModel: vi.fn(),
    mockStreamText: vi.fn(),
    mockCaptureException: vi.fn(),
    mockFlush: vi.fn(),
  }))

vi.mock("@ai-sdk/google-vertex", () => ({
  createVertex: mockCreateVertex,
}))

vi.mock("@sentry/astro", () => ({
  captureException: mockCaptureException,
  flush: mockFlush,
}))

vi.mock("ai", () => ({
  streamText: mockStreamText,
}))

import { POST } from "@/pages/api/followup"

describe("/api/followup", () => {
  beforeEach(() => {
    vi.stubEnv("FIREBASE_PRIVATE_KEY", "test-key")
    vi.stubEnv("FIREBASE_CLIENT_EMAIL", "test@example.com")
    vi.stubEnv("PUBLIC_FIREBASE_PROJECT_ID", "test-project")

    mockCreateVertex.mockReset()
    mockVertexModel.mockReset()
    mockStreamText.mockReset()
    mockCaptureException.mockReset()
    mockFlush.mockReset()

    mockVertexModel.mockReturnValue("mock-model")
    mockCreateVertex.mockReturnValue(mockVertexModel)
    mockStreamText.mockReturnValue({
      toTextStreamResponse: () => new Response("ok"),
    })
    mockFlush.mockResolvedValue(undefined)
  })

  it("Vertex global endpoint와 gemini-2.0-flash 모델을 사용한다", async () => {
    const response = await POST({
      request: new Request("http://localhost/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "테스트 프롬프트" }),
      }),
    })

    expect(response.status).toBe(200)
    expect(mockCreateVertex).toHaveBeenCalledWith(
      expect.objectContaining({
        project: "test-project",
        location: "global",
      })
    )
    expect(mockVertexModel).toHaveBeenCalledWith("gemini-2.0-flash")
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "mock-model",
      })
    )
  })
})
