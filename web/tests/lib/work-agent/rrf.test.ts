import { describe, expect, it } from "vitest"
import { reciprocalRankFusion } from "../../../src/lib/work-agent/rrf"

interface Item {
  id: string
  label?: string
}

describe("reciprocalRankFusion", () => {
  it("빈 입력에서 빈 배열 반환", () => {
    expect(reciprocalRankFusion<Item>([])).toEqual([])
    expect(reciprocalRankFusion<Item>([[]], 60, 10)).toEqual([])
  })

  it("단일 랭킹이면 순서 보존", () => {
    const ranking: Item[] = [{ id: "a" }, { id: "b" }, { id: "c" }]
    const result = reciprocalRankFusion([ranking])
    expect(result.map((r) => r.id)).toEqual(["a", "b", "c"])
  })

  it("두 랭킹 모두에 있는 문서가 상위로 올라감", () => {
    const bm25: Item[] = [{ id: "x", label: "from-bm25" }, { id: "a" }, { id: "b" }]
    const vector: Item[] = [{ id: "y" }, { id: "x", label: "from-vector" }, { id: "b" }]

    const result = reciprocalRankFusion([bm25, vector], 60, 5)

    // x는 두 랭킹 모두 상위 → 1위
    expect(result[0].id).toBe("x")
    // 첫 등장 메타 보존 (bm25 먼저)
    expect(result[0].label).toBe("from-bm25")
  })

  it("겹치지 않는 결과는 각 랭킹 상위가 번갈아 나옴", () => {
    const bm25: Item[] = [{ id: "a" }, { id: "b" }]
    const vector: Item[] = [{ id: "c" }, { id: "d" }]

    const result = reciprocalRankFusion([bm25, vector], 60, 4)

    // a와 c는 같은 점수 1/(60+0), b와 d는 1/(60+1)
    const topTwoIds = result
      .slice(0, 2)
      .map((r) => r.id)
      .sort()
    expect(topTwoIds).toEqual(["a", "c"])

    const lastTwoIds = result
      .slice(2, 4)
      .map((r) => r.id)
      .sort()
    expect(lastTwoIds).toEqual(["b", "d"])
  })

  it("limit 파라미터 준수", () => {
    const ranking: Item[] = Array.from({ length: 10 }, (_, i) => ({ id: `d${i}` }))
    const result = reciprocalRankFusion([ranking], 60, 3)
    expect(result).toHaveLength(3)
  })

  it("id 없는 항목은 스킵", () => {
    const malformed = [{ id: "a" }, { name: "no-id" } as unknown as Item, { id: "b" }]
    const result = reciprocalRankFusion([malformed])
    expect(result.map((r) => r.id)).toEqual(["a", "b"])
  })
})
