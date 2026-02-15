import type { UIMessageChunk } from "ai"
import { describe, expect, it } from "vitest"
import { createToolInputDeltaFilter } from "@/lib/stream/filter-tool-input-delta"

async function collectChunks(stream: ReadableStream<UIMessageChunk>): Promise<UIMessageChunk[]> {
  const chunks: UIMessageChunk[] = []
  const reader = stream.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  return chunks
}

function createStream(chunks: UIMessageChunk[]): ReadableStream<UIMessageChunk> {
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk)
      }
      controller.close()
    },
  })
}

describe("createToolInputDeltaFilter", () => {
  it("일반 이벤트(text-delta, text-start, finish 등)를 통과시킨다", async () => {
    const input: UIMessageChunk[] = [
      { type: "start", messageId: "msg-1" },
      { type: "text-start", id: "text-1" },
      { type: "text-delta", id: "text-1", delta: "hello" },
      { type: "text-end", id: "text-1" },
      { type: "start-step" },
      { type: "finish-step" },
      { type: "finish", finishReason: "stop" },
    ]

    const stream = createStream(input).pipeThrough(createToolInputDeltaFilter())
    const result = await collectChunks(stream)

    expect(result).toEqual(input)
  })

  it("tool-input-delta 타입 청크를 필터링한다", async () => {
    const input: UIMessageChunk[] = [
      { type: "start", messageId: "msg-1" },
      { type: "tool-input-start", toolCallId: "tc-1", toolName: "answer" },
      { type: "tool-input-delta", toolCallId: "tc-1", inputTextDelta: '{"answer":' },
      { type: "tool-input-delta", toolCallId: "tc-1", inputTextDelta: '"hello"}' },
      {
        type: "tool-input-available",
        toolCallId: "tc-1",
        toolName: "answer",
        input: { answer: "hello" },
      },
      { type: "finish", finishReason: "stop" },
    ]

    const stream = createStream(input).pipeThrough(createToolInputDeltaFilter())
    const result = await collectChunks(stream)

    expect(result).toEqual([
      { type: "start", messageId: "msg-1" },
      { type: "tool-input-start", toolCallId: "tc-1", toolName: "answer" },
      {
        type: "tool-input-available",
        toolCallId: "tc-1",
        toolName: "answer",
        input: { answer: "hello" },
      },
      { type: "finish", finishReason: "stop" },
    ])
  })

  it("tool-input-start와 tool-input-available는 보존한다", async () => {
    const input: UIMessageChunk[] = [
      { type: "tool-input-start", toolCallId: "tc-1", toolName: "searchDocuments" },
      { type: "tool-input-delta", toolCallId: "tc-1", inputTextDelta: '{"query":"test"}' },
      {
        type: "tool-input-available",
        toolCallId: "tc-1",
        toolName: "searchDocuments",
        input: { query: "test" },
      },
    ]

    const stream = createStream(input).pipeThrough(createToolInputDeltaFilter())
    const result = await collectChunks(stream)

    expect(result).toHaveLength(2)
    expect(result[0].type).toBe("tool-input-start")
    expect(result[1].type).toBe("tool-input-available")
  })

  it("여러 도구의 delta가 모두 필터링된다", async () => {
    const input: UIMessageChunk[] = [
      { type: "start", messageId: "msg-1" },
      { type: "tool-input-start", toolCallId: "tc-1", toolName: "searchDocuments" },
      { type: "tool-input-delta", toolCallId: "tc-1", inputTextDelta: '{"query":' },
      { type: "tool-input-delta", toolCallId: "tc-1", inputTextDelta: '"react"}' },
      {
        type: "tool-input-available",
        toolCallId: "tc-1",
        toolName: "searchDocuments",
        input: { query: "react" },
      },
      { type: "tool-input-start", toolCallId: "tc-2", toolName: "answer" },
      { type: "tool-input-delta", toolCallId: "tc-2", inputTextDelta: '{"answer":' },
      { type: "tool-input-delta", toolCallId: "tc-2", inputTextDelta: '"답변"}' },
      {
        type: "tool-input-available",
        toolCallId: "tc-2",
        toolName: "answer",
        input: { answer: "답변" },
      },
      { type: "finish", finishReason: "stop" },
    ]

    const stream = createStream(input).pipeThrough(createToolInputDeltaFilter())
    const result = await collectChunks(stream)

    const types = result.map((c) => c.type)
    expect(types).not.toContain("tool-input-delta")
    expect(types).toContain("tool-input-start")
    expect(types).toContain("tool-input-available")
    expect(result).toHaveLength(6)
  })

  it("빈 스트림을 에러 없이 처리한다", async () => {
    const stream = createStream([]).pipeThrough(createToolInputDeltaFilter())
    const result = await collectChunks(stream)

    expect(result).toEqual([])
  })
})
