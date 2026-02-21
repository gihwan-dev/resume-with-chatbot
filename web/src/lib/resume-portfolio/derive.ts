import { RESUME_PORTFOLIO_CONTENT_V2 } from "./content"
import type {
  PortfolioCaseContract,
  ResumeItemContract,
  ResumePortfolioContentItem,
  ResumePortfolioMappingEntry,
  ResumeSummaryBlock,
} from "./contracts"
import { buildPortfolioCtaHref } from "./hash"

type ProjectEntryLike = {
  id: string
  data: {
    title: string
    techStack: readonly string[]
  }
}

export interface ResumePortfolioContracts<TProjectEntry extends ProjectEntryLike> {
  resumeItems: ResumeItemContract[]
  summaryBlocks: ResumeSummaryBlock[]
  mappings: ResumePortfolioMappingEntry[]
  cases: PortfolioCaseContract[]
  projectByCaseId: Map<string, TProjectEntry>
}

function assertNoDuplicates(items: readonly string[], label: string) {
  const seen = new Set<string>()
  for (const item of items) {
    if (seen.has(item)) {
      throw new Error(`Duplicate ${label} in resume portfolio content: ${item}`)
    }
    seen.add(item)
  }
}

function validateEvidenceIds(item: ResumePortfolioContentItem) {
  if (!item.hasPortfolio) return

  if (item.evidenceIds.length === 0) {
    throw new Error(`Evidence IDs are required for hasPortfolio=true: ${item.resumeItemId}`)
  }

  const normalized = item.evidenceIds.map((evidenceId) => evidenceId.trim()).filter(Boolean)
  if (normalized.length !== item.evidenceIds.length) {
    throw new Error(`Empty evidence ID is not allowed: ${item.resumeItemId}`)
  }

  assertNoDuplicates(normalized, `evidenceIds for ${item.resumeItemId}`)
}

function validateSectionContract(item: ResumePortfolioContentItem) {
  if (!item.sections.includes(item.defaultSectionId)) {
    throw new Error(
      `defaultSectionId must be included in sections: ${item.resumeItemId} (${item.defaultSectionId})`
    )
  }
}

export function buildResumePortfolioContracts<TProjectEntry extends ProjectEntryLike>(
  projectEntries: readonly TProjectEntry[],
  contentItems: readonly ResumePortfolioContentItem[] = RESUME_PORTFOLIO_CONTENT_V2
): ResumePortfolioContracts<TProjectEntry> {
  const projectById = new Map(projectEntries.map((project) => [project.id, project]))

  assertNoDuplicates(
    contentItems.map((item) => item.projectId),
    "projectId"
  )
  assertNoDuplicates(
    contentItems.map((item) => item.resumeItemId),
    "resumeItemId"
  )

  const resumeItems: ResumeItemContract[] = []
  const summaryBlocks: ResumeSummaryBlock[] = []
  const mappings: ResumePortfolioMappingEntry[] = []
  const cases: PortfolioCaseContract[] = []
  const projectByCaseId = new Map<string, TProjectEntry>()

  for (const item of contentItems) {
    validateEvidenceIds(item)
    validateSectionContract(item)

    const project = projectById.get(item.projectId)
    if (!project) {
      throw new Error(`Missing project content entry for projectId: ${item.projectId}`)
    }

    resumeItems.push({
      resumeItemId: item.resumeItemId,
      hasPortfolio: item.hasPortfolio,
    })

    summaryBlocks.push({
      resumeItemId: item.resumeItemId,
      title: project.data.title,
      summary: item.resumeSummary,
      hasPortfolio: item.hasPortfolio,
      technologies: [...project.data.techStack],
      accomplishments: [...item.accomplishments],
      evidenceIds: [...item.evidenceIds],
      ctaLabel: item.hasPortfolio ? item.ctaLabel : undefined,
      ctaHref: item.hasPortfolio
        ? buildPortfolioCtaHref(item.projectId, item.defaultSectionId)
        : undefined,
    })

    if (!item.hasPortfolio) continue

    mappings.push({
      resumeItemId: item.resumeItemId,
      portfolioCaseId: item.projectId,
      defaultSectionId: item.defaultSectionId,
    })

    cases.push({
      caseId: item.projectId,
      routePath: "/portfolio",
      title: project.data.title,
      sections: [...item.sections],
      ctaLabel: item.ctaLabel,
    })

    projectByCaseId.set(item.projectId, project)
  }

  return {
    resumeItems,
    summaryBlocks,
    mappings,
    cases,
    projectByCaseId,
  }
}
