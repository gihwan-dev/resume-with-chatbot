import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  mockBuildResumePrompt,
  mockBuildCatalogSummary,
  mockConvertToModelMessages,
  mockCreateUIMessageStreamResponse,
  mockCreateVertex,
  mockStreamText,
  mockCaptureException,
  mockFlush,
  mockClassifyIntent,
  mockAnalyzeToolCallPattern,
  mockBuildDynamicSystemPrompt,
  mockCreateSearchContext,
  mockCreateAnswerTool,
  mockResolveThinkingLevel,
  mockVertexModel,
} = vi.hoisted(() => ({
  mockBuildResumePrompt: vi.fn(),
  mockBuildCatalogSummary: vi.fn(),
  mockConvertToModelMessages: vi.fn(),
  mockCreateUIMessageStreamResponse: vi.fn(),
  mockCreateVertex: vi.fn(),
  mockStreamText: vi.fn(),
  mockCaptureException: vi.fn(),
  mockFlush: vi.fn(),
  mockClassifyIntent: vi.fn(),
  mockAnalyzeToolCallPattern: vi.fn(),
  mockBuildDynamicSystemPrompt: vi.fn(),
  mockCreateSearchContext: vi.fn(),
  mockCreateAnswerTool: vi.fn(),
  mockResolveThinkingLevel: vi.fn(),
  mockVertexModel: vi.fn(() => "mock-model"),
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
  analyzeToolCallPattern: mockAnalyzeToolCallPattern,
  buildDynamicSystemPrompt: mockBuildDynamicSystemPrompt,
  buildSearchContextFromSteps: () => ({ searchedIds: [] }),
  classifyIntent: mockClassifyIntent,
  createAnswerTool: mockCreateAnswerTool,
  createSearchContext: mockCreateSearchContext,
  resolveThinkingLevel: mockResolveThinkingLevel,
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
    mockStreamText.mockReset()
    mockCaptureException.mockReset()
    mockFlush.mockReset()
    mockClassifyIntent.mockReset()
    mockAnalyzeToolCallPattern.mockReset()
    mockBuildDynamicSystemPrompt.mockReset()
    mockCreateSearchContext.mockReset()
    mockCreateAnswerTool.mockReset()
    mockResolveThinkingLevel.mockReset()
    mockVertexModel.mockReset()

    mockBuildResumePrompt.mockResolvedValue("resume prompt")
    mockBuildCatalogSummary.mockReturnValue("catalog summary")
    mockConvertToModelMessages.mockResolvedValue([])
    mockClassifyIntent.mockReturnValue({
      intent: "technical_inquiry",
      confidence: 0.9,
      keywords: ["AI"],
    })
    mockAnalyzeToolCallPattern.mockReturnValue({
      consecutiveSameToolCount: 0,
      lastToolName: null,
      lastQueries: [],
      totalSearchCount: 0,
    })
    mockBuildDynamicSystemPrompt.mockImplementation((options?: { analysis?: { lastQueries?: string[] } }) => {
      const queries = options?.analysis?.lastQueries ?? []
      return queries.length > 0
        ? `soft guidance\n이전 검색 쿼리\n${queries.map((q) => `"${q}"`).join("\n")}`
        : "dynamic prompt"
    })
    mockCreateSearchContext.mockReturnValue({})
    mockCreateAnswerTool.mockReturnValue({ description: "answer" })
    mockResolveThinkingLevel.mockReturnValue("high")
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

  it("Gemini 3.1 Pro + global endpoint + intent 기반 thinkingLevel을 사용한다", async () => {
    const response = await POST({
      request: new Request("http://localhost/api/chat?variant=frontend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", parts: [{ type: "text", text: "기술 스택 설명해줘" }] }],
        }),
      }),
    })

    expect(response.status).toBe(200)
    expect(mockCreateVertex).toHaveBeenCalledWith(
      expect.objectContaining({
        location: "global",
      })
    )
    expect(mockResolveThinkingLevel).toHaveBeenCalledWith("technical_inquiry")
    expect(mockVertexModel).toHaveBeenCalledWith("gemini-3.1-pro-preview")
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({
        providerOptions: {
          google: {
            thinkingConfig: {
              includeThoughts: true,
              thinkingLevel: "high",
            },
          },
        },
      })
    )
  })

  it("prepareStep 정책이 Step0 required / Step1 auto 로 동작한다", async () => {
    await POST({
      request: new Request("http://localhost/api/chat?variant=frontend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", parts: [{ type: "text", text: "프로젝트 알려줘" }] }],
        }),
      }),
    })

    const streamTextArg = mockStreamText.mock.calls[0][0] as {
      prepareStep: (args: { stepNumber: number; steps: Array<{ toolCalls?: Array<{ toolName: string }> }> }) => {
        system: string
        activeTools: string[]
        toolChoice: "required" | "auto"
      }
    }
    const step0 = streamTextArg.prepareStep({ stepNumber: 0, steps: [] })
    const step1 = streamTextArg.prepareStep({ stepNumber: 1, steps: [] })

    expect(step0.toolChoice).toBe("required")
    expect(step0.activeTools).toEqual(["searchDocuments", "readDocument"])
    expect(step1.toolChoice).toBe("auto")
    expect(step1.activeTools).toEqual(["searchDocuments", "readDocument", "answer"])
  })

  it("answer 미호출 상태에서 step2+는 answer required 가드가 동작한다", async () => {
    await POST({
      request: new Request("http://localhost/api/chat?variant=frontend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", parts: [{ type: "text", text: "경력 알려줘" }] }],
        }),
      }),
    })

    const streamTextArg = mockStreamText.mock.calls[0][0] as {
      prepareStep: (args: { stepNumber: number; steps: Array<{ toolCalls?: Array<{ toolName: string }> }> }) => {
        activeTools: string[]
        toolChoice: "required" | "auto"
      }
    }

    const step2WithoutAnswer = streamTextArg.prepareStep({
      stepNumber: 2,
      steps: [{ toolCalls: [{ toolName: "searchDocuments" }] }],
    })
    expect(step2WithoutAnswer.toolChoice).toBe("required")
    expect(step2WithoutAnswer.activeTools).toEqual(["answer"])

    const step2WithAnswer = streamTextArg.prepareStep({
      stepNumber: 2,
      steps: [{ toolCalls: [{ toolName: "answer" }] }],
    })
    expect(step2WithAnswer.toolChoice).toBe("auto")
    expect(step2WithAnswer.activeTools).toEqual(["searchDocuments", "readDocument", "answer"])
  })

  it("반복 호출 3회 이상이면 prepareStep.system에 soft guidance와 이전 쿼리가 포함된다", async () => {
    mockAnalyzeToolCallPattern.mockReturnValueOnce({
      consecutiveSameToolCount: 3,
      lastToolName: "searchDocuments",
      lastQueries: ["query1", "query2", "query3"],
      totalSearchCount: 3,
    })

    await POST({
      request: new Request("http://localhost/api/chat?variant=frontend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", parts: [{ type: "text", text: "검색해줘" }] }],
        }),
      }),
    })

    const streamTextArg = mockStreamText.mock.calls[0][0] as {
      prepareStep: (args: { stepNumber: number; steps: Array<{ toolCalls?: Array<{ toolName: string }> }> }) => {
        system: string
      }
    }
    const step1 = streamTextArg.prepareStep({
      stepNumber: 1,
      steps: [{ toolCalls: [{ toolName: "searchDocuments" }] }],
    })

    expect(step1.system).toContain("soft guidance")
    expect(step1.system).toContain("이전 검색 쿼리")
    expect(step1.system).toContain("\"query1\"")
    expect(step1.system).toContain("\"query2\"")
    expect(step1.system).toContain("\"query3\"")
  })

  it("contact_inquiry 에서는 thinkingLevel low를 사용한다", async () => {
    mockClassifyIntent.mockReturnValueOnce({
      intent: "contact_inquiry",
      confidence: 0.8,
      keywords: ["연락처"],
    })
    mockResolveThinkingLevel.mockReturnValueOnce("low")

    await POST({
      request: new Request("http://localhost/api/chat?variant=frontend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", parts: [{ type: "text", text: "연락처 알려줘" }] }],
        }),
      }),
    })

    expect(mockResolveThinkingLevel).toHaveBeenCalledWith("contact_inquiry")
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({
        providerOptions: {
          google: {
            thinkingConfig: {
              includeThoughts: true,
              thinkingLevel: "low",
            },
          },
        },
      })
    )
  })
})
