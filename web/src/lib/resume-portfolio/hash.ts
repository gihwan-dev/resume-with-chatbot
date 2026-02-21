import { PORTFOLIO_SECTION_IDS, type PortfolioAnchor, type PortfolioSectionId } from "./contracts"

const CASE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SECTION_ID_SET = new Set<PortfolioSectionId>(PORTFOLIO_SECTION_IDS)

function normalizeCaseId(caseId: string): string {
  const normalizedCaseId = caseId.trim().toLowerCase()

  if (!CASE_ID_PATTERN.test(normalizedCaseId)) {
    throw new Error(`Invalid caseId format: ${caseId}`)
  }

  return normalizedCaseId
}

export function buildPortfolioCtaHref(caseId: string, sectionId: PortfolioSectionId): string {
  const normalizedCaseId = normalizeCaseId(caseId)
  return `/portfolio/${normalizedCaseId}#${sectionId}`
}

export function parsePortfolioCtaHref(href: string): PortfolioAnchor | null {
  const raw = href.trim()
  const match = raw.match(/^\/portfolio\/([^/#?]+)#([^#/?]+)$/)
  if (!match) return null

  const [, caseId, sectionId] = match

  if (!caseId || !sectionId) return null

  const normalizedCaseId = caseId.trim().toLowerCase()
  const normalizedSectionId = sectionId.trim().toLowerCase() as PortfolioSectionId

  if (!CASE_ID_PATTERN.test(normalizedCaseId)) return null
  if (!SECTION_ID_SET.has(normalizedSectionId)) return null

  return {
    caseId: normalizedCaseId,
    sectionId: normalizedSectionId,
  }
}

// Backward-compatible aliases kept for existing call sites and tests.
export function buildPortfolioPath(caseId: string, sectionId: PortfolioSectionId): string {
  const normalizedCaseId = normalizeCaseId(caseId)
  return `/${normalizedCaseId}#${sectionId}`
}

export function parsePortfolioPath(pathAndHash: string): PortfolioAnchor | null {
  const raw = pathAndHash.trim()
  const match = raw.match(/\/?([^#]+)#(.*)/)
  if (!match) return null

  const [, caseId, sectionId] = match
  if (!caseId || !sectionId) return null

  const normalizedCaseId = caseId.trim().toLowerCase()
  const normalizedSectionId = sectionId.trim().toLowerCase() as PortfolioSectionId

  if (!CASE_ID_PATTERN.test(normalizedCaseId)) return null
  if (!SECTION_ID_SET.has(normalizedSectionId)) return null

  return {
    caseId: normalizedCaseId,
    sectionId: normalizedSectionId,
  }
}
