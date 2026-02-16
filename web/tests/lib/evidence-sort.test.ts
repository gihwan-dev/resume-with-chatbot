import { describe, expect, it } from "vitest"
import { inferEvidenceSection, sortSourcesBySection } from "../../src/lib/evidence-sort"

describe("evidence-sort", () => {
  describe("inferEvidenceSection", () => {
    it("프로젝트 근거를 project로 분류한다", () => {
      const section = inferEvidenceSection({
        type: "obsidian",
        title: "위젯 빌더 개선",
        id: "Exem--01-Projects--차세대-대시보드--위젯빌더",
      })

      expect(section).toBe("project")
    })

    it("경력/업무 근거를 career로 분류한다", () => {
      const section = inferEvidenceSection({
        type: "obsidian",
        title: "업무 경험 회고",
        id: "Exem--02-Daily--2026-02-13",
      })

      expect(section).toBe("career")
    })

    it("기술 스택 근거를 tech_stack으로 분류한다", () => {
      const section = inferEvidenceSection({
        type: "obsidian",
        title: "TypeScript strict 모드 적용",
        id: "Knowledge--TypeScript--strict-mode",
      })

      expect(section).toBe("tech_stack")
    })

    it("resume 타입은 기본적으로 career로 분류한다", () => {
      const section = inferEvidenceSection({
        type: "resume",
        title: "이력서 기본 정보",
      })

      expect(section).toBe("career")
    })

    it("매칭되지 않으면 other로 분류한다", () => {
      const section = inferEvidenceSection({
        type: "obsidian",
        title: "기타 참고 메모",
        id: "Misc--random-note",
      })

      expect(section).toBe("other")
    })
  })

  describe("sortSourcesBySection", () => {
    it("project -> career -> tech_stack -> other 순으로 정렬한다", () => {
      const sorted = sortSourcesBySection([
        { title: "TypeScript strict", id: "Knowledge--TypeScript--strict", type: "obsidian" },
        { title: "기타 메모", id: "Misc--memo", type: "obsidian" },
        { title: "프로젝트 개선", id: "Exem--01-Projects--widget", type: "obsidian" },
        { title: "업무 회고", id: "Exem--02-Daily--2026-02-13", type: "obsidian" },
      ])

      expect(sorted.map((source) => source.title)).toEqual([
        "프로젝트 개선",
        "업무 회고",
        "TypeScript strict",
        "기타 메모",
      ])
    })

    it("동일 섹션 안에서는 기존 순서를 유지한다", () => {
      const sorted = sortSourcesBySection([
        { title: "프로젝트 A", id: "Exem--01-Projects--a", type: "obsidian" },
        { title: "프로젝트 B", id: "Exem--01-Projects--b", type: "obsidian" },
        { title: "기술 C", id: "Knowledge--React--c", type: "obsidian" },
        { title: "기술 D", id: "Knowledge--TypeScript--d", type: "obsidian" },
      ])

      expect(sorted.map((source) => source.title)).toEqual([
        "프로젝트 A",
        "프로젝트 B",
        "기술 C",
        "기술 D",
      ])
    })
  })
})
