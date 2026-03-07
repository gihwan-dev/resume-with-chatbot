export const PORTFOLIO_SECTION_IDS = [
  "tldr",
  "problem-definition",
  "key-decisions",
  "implementation-highlights",
  "validation-impact",
  "learned",
] as const

export type PortfolioSectionId = (typeof PORTFOLIO_SECTION_IDS)[number]

export interface ImpactItem {
  value: string
  label: string
  description: string
}

export interface PortfolioAnchor {
  caseId: string
  sectionId: PortfolioSectionId
}

export interface ResumeSummaryBlock {
  resumeItemId: string
  title: string
  summary: string
  hasPortfolio: boolean
  technologies: string[]
  accomplishments: string[]
  ctaLabel?: string
  ctaHref?: string
}

export interface ResumePortfolioMappingEntry {
  resumeItemId: string
  portfolioCaseId: string
  defaultSectionId: PortfolioSectionId
}

export interface ResumeItemContract {
  resumeItemId: string
  hasPortfolio: boolean
}

export interface PortfolioCaseContract {
  caseId: string
  routePath: "/portfolio"
  title: string
  sections: PortfolioSectionId[]
  ctaLabel: string
}

export interface ResumePortfolioContentItem {
  projectId: string
  resumeItemId: string
  resumeSummary: string
  accomplishments: string[]
  hasPortfolio: boolean
  ctaLabel: string
  defaultSectionId: PortfolioSectionId
  sections: PortfolioSectionId[]
}
