import MiniSearch from "minisearch"
import { describe, expect, it } from "vitest"

const MINISEARCH_OPTIONS = {
  fields: ["title", "category", "tagsText", "summary", "content"],
  storeFields: ["title", "category", "path", "summary", "tags"],
  searchOptions: {
    boost: { title: 3, category: 2, tagsText: 2, summary: 1.5, content: 1 },
    prefix: true,
    fuzzy: 0.2,
    combineWith: "OR" as const,
  },
}

function buildTestIndex() {
  const docs = [
    {
      id: "react--useRef",
      title: "useRef",
      category: "React.js",
      path: "React.js/useRef.md",
      summary: "React useRef 훅 사용법",
      tags: ["React.js"],
      tagsText: "React.js",
      content:
        "useRef는 렌더링 간에 값을 유지하는 React 훅입니다. DOM 요소에 접근하거나 mutable value를 저장할 때 사용합니다. reconciliation 과정에서 ref는 유지됩니다.",
    },
    {
      id: "typescript--generics",
      title: "TypeScript Generics",
      category: "TypeScript",
      path: "TypeScript/generics.md",
      summary: "TypeScript 제네릭 타입 시스템",
      tags: ["TypeScript"],
      tagsText: "TypeScript",
      content:
        "제네릭은 타입을 매개변수화하여 재사용 가능한 컴포넌트를 만들 수 있게 합니다. 타입 안전성을 유지하면서 유연한 코드를 작성할 수 있습니다.",
    },
    {
      id: "exem--widget-builder",
      title: "위젯 빌더 리팩토링",
      category: "Exem",
      path: "Exem/위젯 빌더 리팩토링.md",
      summary: "Exem 위젯 빌더 리팩토링 경험",
      tags: ["Exem"],
      tagsText: "Exem",
      content:
        "기존 위젯 빌더의 복잡한 상태 관리를 Zustand로 마이그레이션하고, 데이터 그리드 구현을 개선했습니다. hydration 이슈도 해결했습니다.",
    },
    {
      id: "react--fiber",
      title: "React 소스코드 분석",
      category: "React.js",
      path: "React.js/소스코드 분석.md",
      summary: "React 내부 구조 분석",
      tags: ["React.js"],
      tagsText: "React.js",
      content:
        "React의 fiber 아키텍처는 작업을 작은 단위로 나누어 처리합니다. 가상 DOM과 reconciliation 알고리즘이 핵심입니다.",
    },
    {
      id: "clean-code--naming",
      title: "Clean Code 명명 규칙",
      category: "Clean Code",
      path: "Clean Code/naming.md",
      summary: "좋은 이름 짓기 원칙",
      tags: ["Clean Code"],
      tagsText: "Clean Code",
      content: "의도를 드러내는 이름을 사용하세요. 검색 가능한 이름을 사용하고, 인코딩을 피하세요.",
    },
  ]

  const miniSearch = new MiniSearch(MINISEARCH_OPTIONS)
  miniSearch.addAll(docs)
  return miniSearch
}

function search(index: MiniSearch, query: string, limit = 20) {
  const trimmed = query.trim()
  if (trimmed.length === 0) return []

  const results = index.search(trimmed, {
    boost: { title: 3, category: 2, tagsText: 2, summary: 1.5, content: 1 },
    prefix: true,
    fuzzy: 0.2,
    combineWith: "OR",
  })

  return results.slice(0, limit).map((result) => ({
    id: result.id as string,
    title: result.title as string,
    category: result.category as string,
    path: result.path as string,
    summary: (result.summary as string) ?? "",
    tags: (result.tags as string[]) ?? [],
  }))
}

describe("MiniSearch 검색", () => {
  const index = buildTestIndex()

  it("기본 키워드 매칭", () => {
    const results = search(index, "useRef")
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].id).toBe("react--useRef")
  })

  it("퍼지 매칭 — 오타 허용", () => {
    // "Reacr" → "React" (1글자 차이, fuzzy 0.2 허용 범위)
    const results = search(index, "Reacr")
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.category === "React.js")).toBe(true)
  })

  it("접두어 매칭", () => {
    const results = search(index, "Type")
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.category === "TypeScript")).toBe(true)
  })

  it("본문 검색 — 메타데이터에 없는 용어", () => {
    const results = search(index, "reconciliation")
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.category === "React.js")).toBe(true)
  })

  it("필드 부스팅 — 제목 매칭이 본문 매칭보다 상위", () => {
    const results = search(index, "useRef")
    expect(results[0].title).toBe("useRef")
  })

  it("빈 쿼리 → 빈 결과", () => {
    expect(search(index, "")).toEqual([])
    expect(search(index, "   ")).toEqual([])
  })

  it("limit 파라미터", () => {
    const results = search(index, "React", 2)
    expect(results.length).toBeLessThanOrEqual(2)
  })

  it("한글 검색", () => {
    const results = search(index, "위젯 빌더")
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].id).toBe("exem--widget-builder")
  })

  it("본문에만 있는 hydration 검색", () => {
    const results = search(index, "hydration")
    expect(results.length).toBeGreaterThan(0)
  })

  it("직렬화/역직렬화 후 동일 동작", () => {
    const serialized = JSON.stringify(index)
    const loaded = MiniSearch.loadJSON(serialized, MINISEARCH_OPTIONS)
    const results = search(loaded, "useRef")
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].id).toBe("react--useRef")
  })
})
