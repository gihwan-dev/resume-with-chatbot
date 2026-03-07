export interface PortfolioSectionDefinition {
  id: string
  heading: string
  legacyAliases?: string[]
}

export interface ImpactItem {
  value: string
  label: string
  description: string
}

export interface PortfolioAnchor {
  caseId: string
  sectionId: string
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
  defaultSectionId: string
}

export interface ResumeItemContract {
  resumeItemId: string
  hasPortfolio: boolean
}

export interface PortfolioCaseContract {
  caseId: string
  routePath: "/portfolio"
  title: string
  sections: PortfolioSectionDefinition[]
  ctaLabel: string
}

export interface ResumePortfolioContentItem {
  projectId: string
  resumeItemId: string
  resumeSummary: string
  accomplishments: string[]
  hasPortfolio: boolean
  ctaLabel: string
  defaultSectionId: string
  sections: PortfolioSectionDefinition[]
}
