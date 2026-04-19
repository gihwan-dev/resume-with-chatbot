import { describe, expect, it } from "vitest"
import { bfsRelatedNodes, type LinkGraphNode } from "../../../src/lib/work-agent/link-graph"

function makeGraph(
  entries: Record<string, { out?: string[]; in?: string[] }>
): Map<string, LinkGraphNode> {
  const graph = new Map<string, LinkGraphNode>()
  for (const [id, links] of Object.entries(entries)) {
    graph.set(id, { outLinks: links.out ?? [], inLinks: links.in ?? [] })
  }
  return graph
}

describe("bfsRelatedNodes", () => {
  it("depth=1: outLinks와 inLinks 모두 포함하고 자기 자신 제외", () => {
    const graph = makeGraph({
      root: { out: ["a", "b"], in: ["c"] },
      a: {},
      b: {},
      c: {},
    })

    const result = bfsRelatedNodes("root", graph, 1)
    const ids = result.map((r) => r.id)
    expect(ids).toContain("a")
    expect(ids).toContain("b")
    expect(ids).toContain("c")
    expect(ids).not.toContain("root")

    // outLink가 inLink보다 앞에 와야 함 (same distance)
    const aRelation = result.find((r) => r.id === "a")
    const cRelation = result.find((r) => r.id === "c")
    expect(aRelation?.relation).toBe("outLink")
    expect(cRelation?.relation).toBe("inLink")
  })

  it("depth=2: 이웃의 이웃도 포함, 거리 짧은 쪽 유지", () => {
    const graph = makeGraph({
      root: { out: ["a"] },
      a: { out: ["b"] },
      b: { out: ["c"] },
    })

    const result = bfsRelatedNodes("root", graph, 2)
    const distances = new Map(result.map((r) => [r.id, r.distance]))
    expect(distances.get("a")).toBe(1)
    expect(distances.get("b")).toBe(2)
    // c는 3-hop이므로 포함되지 않음
    expect(distances.has("c")).toBe(false)
  })

  it("순환 그래프(A→B→A)에서도 자기 자신 제외", () => {
    const graph = makeGraph({
      root: { out: ["b"] },
      b: { out: ["root"] },
    })

    const result = bfsRelatedNodes("root", graph, 2)
    const ids = result.map((r) => r.id)
    expect(ids).toEqual(["b"])
  })

  it("동일 거리에서 outLink가 inLink를 덮어씀 (symmetric case)", () => {
    // root -out→ a, a -in← root (inLinks 기준), 같은 distance 1에서 outLink 우선
    const graph = makeGraph({
      root: { out: ["a"], in: ["a"] },
      a: {},
    })

    const result = bfsRelatedNodes("root", graph, 1)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("a")
    expect(result[0].relation).toBe("outLink")
  })

  it("graph에 root가 없으면 빈 결과", () => {
    const graph = makeGraph({ other: { out: ["x"] } })
    expect(bfsRelatedNodes("missing", graph, 1)).toEqual([])
  })

  it("MAX_RESULTS(20) 초과 시 상위 20개만 반환", () => {
    const entries: Record<string, { out?: string[] }> = { root: { out: [] } }
    for (let i = 0; i < 30; i++) {
      entries[`n${i}`] = {}
    }
    entries.root.out = Object.keys(entries).filter((k) => k !== "root")
    const graph = makeGraph(entries)

    const result = bfsRelatedNodes("root", graph, 1)
    expect(result).toHaveLength(20)
  })

  it("결과 정렬: distance → relation(outLink 우선) → id", () => {
    const graph = makeGraph({
      root: { out: ["z", "a"], in: ["m"] },
      z: {},
      a: {},
      m: {},
    })

    const result = bfsRelatedNodes("root", graph, 1)
    // 같은 distance: outLink먼저 → id 오름차순
    expect(result.map((r) => r.id)).toEqual(["a", "z", "m"])
  })
})
