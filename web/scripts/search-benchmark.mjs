/**
 * 검색 벤치마크 스크립트
 * 기존 substring 검색 vs MiniSearch 검색 비교
 *
 * Usage:
 *   node scripts/search-benchmark.mjs           # 전체 비교
 *   node scripts/search-benchmark.mjs --baseline # baseline만 실행
 */

import fs from "node:fs"
import path from "node:path"
import MiniSearch from "minisearch"

const VAULT_DATA_PATH = path.join(process.cwd(), "src", "generated", "vault-data.json")

if (!fs.existsSync(VAULT_DATA_PATH)) {
  console.error("[benchmark] vault-data.json not found. Run: pnpm build:vault")
  process.exit(1)
}

const { documents } = JSON.parse(fs.readFileSync(VAULT_DATA_PATH, "utf-8"))
console.log(`[benchmark] Loaded ${documents.length} documents\n`)

// ─── Ground Truth 쿼리셋 ───

const queries = [
  // ① 정확 매칭
  { query: "useRef", category: "exact", expectKeywords: ["useRef", "useref"] },
  { query: "위젯 빌더 리팩토링", category: "exact", expectKeywords: ["위젯", "빌더"] },
  { query: "Context API", category: "exact", expectKeywords: ["Context", "context"] },
  { query: "차세대 대시보드", category: "exact", expectKeywords: ["차세대", "대시보드"] },
  { query: "Clean Code", category: "exact", expectKeywords: ["Clean Code", "clean code"] },

  // ② 퍼지/오타 매칭
  { query: "Recat", category: "fuzzy", expectKeywords: ["React", "react"] },
  { query: "Typscript", category: "fuzzy", expectKeywords: ["TypeScript", "typescript"] },
  { query: "javascrip", category: "fuzzy", expectKeywords: ["JavaScript", "javascript"] },
  { query: "알고리듬", category: "fuzzy", expectKeywords: ["Algorithm", "알고리즘"] },
  { query: "디자인 시스템", category: "fuzzy", expectKeywords: ["Design", "디자인"] },

  // ③ 본문 전용 매칭
  { query: "reconciliation", category: "content", expectKeywords: ["reconciliation"] },
  { query: "hydration", category: "content", expectKeywords: ["hydration"] },
  { query: "fiber", category: "content", expectKeywords: ["fiber", "Fiber"] },
  { query: "가상 DOM", category: "content", expectKeywords: ["가상", "DOM", "dom"] },
  { query: "useEffect", category: "content", expectKeywords: ["useEffect", "useeffect"] },

  // ④ 복합 쿼리
  { query: "React 컴포넌트 설계", category: "multi", expectKeywords: ["React", "컴포넌트"] },
  {
    query: "프론트엔드 아키텍처 패턴",
    category: "multi",
    expectKeywords: ["프론트엔드", "아키텍처", "패턴"],
  },
  {
    query: "테이블 컴포넌트 리팩토링",
    category: "multi",
    expectKeywords: ["테이블", "컴포넌트", "리팩토링"],
  },
  { query: "성능 최적화 방법", category: "multi", expectKeywords: ["성능", "최적화"] },
  { query: "데이터 그리드 구현", category: "multi", expectKeywords: ["데이터", "그리드"] },
]

// ─── Baseline: substring 검색 ───

function baselineSearch(docs, query, limit = 10) {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0)
  if (tokens.length === 0) return []

  const scored = docs.map((doc) => {
    let score = 0
    const titleLower = doc.title.toLowerCase()
    const categoryLower = doc.category.toLowerCase()
    const summaryLower = doc.summary.toLowerCase()
    const tagsLower = doc.tags.map((t) => t.toLowerCase())

    for (const token of tokens) {
      if (titleLower.includes(token)) score += 3
      if (categoryLower.includes(token)) score += 2
      if (tagsLower.some((t) => t.includes(token))) score += 2
      if (summaryLower.includes(token)) score += 1
    }

    return { doc, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.doc)
}

// ─── MiniSearch 검색 ───

function buildMiniSearchIndex(docs) {
  const miniSearch = new MiniSearch({
    fields: ["title", "category", "tagsText", "summary", "content"],
    storeFields: ["title", "category", "path", "summary", "tags"],
    searchOptions: {
      boost: { title: 3, category: 2, tagsText: 2, summary: 1.5, content: 1 },
      prefix: true,
      fuzzy: 0.2,
      combineWith: "OR",
    },
  })

  const indexDocs = docs.map((doc) => ({
    ...doc,
    tagsText: doc.tags.join(" "),
  }))

  miniSearch.addAll(indexDocs)
  return miniSearch
}

function miniSearchSearch(index, query, limit = 10) {
  const trimmed = query.trim()
  if (trimmed.length === 0) return []

  return index
    .search(trimmed, {
      boost: { title: 3, category: 2, tagsText: 2, summary: 1.5, content: 1 },
      prefix: true,
      fuzzy: 0.2,
      combineWith: "OR",
    })
    .slice(0, limit)
    .map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      path: r.path,
      summary: r.summary ?? "",
      tags: r.tags ?? [],
    }))
}

// ─── 평가 지표 ───

function hasHit(results, expectKeywords) {
  return results.some((doc) => {
    const text =
      `${doc.title} ${doc.category} ${(doc.tags || []).join(" ")} ${doc.summary} ${doc.content || ""}`.toLowerCase()
    return expectKeywords.some((kw) => text.includes(kw.toLowerCase()))
  })
}

function findFirstHitRank(results, expectKeywords) {
  for (let i = 0; i < results.length; i++) {
    const doc = results[i]
    const text =
      `${doc.title} ${doc.category} ${(doc.tags || []).join(" ")} ${doc.summary} ${doc.content || ""}`.toLowerCase()
    if (expectKeywords.some((kw) => text.includes(kw.toLowerCase()))) {
      return i + 1
    }
  }
  return null
}

function measureLatency(searchFn, iterations = 1000) {
  const times = []
  for (let i = 0; i < iterations; i++) {
    const q = queries[i % queries.length].query
    const start = performance.now()
    searchFn(q)
    times.push(performance.now() - start)
  }
  times.sort((a, b) => a - b)
  return {
    p50: times[Math.floor(times.length * 0.5)],
    p95: times[Math.floor(times.length * 0.95)],
  }
}

// ─── 실행 ───

console.log("Building MiniSearch index...")
const indexStart = performance.now()
const miniSearchIndex = buildMiniSearchIndex(documents)
const indexBuildTime = performance.now() - indexStart
console.log(`Index built in ${indexBuildTime.toFixed(1)}ms`)

// 직렬화/역직렬화 시간 측정
const serialized = JSON.stringify(miniSearchIndex)
const loadStart = performance.now()
const _loaded = MiniSearch.loadJSON(serialized, {
  fields: ["title", "category", "tagsText", "summary", "content"],
  storeFields: ["title", "category", "path", "summary", "tags"],
})
const indexLoadTime = performance.now() - loadStart
console.log(`Index load (loadJSON) in ${indexLoadTime.toFixed(1)}ms\n`)

// 카테고리별 결과 수집
const categories = ["exact", "fuzzy", "content", "multi"]
const categoryNames = {
  exact: "Exact Match",
  fuzzy: "Fuzzy/Typo",
  content: "Content-Only",
  multi: "Multi-token",
}

const baselineResults = { hit5: 0, hit10: 0, mrr: 0, total: 0 }
const miniResults = { hit5: 0, hit10: 0, mrr: 0, total: 0 }
const categoryResults = {}

for (const cat of categories) {
  categoryResults[cat] = { baseline: { hits: 0, total: 0 }, mini: { hits: 0, total: 0 } }
}

console.log("=".repeat(80))
console.log("Query-level Results")
console.log("=".repeat(80))

for (const { query, category, expectKeywords } of queries) {
  const bResults = baselineSearch(documents, query, 10)
  const mResults = miniSearchSearch(miniSearchIndex, query, 10)

  const bHit5 = hasHit(bResults.slice(0, 5), expectKeywords) ? 1 : 0
  const bHit10 = hasHit(bResults, expectKeywords) ? 1 : 0
  const bRank = findFirstHitRank(bResults, expectKeywords)
  const bMRR = bRank ? 1 / bRank : 0

  const mHit5 = hasHit(mResults.slice(0, 5), expectKeywords) ? 1 : 0
  const mHit10 = hasHit(mResults, expectKeywords) ? 1 : 0
  const mRank = findFirstHitRank(mResults, expectKeywords)
  const mMRR = mRank ? 1 / mRank : 0

  baselineResults.hit5 += bHit5
  baselineResults.hit10 += bHit10
  baselineResults.mrr += bMRR
  baselineResults.total++

  miniResults.hit5 += mHit5
  miniResults.hit10 += mHit10
  miniResults.mrr += mMRR
  miniResults.total++

  categoryResults[category].baseline.hits += bHit10
  categoryResults[category].baseline.total++
  categoryResults[category].mini.hits += mHit10
  categoryResults[category].mini.total++

  const bStatus = bHit10 ? "HIT" : "MISS"
  const mStatus = mHit10 ? "HIT" : "MISS"
  console.log(
    `[${category.padEnd(7)}] "${query}" → Baseline: ${bStatus} (${bResults.length} results) | MiniSearch: ${mStatus} (${mResults.length} results)`
  )
}

// Latency 측정
console.log("\nMeasuring latency (1000 iterations)...")
const baselineLatency = measureLatency((q) => baselineSearch(documents, q))
const miniLatency = measureLatency((q) => miniSearchSearch(miniSearchIndex, q))

// ─── 결과 출력 ───

const bHit5Pct = ((baselineResults.hit5 / baselineResults.total) * 100).toFixed(0)
const bHit10Pct = ((baselineResults.hit10 / baselineResults.total) * 100).toFixed(0)
const bMRR = (baselineResults.mrr / baselineResults.total).toFixed(2)

const mHit5Pct = ((miniResults.hit5 / miniResults.total) * 100).toFixed(0)
const mHit10Pct = ((miniResults.hit10 / miniResults.total) * 100).toFixed(0)
const mMRR = (miniResults.mrr / miniResults.total).toFixed(2)

const contentBaseline = categoryResults.content.baseline
const contentMini = categoryResults.content.mini
const bContentCvg = ((contentBaseline.hits / contentBaseline.total) * 100).toFixed(0)
const mContentCvg = ((contentMini.hits / contentMini.total) * 100).toFixed(0)

console.log("\n")
console.log("╔═══════════════════════════════════════════════════════════╗")
console.log("║              Search Benchmark Results                    ║")
console.log("╠═══════════════════════════════════════════════════════════╣")
console.log(
  `║ Documents: ${String(documents.length).padEnd(6)} | Queries: ${String(queries.length).padEnd(25)}║`
)
console.log("╠─────────────────┬──────────┬────────────┬────────────────╣")
console.log("║ Metric          │ Baseline │ MiniSearch │ Δ              ║")
console.log("╠─────────────────┼──────────┼────────────┼────────────────╣")

function row(label, bVal, mVal, delta) {
  console.log(
    `║ ${label.padEnd(15)} │ ${bVal.padEnd(8)} │ ${mVal.padEnd(10)} │ ${delta.padEnd(14)} ║`
  )
}

row(
  "Hit@5",
  `${bHit5Pct}%`,
  `${mHit5Pct}%`,
  `${mHit5Pct - bHit5Pct > 0 ? "+" : ""}${mHit5Pct - bHit5Pct}%`
)
row(
  "Hit@10",
  `${bHit10Pct}%`,
  `${mHit10Pct}%`,
  `${mHit10Pct - bHit10Pct > 0 ? "+" : ""}${mHit10Pct - bHit10Pct}%`
)
row("MRR", bMRR, mMRR, `${(mMRR - bMRR) > 0 ? "+" : ""}${(mMRR - bMRR).toFixed(2)}`)
row(
  "Content Cvg",
  `${bContentCvg}%`,
  `${mContentCvg}%`,
  `${mContentCvg - bContentCvg > 0 ? "+" : ""}${mContentCvg - bContentCvg}%`
)
row(
  "Latency p50",
  `${baselineLatency.p50.toFixed(2)}ms`,
  `${miniLatency.p50.toFixed(2)}ms`,
  `${(((miniLatency.p50 - baselineLatency.p50) / baselineLatency.p50) * 100).toFixed(0)}%`
)
row(
  "Latency p95",
  `${baselineLatency.p95.toFixed(2)}ms`,
  `${miniLatency.p95.toFixed(2)}ms`,
  `${(((miniLatency.p95 - baselineLatency.p95) / baselineLatency.p95) * 100).toFixed(0)}%`
)
row("Index Load", "N/A", `${indexLoadTime.toFixed(1)}ms`, "-")

console.log("╠─────────────────┴──────────┴────────────┴────────────────╣")
console.log("║ Category Breakdown                                      ║")
console.log("╠─────────────────┬──────────────────┬─────────────────────╣")

for (const cat of categories) {
  const bHits = categoryResults[cat].baseline.hits
  const bTotal = categoryResults[cat].baseline.total
  const mHits = categoryResults[cat].mini.hits
  const mTotal = categoryResults[cat].mini.total
  const bPct = ((bHits / bTotal) * 100).toFixed(0)
  const mPct = ((mHits / mTotal) * 100).toFixed(0)
  const name = categoryNames[cat]
  console.log(
    `║ ${name.padEnd(15)} │ ${`${bPct}% → ${mPct}%`.padEnd(16)} │ ${`${mHits}/${mTotal} hits`.padEnd(19)} ║`
  )
}

console.log("╚═════════════════╧══════════════════╧═════════════════════╝")
