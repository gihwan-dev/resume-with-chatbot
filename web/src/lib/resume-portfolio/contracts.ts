export const PORTFOLIO_SECTION_IDS = ["hook", "context", "threads", "retrospective"] as const

export type PortfolioSectionId = (typeof PORTFOLIO_SECTION_IDS)[number]

export interface ImpactItem {
  value: string
  label: string
  description: string
}

export interface StoryThreadComparison {
  beforeLabel?: string
  afterLabel?: string
  before: string[]
  after: string[]
}

export interface StoryThreadItem {
  issueTitle: string
  problems: string[]
  thoughtProcess: string
  actions: string[]
  tradeOff?: string
  comparison?: StoryThreadComparison
  result: string
}

export interface ProjectStoryThread {
  context: string
  architectureSummary?: string
  measurementMethod?: string
  impacts: ImpactItem[]
  threads: StoryThreadItem[]
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
  evidenceIds: string[]
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
  evidenceIds: string[]
}
