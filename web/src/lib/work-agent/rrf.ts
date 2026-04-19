/**
 * Reciprocal Rank Fusion (RRF)
 * 여러 랭킹의 결과를 ID 기준으로 점수 합산하여 단일 리스트로 결합
 * 공식: score(id) = Σ 1 / (k + rank_i(id))
 */

interface RankableItem {
  id: string
}

export function reciprocalRankFusion<T extends RankableItem>(
  rankings: readonly T[][],
  k = 60,
  limit = 20
): T[] {
  if (rankings.length === 0 || limit <= 0) return []

  const scores = new Map<string, number>()
  const firstSeen = new Map<string, T>()

  for (const ranking of rankings) {
    ranking.forEach((item, rank) => {
      if (!item || typeof item.id !== "string") return
      const current = scores.get(item.id) ?? 0
      scores.set(item.id, current + 1 / (k + rank))
      if (!firstSeen.has(item.id)) {
        firstSeen.set(item.id, item)
      }
    })
  }

  return Array.from(scores.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => firstSeen.get(id) as T)
}
