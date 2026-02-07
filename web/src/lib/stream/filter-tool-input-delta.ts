import type { UIMessageChunk } from "ai"

export function createToolInputDeltaFilter(): TransformStream<UIMessageChunk, UIMessageChunk> {
  return new TransformStream({
    transform(chunk, controller) {
      if (chunk.type !== "tool-input-delta") {
        controller.enqueue(chunk)
      }
    },
  })
}
