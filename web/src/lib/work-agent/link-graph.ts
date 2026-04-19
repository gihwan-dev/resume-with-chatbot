/**
 * Wiki 링크 그래프 BFS 순수 함수
 * obsidian.server의 상태에 의존하지 않도록 graph를 외부에서 주입받음
 */

export interface LinkGraphNode {
  outLinks: readonly string[]
  inLinks: readonly string[]
}

export interface BfsRelatedResult {
  id: string
  relation: "outLink" | "inLink"
  distance: 1 | 2
}

const MAX_RESULTS = 20

export function bfsRelatedNodes(
  rootId: string,
  graph: ReadonlyMap<string, LinkGraphNode>,
  depth: 1 | 2 = 1
): BfsRelatedResult[] {
  const root = graph.get(rootId)
  if (!root) return []

  const visited = new Map<string, { relation: "outLink" | "inLink"; distance: 1 | 2 }>()

  const enqueue = (neighborId: string, relation: "outLink" | "inLink", distance: 1 | 2) => {
    if (neighborId === rootId) return
    const existing = visited.get(neighborId)
    if (!existing) {
      visited.set(neighborId, { relation, distance })
      return
    }
    if (distance < existing.distance) {
      visited.set(neighborId, { relation, distance })
      return
    }
    if (
      distance === existing.distance &&
      existing.relation === "inLink" &&
      relation === "outLink"
    ) {
      visited.set(neighborId, { relation, distance })
    }
  }

  for (const id of root.outLinks) enqueue(id, "outLink", 1)
  for (const id of root.inLinks) enqueue(id, "inLink", 1)

  if (depth === 2) {
    const firstHop = Array.from(visited.keys())
    for (const firstId of firstHop) {
      const node = graph.get(firstId)
      if (!node) continue
      for (const id of node.outLinks) enqueue(id, "outLink", 2)
      for (const id of node.inLinks) enqueue(id, "inLink", 2)
    }
  }

  const results: BfsRelatedResult[] = []
  for (const [id, info] of visited) {
    results.push({ id, relation: info.relation, distance: info.distance })
  }

  results.sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance
    if (a.relation !== b.relation) return a.relation === "outLink" ? -1 : 1
    return a.id.localeCompare(b.id)
  })

  return results.slice(0, MAX_RESULTS)
}
