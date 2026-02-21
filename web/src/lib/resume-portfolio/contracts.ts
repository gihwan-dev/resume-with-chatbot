export const PORTFOLIO_SECTION_IDS = [
  "overview",
  "problem",
  "decision",
  "result",
  "retrospective",
] as const

export type PortfolioSectionId = (typeof PORTFOLIO_SECTION_IDS)[number]

export interface PortfolioAnchor {
  caseId: string
  sectionId: PortfolioSectionId
}

export interface ImpactMetric {
  label: string
  value: string
  unit?: string
  context?: string
}

export interface ResumeSummaryBlock {
  resumeItemId: string
  title: string
  summary: string
  hasPortfolio: boolean
  technologies: string[]
  impactMetrics: ImpactMetric[]
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
