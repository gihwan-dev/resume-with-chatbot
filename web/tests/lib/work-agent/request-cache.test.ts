import { describe, expect, it, vi } from "vitest"
import { RequestCache } from "@/lib/work-agent/request-cache"

describe("RequestCache", () => {
  describe("get / set", () => {
    it("캐시 미스 시 undefined 반환", () => {
      const cache = new RequestCache()
      expect(cache.get("searchNotion", { query: "test" })).toBeUndefined()
    })

    it("캐시 히트 시 저장된 값 반환", () => {
      const cache = new RequestCache()
      const result = { success: true, data: { pages: [] } }
      cache.set("searchNotion", { query: "test" }, result)
      expect(cache.get("searchNotion", { query: "test" })).toEqual(result)
    })

    it("다른 파라미터는 별도 캐시 항목", () => {
      const cache = new RequestCache()
      const result1 = { data: "result1" }
      const result2 = { data: "result2" }
      cache.set("searchNotion", { query: "react" }, result1)
      cache.set("searchNotion", { query: "typescript" }, result2)

      expect(cache.get("searchNotion", { query: "react" })).toEqual(result1)
      expect(cache.get("searchNotion", { query: "typescript" })).toEqual(result2)
    })

    it("다른 도구 이름은 별도 캐시 항목", () => {
      const cache = new RequestCache()
      const result1 = { data: "notion" }
      const result2 = { data: "clickup" }
      cache.set("searchNotion", { query: "test" }, result1)
      cache.set("searchClickUpTasks", { query: "test" }, result2)

      expect(cache.get("searchNotion", { query: "test" })).toEqual(result1)
      expect(cache.get("searchClickUpTasks", { query: "test" })).toEqual(result2)
    })
  })

  describe("getOrFetch", () => {
    it("캐시 미스 시 fn 실행하고 결과를 캐시", async () => {
      const cache = new RequestCache()
      const fn = vi.fn().mockResolvedValue({ success: true, data: { pages: [] } })

      const result = await cache.getOrFetch("searchNotion", { query: "test" }, fn)

      expect(fn).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ success: true, data: { pages: [] } })

      // 두 번째 호출 - fn이 다시 호출되지 않아야 함
      const result2 = await cache.getOrFetch("searchNotion", { query: "test" }, fn)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(result2).toEqual(result)
    })

    it("다른 파라미터로 호출 시 fn 재실행", async () => {
      const cache = new RequestCache()
      const fn = vi
        .fn()
        .mockResolvedValueOnce({ data: "result1" })
        .mockResolvedValueOnce({ data: "result2" })

      await cache.getOrFetch("searchNotion", { query: "react" }, fn)
      await cache.getOrFetch("searchNotion", { query: "typescript" }, fn)

      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe("size", () => {
    it("캐시 크기 추적", () => {
      const cache = new RequestCache()
      expect(cache.size).toBe(0)

      cache.set("tool1", { key: "a" }, "value1")
      expect(cache.size).toBe(1)

      cache.set("tool2", { key: "b" }, "value2")
      expect(cache.size).toBe(2)
    })
  })
})
