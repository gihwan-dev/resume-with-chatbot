import { describe, expect, it } from "vitest"
import {
  computeCurrentStep,
  computeToolSteps,
  extractReasoningTitle,
  type ThinkingStep,
} from "@/components/assistant-ui/thinking-process"

// --- extractReasoningTitle ---

describe("extractReasoningTitle", () => {
  it("extracts last bold title from reasoning text", () => {
    const content = [
      { type: "reasoning", text: "Some text **First Title** more text **Second Title** end" },
    ]
    expect(extractReasoningTitle(content)).toBe("Second Title")
  })

  it("returns last bold from the last reasoning part when multiple exist", () => {
    const content = [
      { type: "reasoning", text: "**Title A**" },
      { type: "tool-call" },
      { type: "reasoning", text: "**Title B** then **Title C**" },
    ]
    expect(extractReasoningTitle(content)).toBe("Title C")
  })

  it("returns empty string when no reasoning parts", () => {
    const content = [{ type: "text", text: "hello" }]
    expect(extractReasoningTitle(content)).toBe("")
  })

  it("returns empty string when reasoning has no bold text", () => {
    const content = [{ type: "reasoning", text: "no bold here" }]
    expect(extractReasoningTitle(content)).toBe("")
  })

  it("returns empty string when reasoning text is empty", () => {
    const content = [{ type: "reasoning", text: "" }]
    expect(extractReasoningTitle(content)).toBe("")
  })

  it("returns empty string when reasoning has no text property", () => {
    const content = [{ type: "reasoning" }]
    expect(extractReasoningTitle(content)).toBe("")
  })
})

// --- computeToolSteps ---

describe("computeToolSteps", () => {
  it("creates steps for known tool names", () => {
    const content = [{ type: "reasoning" }, { type: "tool-call", toolName: "searchDocuments" }]
    const steps = computeToolSteps(content, false)
    expect(steps).toHaveLength(1)
    expect(steps[0]).toMatchObject({
      id: "tool-searchDocuments-1",
      type: "tool-call",
      label: "문서 검색 중...",
      status: "running",
    })
  })

  it("marks steps as complete when isComplete is true", () => {
    const content = [{ type: "tool-call", toolName: "readDocument" }]
    const steps = computeToolSteps(content, true)
    expect(steps[0].status).toBe("complete")
  })

  it("skips unknown tool names", () => {
    const content = [{ type: "tool-call", toolName: "unknownTool" }]
    const steps = computeToolSteps(content, false)
    expect(steps).toHaveLength(0)
  })

  it("handles multiple tool calls", () => {
    const content = [
      { type: "tool-call", toolName: "searchDocuments" },
      { type: "reasoning" },
      { type: "tool-call", toolName: "readDocument" },
      { type: "tool-call", toolName: "searchDocuments" },
    ]
    const steps = computeToolSteps(content, false)
    expect(steps).toHaveLength(3)
    expect(steps[0].label).toBe("문서 검색 중...")
    expect(steps[1].label).toBe("문서 상세 조회 중...")
    expect(steps[2].label).toBe("문서 검색 중...")
  })

  it("skips tool-call parts without toolName", () => {
    const content = [{ type: "tool-call" }]
    const steps = computeToolSteps(content, false)
    expect(steps).toHaveLength(0)
  })
})

// --- computeCurrentStep ---

describe("computeCurrentStep", () => {
  const reasoningStep: ThinkingStep = {
    id: "reasoning",
    type: "reasoning",
    label: "생각 중...",
    status: "running",
  }

  it("returns null when isComplete", () => {
    const content = [{ type: "reasoning" }]
    const steps = [reasoningStep]
    expect(computeCurrentStep(content, steps, true)).toBeNull()
  })

  it("returns reasoning step when last content is reasoning", () => {
    const content = [{ type: "reasoning" }]
    const steps = [reasoningStep]
    expect(computeCurrentStep(content, steps, false)).toBe(reasoningStep)
  })

  it("returns tool step when last content is tool-call", () => {
    const toolStep: ThinkingStep = {
      id: "tool-searchDocuments-1",
      type: "tool-call",
      label: "문서 검색 중...",
      status: "running",
    }
    const content = [{ type: "reasoning" }, { type: "tool-call", toolName: "searchDocuments" }]
    const steps = [reasoningStep, toolStep]
    expect(computeCurrentStep(content, steps, false)).toBe(toolStep)
  })

  it("returns reasoning step when last content is reasoning after tool-call", () => {
    const toolStep: ThinkingStep = {
      id: "tool-searchDocuments-1",
      type: "tool-call",
      label: "문서 검색 중...",
      status: "running",
    }
    const content = [
      { type: "reasoning" },
      { type: "tool-call", toolName: "searchDocuments" },
      { type: "reasoning" },
    ]
    const steps = [reasoningStep, toolStep]
    expect(computeCurrentStep(content, steps, false)).toBe(reasoningStep)
  })

  it("returns null when no matching step found", () => {
    const content = [{ type: "tool-call", toolName: "unknownTool" }]
    const steps: ThinkingStep[] = []
    expect(computeCurrentStep(content, steps, false)).toBeNull()
  })

  it("returns null for empty content", () => {
    expect(computeCurrentStep([], [], false)).toBeNull()
  })
})

// --- SSE Stream Simulation ---

describe("SSE stream simulation - label sequence", () => {
  function deriveTargetLabel(
    content: ReadonlyArray<{ type: string; text?: string; toolName?: string }>,
    isComplete: boolean
  ): string {
    if (isComplete) return "사고 과정"

    const hasReasoning = content.some((p) => p.type === "reasoning")
    const steps: ThinkingStep[] = []
    if (hasReasoning) {
      steps.push({
        id: "reasoning",
        type: "reasoning",
        label: "생각 중...",
        status: "running",
      })
    }
    steps.push(...computeToolSteps(content, false))

    const current = computeCurrentStep(content, steps, false)
    if (!current) return "생각 중..."

    if (current.type === "reasoning") {
      const title = extractReasoningTitle(content)
      return title || "생각 중..."
    }

    return current.label
  }

  // S1: [reasoning₁] → reasoning with title
  it("S1: reasoning with bold title", () => {
    const content = [
      { type: "reasoning", text: "Let me think about this... **Synthesizing Skill Sets**" },
    ]
    expect(deriveTargetLabel(content, false)).toBe("Synthesizing Skill Sets")
  })

  // S2: [reasoning₁, tc:searchDocuments] → tool-call
  it("S2: tool-call after reasoning", () => {
    const content = [
      { type: "reasoning", text: "Let me think about this... **Synthesizing Skill Sets**" },
      { type: "tool-call", toolName: "searchDocuments" },
    ]
    expect(deriveTargetLabel(content, false)).toBe("문서 검색 중...")
  })

  // S3: [reasoning₁, tc₁, reasoning₂] → reasoning with new title
  it("S3: second reasoning phase", () => {
    const content = [
      { type: "reasoning", text: "**Synthesizing Skill Sets**" },
      { type: "tool-call", toolName: "searchDocuments" },
      { type: "reasoning", text: "Looking at results... **Pinpointing Relevant Content**" },
    ]
    expect(deriveTargetLabel(content, false)).toBe("Pinpointing Relevant Content")
  })

  // S4: [r₁, tc₁, r₂, tc:readDocument] → tool-call
  it("S4: second tool-call", () => {
    const content = [
      { type: "reasoning", text: "**Synthesizing Skill Sets**" },
      { type: "tool-call", toolName: "searchDocuments" },
      { type: "reasoning", text: "**Pinpointing Relevant Content**" },
      { type: "tool-call", toolName: "readDocument" },
    ]
    expect(deriveTargetLabel(content, false)).toBe("문서 상세 조회 중...")
  })

  // S5: complete → "사고 과정"
  it("S5: complete state", () => {
    const content = [
      { type: "reasoning", text: "**Synthesizing Skill Sets**" },
      { type: "tool-call", toolName: "searchDocuments" },
      { type: "reasoning", text: "**Pinpointing Relevant Content**" },
      { type: "tool-call", toolName: "readDocument" },
      { type: "reasoning", text: "**Reviewing and Refining Data**" },
      { type: "text", text: "Here is the final answer..." },
    ]
    expect(deriveTargetLabel(content, true)).toBe("사고 과정")
  })

  // Full sequence verification
  it("full label sequence matches expected progression", () => {
    const snapshots: Array<{
      content: Array<{ type: string; text?: string; toolName?: string }>
      isComplete: boolean
      expectedLabel: string
    }> = [
      {
        content: [{ type: "reasoning", text: "**Synthesizing Skill Sets**" }],
        isComplete: false,
        expectedLabel: "Synthesizing Skill Sets",
      },
      {
        content: [
          { type: "reasoning", text: "**Synthesizing Skill Sets**" },
          { type: "tool-call", toolName: "searchDocuments" },
        ],
        isComplete: false,
        expectedLabel: "문서 검색 중...",
      },
      {
        content: [
          { type: "reasoning", text: "**Synthesizing Skill Sets**" },
          { type: "tool-call", toolName: "searchDocuments" },
          { type: "reasoning", text: "**Pinpointing Relevant Content**" },
        ],
        isComplete: false,
        expectedLabel: "Pinpointing Relevant Content",
      },
      {
        content: [
          { type: "reasoning", text: "**Synthesizing Skill Sets**" },
          { type: "tool-call", toolName: "searchDocuments" },
          { type: "reasoning", text: "**Pinpointing Relevant Content**" },
          { type: "tool-call", toolName: "readDocument" },
        ],
        isComplete: false,
        expectedLabel: "문서 상세 조회 중...",
      },
      {
        content: [
          { type: "reasoning", text: "**Synthesizing Skill Sets**" },
          { type: "tool-call", toolName: "searchDocuments" },
          { type: "reasoning", text: "**Pinpointing Relevant Content**" },
          { type: "tool-call", toolName: "readDocument" },
          { type: "reasoning", text: "**Reviewing and Refining Data**" },
        ],
        isComplete: false,
        expectedLabel: "Reviewing and Refining Data",
      },
      {
        content: [
          { type: "reasoning", text: "**Synthesizing Skill Sets**" },
          { type: "tool-call", toolName: "searchDocuments" },
          { type: "reasoning", text: "**Pinpointing Relevant Content**" },
          { type: "tool-call", toolName: "readDocument" },
          { type: "reasoning", text: "**Reviewing and Refining Data**" },
          { type: "tool-call", toolName: "searchDocuments" },
        ],
        isComplete: false,
        expectedLabel: "문서 검색 중...",
      },
      {
        content: [
          { type: "reasoning", text: "**Synthesizing Skill Sets**" },
          { type: "tool-call", toolName: "searchDocuments" },
          { type: "reasoning", text: "**Pinpointing Relevant Content**" },
          { type: "tool-call", toolName: "readDocument" },
          { type: "reasoning", text: "**Reviewing and Refining Data**" },
          { type: "tool-call", toolName: "searchDocuments" },
          { type: "reasoning", text: "**Refining the Strategy**" },
        ],
        isComplete: false,
        expectedLabel: "Refining the Strategy",
      },
      {
        content: [
          { type: "reasoning", text: "**Synthesizing Skill Sets**" },
          { type: "tool-call", toolName: "searchDocuments" },
          { type: "reasoning", text: "**Pinpointing Relevant Content**" },
          { type: "tool-call", toolName: "readDocument" },
          { type: "reasoning", text: "**Reviewing and Refining Data**" },
          { type: "tool-call", toolName: "searchDocuments" },
          { type: "reasoning", text: "**Refining the Strategy**" },
          { type: "text", text: "Here is the final answer..." },
        ],
        isComplete: true,
        expectedLabel: "사고 과정",
      },
    ]

    const labels = snapshots.map((s) => deriveTargetLabel(s.content, s.isComplete))
    const expected = snapshots.map((s) => s.expectedLabel)
    expect(labels).toEqual(expected)
  })
})
