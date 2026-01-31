/**
 * TOON Encoder Tests
 * TOON 포맷 인코딩 유틸리티 테스트
 */

import { describe, expect, it } from "vitest"
import { createFormatHint, encodeArrayResult } from "../../../src/lib/work-agent/toon-encoder"

describe("TOON Encoder", () => {
  describe("encodeArrayResult", () => {
    it("10개 미만 배열은 JSON 포맷 유지", () => {
      const items = [
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
        { id: "3", name: "Item 3" },
      ]

      const result = encodeArrayResult(items)

      expect(result.format).toBe("json")
      expect(result.data).toEqual(items)
      expect(result.count).toBe(3)
    })

    it("10개 이상 배열은 TOON 포맷 적용", () => {
      const items = Array.from({ length: 12 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Item ${i + 1}`,
      }))

      const result = encodeArrayResult(items)

      expect(result.format).toBe("toon")
      expect(typeof result.data).toBe("string")
      expect(result.count).toBe(12)
    })

    it("정확히 10개일 때 TOON 포맷 적용", () => {
      const items = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Item ${i + 1}`,
      }))

      const result = encodeArrayResult(items)

      expect(result.format).toBe("toon")
      expect(result.count).toBe(10)
    })

    it("빈 배열은 JSON 포맷 유지", () => {
      const result = encodeArrayResult([])

      expect(result.format).toBe("json")
      expect(result.data).toEqual([])
      expect(result.count).toBe(0)
    })

    it("복잡한 객체도 TOON 인코딩 가능", () => {
      const items = Array.from({ length: 10 }, (_, i) => ({
        id: `task-${i + 1}`,
        name: `Task ${i + 1}`,
        status: "in progress",
        tags: ["bug", "priority"],
        nested: { key: "value" },
      }))

      const result = encodeArrayResult(items)

      expect(result.format).toBe("toon")
      expect(typeof result.data).toBe("string")
      expect(result.count).toBe(10)
    })
  })

  describe("createFormatHint", () => {
    it("TOON 포맷일 때 힌트 반환", () => {
      const hint = createFormatHint("toon")

      expect(hint).toBe("Data in TOON format. Parse comma-separated values per row.")
    })

    it("JSON 포맷일 때 undefined 반환", () => {
      const hint = createFormatHint("json")

      expect(hint).toBeUndefined()
    })
  })
})
