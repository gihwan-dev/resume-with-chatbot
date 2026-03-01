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

export interface DecisionItem {
  title: string
  whyThisChoice: string
  alternative: string
  tradeOff: string
}

export interface ValidationImpact {
  measurementMethod: string
  metrics: string[]
  operationalImpact: string
}

export interface ProjectStoryThread {
  tldrSummary: string
  keyMetrics: ImpactItem[]
  coreApproach: string
  problemDefinition: string
  problemPoints: string[]
  decisions: DecisionItem[]
  implementationHighlights: string[]
  validationImpact: ValidationImpact
  lessonsLearned: string
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
