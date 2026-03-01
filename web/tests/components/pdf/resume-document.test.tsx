import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ResumeDocument } from "@/components/pdf/resume-document"
import type { SerializedResumeData } from "@/lib/pdf/types"

const { viewWrapValues } = vi.hoisted(() => ({
  viewWrapValues: [] as Array<boolean | undefined>,
}))

vi.mock("@react-pdf/renderer", async () => {
  const React = await vi.importActual<typeof import("react")>("react")

  const createRendererElement = (tag: "div" | "span" | "a") => {
    return ({
      children,
      render,
      src,
    }: {
      children?: ReactNode
      render?: (params: { pageNumber: number; totalPages: number }) => string
      src?: string
    }) => {
      const resolvedChildren = render ? render({ pageNumber: 1, totalPages: 1 }) : children
      if (tag === "a") {
        return React.createElement("a", { href: src }, resolvedChildren)
      }
      return React.createElement(tag, null, resolvedChildren)
    }
  }

  const View = ({
    children,
    render,
    wrap,
  }: {
    children?: ReactNode
    render?: (params: { pageNumber: number; totalPages: number }) => string
    wrap?: boolean
  }) => {
    viewWrapValues.push(wrap)
    const resolvedChildren = render ? render({ pageNumber: 1, totalPages: 1 }) : children
    return React.createElement("div", null, resolvedChildren)
  }

  return {
    Document: createRendererElement("div"),
    Link: createRendererElement("a"),
    Page: createRendererElement("div"),
    StyleSheet: {
      create: <T extends Record<string, unknown>>(styleMap: T) => styleMap,
    },
    Text: createRendererElement("span"),
    View,
  }
})

vi.mock("@/lib/pdf/markdown-to-pdf", () => ({
  markdownInlineToPdf: (markdown: string) => markdown,
  markdownToPdf: (markdown: string) => markdown,
}))

function createMockResumeData(): SerializedResumeData {
  return {
    profile: {
      name: "최기환",
      label: "Frontend Engineer",
      email: "test@example.com",
      summary: "profile summary",
      profiles: [],
    },
    work: [
      {
        company: "Exem",
        role: "Frontend Engineer",
        dateStart: "2024-11-01T00:00:00.000Z",
        isCurrent: true,
        projectCases: [
          {
            projectId: "exem-customer-dashboard",
            title: "인스턴스 통합 모니터링 대시보드 개발",
            summary: "중앙 폴링 아키텍처로 병목을 줄였습니다.",
            accomplishments: ["인지 시간 단축", "인터랙션 지연 개선"],
            measurementMethod: "React Profiler 동일 시나리오 30회 평균",
            tradeOffs: ["초기 구현 복잡도는 증가했지만 운영 일관성을 확보했습니다."],
          },
        ],
        projectTitles: ["매핑 누락 프로젝트"],
        highlights: [],
      },
      {
        company: "Kmong",
        role: "Freelancer",
        dateStart: "2023-06-01T00:00:00.000Z",
        dateEnd: "2023-12-01T00:00:00.000Z",
        isCurrent: false,
        projectTitles: [],
        highlights: ["프로젝트 전 과정을 단독 수행했습니다."],
      },
    ],
    projects: [
      {
        resumeItemId: "project-hidden",
        title: "숨김 프로젝트",
        summary: "이 항목은 PDF에서 노출되지 않아야 합니다.",
        hasPortfolio: false,
        technologies: [],
        accomplishments: [],
      },
    ],
    blogPosts: [
      {
        title: "리액트 성능 최적화 글",
        url: "https://example.com/post",
        publishedAt: "2026-01-11T08:17:53.000Z",
      },
    ],
    education: [
      {
        institution: "숨김 대학",
        area: "Computer Science",
        studyType: "Bachelor",
        dateStart: "2018-03-01T00:00:00.000Z",
      },
    ],
    certificates: [
      {
        name: "AWS SAA",
        issuer: "AWS",
        date: "2025-01-01T00:00:00.000Z",
      },
    ],
    awards: [
      {
        title: "우수 개발자상",
        issuer: "Exem",
        date: "2025-02-01T00:00:00.000Z",
      },
    ],
    skills: [
      {
        name: "Frontend",
        items: ["React", "TypeScript"],
      },
    ],
  }
}

describe("ResumeDocument", () => {
  beforeEach(() => {
    viewWrapValues.length = 0
  })

  it("섹션 순서를 profile -> experience -> technical writing -> awards -> certificates -> skills로 렌더링한다", () => {
    const { container } = render(<ResumeDocument data={createMockResumeData()} />)
    const text = container.textContent ?? ""

    expect(text).toContain("Measurement:")
    expect(text).toContain("Trade-off:")
    expect(text).toContain("매핑 누락 프로젝트")
    expect(text).toContain("프로젝트 전 과정을 단독 수행했습니다.")

    const expectedOrder = [
      "최기환",
      "Experience",
      "Technical Writing",
      "Awards",
      "Certificates",
      "Skills",
    ]

    let previousIndex = -1
    for (const sectionLabel of expectedOrder) {
      const sectionIndex = text.indexOf(sectionLabel)
      expect(sectionIndex).toBeGreaterThan(previousIndex)
      previousIndex = sectionIndex
    }
  })

  it("Projects/Education 섹션을 렌더링하지 않는다", () => {
    const { container } = render(<ResumeDocument data={createMockResumeData()} />)
    const text = container.textContent ?? ""

    expect(text).not.toContain("Projects")
    expect(text).not.toContain("Education")
    expect(text).not.toContain("숨김 프로젝트")
    expect(text).not.toContain("숨김 대학")
  })

  it("부분 매핑에서도 unmatched projectTitles fallback을 함께 렌더링한다", () => {
    const data = createMockResumeData()
    data.work[1] = {
      company: "Example Team",
      role: "Frontend Engineer",
      dateStart: "2024-01-01T00:00:00.000Z",
      isCurrent: true,
      projectCases: [
        {
          projectId: "example-case",
          title: "핵심 케이스",
          summary: "핵심 케이스 요약",
          accomplishments: ["핵심 성과 1"],
        },
      ],
      projectTitles: ["케이스 미매핑 프로젝트"],
      highlights: ["하이라이트 fallback 노출"],
    }

    const { container } = render(<ResumeDocument data={data} />)
    const text = container.textContent ?? ""

    expect(text).toContain("매핑 누락 프로젝트")
    expect(text).toContain("케이스 미매핑 프로젝트")
  })

  it("동명 프로젝트여도 fallback title이 누락되지 않는다", () => {
    const data = createMockResumeData()
    data.work[0].projectTitles = ["인스턴스 통합 모니터링 대시보드 개발"]

    render(<ResumeDocument data={data} />)

    expect(screen.getAllByText("인스턴스 통합 모니터링 대시보드 개발")).toHaveLength(2)
  })

  it("Experience 렌더에서 wrap=false를 사용하지 않아 페이지 분할을 허용한다", () => {
    const data = createMockResumeData()
    data.blogPosts = []
    data.certificates = []
    data.awards = []
    data.skills = []

    render(<ResumeDocument data={data} />)

    expect(viewWrapValues).not.toContain(false)
  })
})
