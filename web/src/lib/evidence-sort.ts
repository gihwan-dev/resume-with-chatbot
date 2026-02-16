export type EvidenceSection = "project" | "career" | "tech_stack" | "other"

const SECTION_PRIORITY: Record<EvidenceSection, number> = {
  project: 0,
  career: 1,
  tech_stack: 2,
  other: 3,
}

const PROJECT_KEYWORDS = [
  "project",
  "projects",
  "프로젝트",
  "대시보드",
  "dashboard",
  "위젯",
  "widget",
  "01-projects",
]

const CAREER_KEYWORDS = [
  "career",
  "experience",
  "work",
  "경력",
  "업무",
  "이력",
  "회사",
  "담당",
  "role",
  "02-daily",
]

const TECH_STACK_KEYWORDS = [
  "tech",
  "stack",
  "기술",
  "typescript",
  "javascript",
  "react",
  "astro",
  "next",
  "ssr",
  "serverless",
  "접근성",
  "wcag",
  "디자인 시스템",
  "디자인시스템",
  "design system",
  "design-system",
  "컴포넌트",
  "프레임워크",
]

interface EvidenceSource {
  id?: string
  title: string
  type?: string
}

function normalize(text?: string): string {
  return (text ?? "").toLowerCase()
}

function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword))
}

export function inferEvidenceSection(source: EvidenceSource): EvidenceSection {
  const corpus = `${normalize(source.title)} ${normalize(source.id)}`

  if (includesAny(corpus, PROJECT_KEYWORDS)) return "project"
  if (includesAny(corpus, CAREER_KEYWORDS)) return "career"
  if (includesAny(corpus, TECH_STACK_KEYWORDS)) return "tech_stack"

  if (source.type === "resume") return "career"
  return "other"
}

export function sortSourcesBySection<T extends EvidenceSource>(sources: T[]): T[] {
  // Keep existing order inside each section by comparing original index.
  return sources
    .map((source, index) => ({
      source,
      index,
      section: inferEvidenceSection(source),
    }))
    .sort((a, b) => {
      const priorityDiff = SECTION_PRIORITY[a.section] - SECTION_PRIORITY[b.section]
      if (priorityDiff !== 0) return priorityDiff
      return a.index - b.index
    })
    .map((item) => item.source)
}
