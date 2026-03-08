import { beforeAll, describe, expect, it } from "vitest"

let extractVaultDateMeta: (
  content: string,
  relativePath: string
) => {
  eventDate?: string
  updatedAt?: string
}

beforeAll(async () => {
  const modulePath = "../../../scripts/vault-date-utils.mjs"
  const module = (await import(modulePath)) as {
    extractVaultDateMeta: typeof extractVaultDateMeta
  }
  extractVaultDateMeta = module.extractVaultDateMeta
})

describe("extractVaultDateMeta", () => {
  it("frontmatter date를 eventDate로 우선 사용", () => {
    const markdown = `---
date: 2026-03-01
updated: 2026-03-03
---

본문`
    const result = extractVaultDateMeta(markdown, "Exem/2026-03-04-note.md")
    expect(result).toEqual({
      eventDate: "2026-03-01",
      updatedAt: "2026-03-03",
    })
  })

  it("date가 없으면 updated를 fallback으로 사용", () => {
    const markdown = `---
updated: 2026-03-07
---

본문`
    const result = extractVaultDateMeta(markdown, "Exem/note.md")
    expect(result).toEqual({
      eventDate: "2026-03-07",
      updatedAt: "2026-03-07",
    })
  })

  it("frontmatter에 날짜가 없으면 경로 날짜를 사용", () => {
    const markdown = "본문"
    const result = extractVaultDateMeta(markdown, "Exem/Daily/2026-02-28.md")
    expect(result).toEqual({
      eventDate: "2026-02-28",
      updatedAt: "2026-02-28",
    })
  })

  it("유효한 날짜가 없으면 undefined 반환", () => {
    const markdown = `---
date: invalid-date
---

본문`
    const result = extractVaultDateMeta(markdown, "Exem/Daily/note.md")
    expect(result).toEqual({
      eventDate: undefined,
      updatedAt: undefined,
    })
  })

  it("timezone offset이 있는 datetime도 원본 날짜를 유지한다", () => {
    const markdown = `---
date: 2026-03-01T00:30:00+09:00
updated: 2026-03-02T23:45:00+09:00
---

본문`
    const result = extractVaultDateMeta(markdown, "Exem/Daily/note.md")
    expect(result).toEqual({
      eventDate: "2026-03-01",
      updatedAt: "2026-03-02",
    })
  })
})
