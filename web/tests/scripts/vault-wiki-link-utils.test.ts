import { beforeAll, describe, expect, it } from "vitest"

type ParseWikiLinks = (content: string) => {
  outLinks: Array<{ target: string; display?: string }>
  imageLinks: Array<{ target: string; display?: string }>
}

interface DocIndex {
  pathMap: Map<string, string>
  titleMap: Map<string, string[]>
  basenameMap: Map<string, string[]>
}

type BuildDocIndex = (
  documents: Array<{ id: string; title: string; path: string; category?: string }>
) => DocIndex

type ResolveWikiTarget = (
  rawTarget: string,
  docIndex: DocIndex,
  context?: {
    sourceCategory?: string
    catalog?: Map<string, { category?: string }>
    onAmbiguous?: (target: string, candidates: string[]) => void
  }
) => string | null

let parseWikiLinks: ParseWikiLinks
let buildDocIndex: BuildDocIndex
let resolveWikiTarget: ResolveWikiTarget

beforeAll(async () => {
  const modulePath = "../../../scripts/vault-wiki-link-utils.mjs"
  const mod = (await import(modulePath)) as {
    parseWikiLinks: ParseWikiLinks
    buildDocIndex: BuildDocIndex
    resolveWikiTarget: ResolveWikiTarget
  }
  parseWikiLinks = mod.parseWikiLinks
  buildDocIndex = mod.buildDocIndex
  resolveWikiTarget = mod.resolveWikiTarget
})

describe("parseWikiLinks", () => {
  it("단순 [[링크]] 추출", () => {
    const result = parseWikiLinks("이 문서는 [[TLS 협상]]을 참조합니다.")
    expect(result.outLinks).toEqual([{ target: "TLS 협상", display: undefined }])
    expect(result.imageLinks).toEqual([])
  })

  it("alias가 있는 [[link|display]] 추출", () => {
    const result = parseWikiLinks("[[TLS 협상|협상 과정]]")
    expect(result.outLinks).toEqual([{ target: "TLS 협상", display: "협상 과정" }])
  })

  it("앵커(#)와 블록(^) 제거", () => {
    const result = parseWikiLinks("[[TLS 협상#암호스위트]] 그리고 [[문서^abc123]]")
    expect(result.outLinks.map((l) => l.target)).toEqual(["TLS 협상", "문서"])
  })

  it("임베드 이미지는 imageLinks로 분리", () => {
    const result = parseWikiLinks("![[Pasted image 20250211.png]] 본문 [[TLS 협상]]")
    expect(result.outLinks.map((l) => l.target)).toEqual(["TLS 협상"])
    expect(result.imageLinks.map((l) => l.target)).toEqual(["Pasted image 20250211.png"])
  })

  it("이미지가 아닌 임베드는 outLinks/imageLinks 둘 다에서 제외", () => {
    const result = parseWikiLinks("![[일반 노트 이름]]")
    expect(result.outLinks).toEqual([])
    expect(result.imageLinks).toEqual([])
  })

  it("빈 문자열/null 안전 처리", () => {
    expect(parseWikiLinks("")).toEqual({ outLinks: [], imageLinks: [] })
    expect(parseWikiLinks(undefined as unknown as string)).toEqual({
      outLinks: [],
      imageLinks: [],
    })
  })
})

describe("resolveWikiTarget", () => {
  const docs = [
    { id: "Network--TLS", title: "TLS 협상", path: "Network/TLS 협상.md" },
    { id: "Network--DNS", title: "DNS Lookup", path: "Network/DNS Lookup.md" },
    {
      id: "Frontend--TLS",
      title: "TLS 협상",
      path: "Frontend/TLS 협상.md",
      category: "Frontend",
    },
  ]

  it("title 정확 매치", () => {
    const index = buildDocIndex(docs)
    expect(resolveWikiTarget("DNS Lookup", index)).toBe("Network--DNS")
  })

  it("경로 포함 target은 path 매칭 우선", () => {
    const index = buildDocIndex(docs)
    expect(resolveWikiTarget("Network/TLS 협상", index)).toBe("Network--TLS")
    expect(resolveWikiTarget("Frontend/TLS 협상", index)).toBe("Frontend--TLS")
  })

  it("대소문자 무시 매칭", () => {
    const index = buildDocIndex(docs)
    expect(resolveWikiTarget("dns lookup", index)).toBe("Network--DNS")
  })

  it("동명 충돌: 같은 카테고리 우선", () => {
    const index = buildDocIndex(docs)
    const catalog = new Map(docs.map((d) => [d.id, { category: d.category ?? "" }]))
    catalog.set("Network--TLS", { category: "Network" })

    const result = resolveWikiTarget("TLS 협상", index, {
      sourceCategory: "Frontend",
      catalog,
    })
    expect(result).toBe("Frontend--TLS")
  })

  it("동명 충돌: 카테고리 힌트 없으면 onAmbiguous 호출 후 첫 매치", () => {
    const index = buildDocIndex(docs)
    const ambiguous: string[] = []
    const result = resolveWikiTarget("TLS 협상", index, {
      onAmbiguous: (target) => ambiguous.push(target),
    })
    expect(ambiguous).toContain("TLS 협상")
    expect(result).not.toBeNull()
  })

  it("매치 실패 → null", () => {
    const index = buildDocIndex(docs)
    expect(resolveWikiTarget("존재하지 않는 문서", index)).toBeNull()
  })

  it("빈 target → null", () => {
    const index = buildDocIndex(docs)
    expect(resolveWikiTarget("", index)).toBeNull()
    expect(resolveWikiTarget("   ", index)).toBeNull()
  })
})
