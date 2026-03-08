import { describe, expect, it } from "vitest"
import {
  buildCompanyProjectsByCompanyId,
  type CompanyProjectSource,
} from "@/lib/experience/company-projects"

const MOCK_PROJECTS: CompanyProjectSource[] = [
  {
    id: "project-priority-2",
    data: {
      companyId: "exem",
      title: "Z Project",
      priority: 2,
      dateStart: new Date("2025-01-01"),
      summary: "z-summary",
      accomplishments: ["z-1"],
    },
  },
  {
    id: "project-priority-1-latest-b",
    data: {
      companyId: "exem",
      title: "B Project",
      priority: 1,
      dateStart: new Date("2025-05-01"),
      summary: "b-summary",
      accomplishments: ["b-1"],
    },
  },
  {
    id: "project-priority-1-latest-a",
    data: {
      companyId: "exem",
      title: "A Project",
      priority: 1,
      dateStart: new Date("2025-05-01"),
      summary: "a-summary",
      accomplishments: ["a-1", "a-2"],
    },
  },
  {
    id: "project-priority-1-older",
    data: {
      companyId: "exem",
      title: "C Project",
      priority: 1,
      dateStart: new Date("2024-12-01"),
      summary: "c-summary",
      accomplishments: ["c-1"],
    },
  },
  {
    id: "project-kmong",
    data: {
      companyId: "kmong",
      title: "Freelance Project",
      priority: 1,
      dateStart: new Date("2023-07-01"),
      summary: "kmong-summary",
      accomplishments: ["kmong-1"],
    },
  },
]

describe("buildCompanyProjectsByCompanyId", () => {
  it("companyId 기준으로 그룹화하고 priority/dateStart/title 순으로 정렬한다", () => {
    const grouped = buildCompanyProjectsByCompanyId(MOCK_PROJECTS)

    expect(grouped.get("exem")).toEqual([
      {
        projectId: "project-priority-1-latest-a",
        title: "A Project",
        summary: "a-summary",
        accomplishments: ["a-1", "a-2"],
      },
      {
        projectId: "project-priority-1-latest-b",
        title: "B Project",
        summary: "b-summary",
        accomplishments: ["b-1"],
      },
      {
        projectId: "project-priority-1-older",
        title: "C Project",
        summary: "c-summary",
        accomplishments: ["c-1"],
      },
      {
        projectId: "project-priority-2",
        title: "Z Project",
        summary: "z-summary",
        accomplishments: ["z-1"],
      },
    ])
    expect(grouped.get("kmong")).toEqual([
      {
        projectId: "project-kmong",
        title: "Freelance Project",
        summary: "kmong-summary",
        accomplishments: ["kmong-1"],
      },
    ])
  })

  it("companyId가 없는 프로젝트는 그룹에서 제외한다", () => {
    const grouped = buildCompanyProjectsByCompanyId([
      ...MOCK_PROJECTS,
      {
        id: "project-without-company-id",
        data: {
          title: "Orphan Project",
          priority: 1,
          dateStart: new Date("2025-01-01"),
          summary: "orphan-summary",
          accomplishments: ["orphan-1"],
        },
      },
    ])

    const allProjectIds = Array.from(grouped.values())
      .flat()
      .map((project) => project.projectId)

    expect(allProjectIds).not.toContain("project-without-company-id")
  })
})
