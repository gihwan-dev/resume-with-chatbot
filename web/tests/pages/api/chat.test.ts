import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  mockBuildResumePrompt,
  mockBuildCatalogSummary,
  mockConvertToModelMessages,
  mockCreateUIMessageStreamResponse,
  mockCreateVertex,
  mockVertexModel,
  mockStreamText,
  mockCaptureException,
  mockFlush,
  mockClassifyIntent,
  mockBuildDynamicSystemPrompt,
  mockCreateSearchContext,
  mockCreateAnswerTool,
} = vi.hoisted(() => ({
  mockBuildResumePrompt: vi.fn(),
  mockBuildCatalogSummary: vi.fn(),
  mockConvertToModelMessages: vi.fn(),
  mockCreateUIMessageStreamResponse: vi.fn(),
  mockCreateVertex: vi.fn(),
  mockVertexModel: vi.fn(),
  mockStreamText: vi.fn(),
  mockCaptureException: vi.fn(),
  mockFlush: vi.fn(),
  mockClassifyIntent: vi.fn(),
  mockBuildDynamicSystemPrompt: vi.fn(),
  mockCreateSearchContext: vi.fn(),
  mockCreateAnswerTool: vi.fn(),
}))

vi.mock("@/lib/resume-prompt", () => ({
  buildResumePrompt: mockBuildResumePrompt,
}))

vi.mock("@/lib/work-agent/obsidian.server", () => ({
  buildCatalogSummary: mockBuildCatalogSummary,
}))

vi.mock("@/lib/stream/filter-tool-input-delta", () => ({
  createToolInputDeltaFilter: () => new TransformStream(),
}))

vi.mock("@/lib/work-agent", () => ({
  analyzeToolCallPattern: () => ({
    consecutiveSameToolCount: 0,
    lastToolName: undefined,
    lastQueries: [],
  }),
  buildDynamicSystemPrompt: mockBuildDynamicSystemPrompt,
  buildSearchContextFromSteps: () => ({ searchedIds: [] }),
  classifyIntent: mockClassifyIntent,
  createAnswerTool: mockCreateAnswerTool,
  createSearchContext: mockCreateSearchContext,
  shouldAllowAnswer: () => ({ isReady: true, reason: "ok" }),
  workAgentTools: {
    searchDocuments: { description: "search" },
    readDocument: { description: "read" },
  },
}))

vi.mock("@ai-sdk/google-vertex", () => ({
  createVertex: mockCreateVertex,
}))

vi.mock("@sentry/astro", () => ({
  captureException: mockCaptureException,
  flush: mockFlush,
}))

vi.mock("ai", () => ({
  convertToModelMessages: mockConvertToModelMessages,
  createUIMessageStreamResponse: mockCreateUIMessageStreamResponse,
  hasToolCall: () => () => false,
  stepCountIs: () => () => false,
  streamText: mockStreamText,
}))

import { POST } from "@/pages/api/chat"

describe("/api/chat", () => {
  beforeEach(() => {
    vi.stubEnv("FIREBASE_PRIVATE_KEY", "test-key")
    vi.stubEnv("FIREBASE_CLIENT_EMAIL", "test@example.com")
    vi.stubEnv("PUBLIC_FIREBASE_PROJECT_ID", "test-project")

    mockBuildResumePrompt.mockReset()
    mockBuildCatalogSummary.mockReset()
    mockConvertToModelMessages.mockReset()
    mockCreateUIMessageStreamResponse.mockReset()
    mockCreateVertex.mockReset()
    mockVertexModel.mockReset()
    mockStreamText.mockReset()
    mockCaptureException.mockReset()
    mockFlush.mockReset()
    mockClassifyIntent.mockReset()
    mockBuildDynamicSystemPrompt.mockReset()
    mockCreateSearchContext.mockReset()
    mockCreateAnswerTool.mockReset()

    mockBuildResumePrompt.mockResolvedValue("resume prompt")
    mockBuildCatalogSummary.mockReturnValue("catalog summary")
    mockConvertToModelMessages.mockResolvedValue([])
    mockClassifyIntent.mockReturnValue({
      intent: "experience",
      confidence: 0.9,
      keywords: ["AI"],
    })
    mockBuildDynamicSystemPrompt.mockReturnValue("dynamic prompt")
    mockCreateSearchContext.mockReturnValue({})
    mockCreateAnswerTool.mockReturnValue({ description: "answer" })
    mockVertexModel.mockReturnValue("mock-model")
    mockCreateVertex.mockReturnValue(mockVertexModel)
    mockStreamText.mockReturnValue({
      toUIMessageStream: () => new ReadableStream(),
    })
    mockCreateUIMessageStreamResponse.mockImplementation(() => new Response("ok"))
    mockFlush.mockResolvedValue(undefined)
  })

  it("variant=ai-agent면 AI 이력서 프롬프트를 사용한다", async () => {
    const response = await POST({
      request: new Request("http://localhost/api/chat?variant=ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", parts: [{ type: "text", text: "AI 경험 알려줘" }] }],
        }),
      }),
    })

    expect(response.status).toBe(200)
    expect(mockBuildResumePrompt).toHaveBeenCalledWith("ai-agent")
  })

  it("invalid variant면 frontend로 fallback 한다", async () => {
    const response = await POST({
      request: new Request("http://localhost/api/chat?variant=unknown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", parts: [{ type: "text", text: "frontend 경험 알려줘" }] }],
        }),
      }),
    })

    expect(response.status).toBe(200)
    expect(mockBuildResumePrompt).toHaveBeenCalledWith("frontend")
  })

  it("Vertex global endpoint와 Gemini 3.1 Pro Preview를 사용한다", async () => {
    const response = await POST({
      request: new Request("http://localhost/api/chat?variant=frontend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", parts: [{ type: "text", text: "경험 알려줘" }] }],
        }),
      }),
    })

    expect(response.status).toBe(200)
    expect(mockCreateVertex).toHaveBeenCalledWith(
      expect.objectContaining({
        project: "test-project",
        location: "global",
      })
    )
    expect(mockVertexModel).toHaveBeenCalledWith("gemini-3.1-pro-preview")
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "mock-model",
      })
    )
  })
})
