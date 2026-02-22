import type { CollectionEntry } from "astro:content"
import { describe, expect, it } from "vitest"
import {
  inferCompanyIdFromProjectId,
  resolveProjectCompanyId,
  resolveWorkCompanyId,
} from "@/lib/experience/company-id"

describe("resolveWorkCompanyId", () => {
  it("work.data.companyId가 있으면 해당 값을 사용한다", () => {
    const workEntry = {
      id: "kmong",
      data: { companyId: "kmong" },
    } as unknown as CollectionEntry<"work">

    expect(resolveWorkCompanyId(workEntry)).toBe("kmong")
  })

  it("work.data.companyId가 없으면 entry.id를 fallback으로 사용한다", () => {
    const workEntry = {
      id: "kmong",
      data: {},
    } as unknown as CollectionEntry<"work">

    expect(resolveWorkCompanyId(workEntry)).toBe("kmong")
  })
})

describe("inferCompanyIdFromProjectId", () => {
  it("project id prefix로 회사 ID를 추론한다", () => {
    expect(inferCompanyIdFromProjectId("exem-customer-dashboard", ["exem", "kmong"])).toBe(
      "exem"
    )
  })

  it("여러 prefix가 매칭되면 가장 긴 회사 ID를 우선한다", () => {
    expect(inferCompanyIdFromProjectId("foo-bar-admin", ["foo", "foo-bar"])).toBe("foo-bar")
  })
})

describe("resolveProjectCompanyId", () => {
  it("project.data.companyId가 없으면 knownCompanyIds 기반 추론을 사용한다", () => {
    const projectEntry = {
      id: "exem-data-grid",
      data: {},
    } as unknown as CollectionEntry<"projects">

    expect(resolveProjectCompanyId(projectEntry, ["exem", "kmong"])).toBe("exem")
  })

  it("추론이 불가능하면 null을 반환한다", () => {
    const projectEntry = {
      id: "unknown-project",
      data: {},
    } as unknown as CollectionEntry<"projects">

    expect(resolveProjectCompanyId(projectEntry, ["exem", "kmong"])).toBeNull()
  })
})
