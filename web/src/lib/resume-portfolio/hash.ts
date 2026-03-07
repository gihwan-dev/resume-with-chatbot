import type { PortfolioAnchor } from "./contracts"

const CASE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function normalizeCaseId(caseId: string): string {
  const normalizedCaseId = caseId.trim().toLowerCase()

  if (!CASE_ID_PATTERN.test(normalizedCaseId)) {
    throw new Error(`Invalid caseId format: ${caseId}`)
  }

  return normalizedCaseId
}

function normalizeSectionId(sectionId: string): string | null {
  const normalizedSectionId = sectionId.trim().toLowerCase()
  return normalizedSectionId.length > 0 ? normalizedSectionId : null
}

export function buildPortfolioCtaHref(caseId: string, sectionId: string): string {
  const normalizedCaseId = normalizeCaseId(caseId)
  const normalizedSectionId = normalizeSectionId(sectionId)
  if (!normalizedSectionId) {
    throw new Error(`Invalid sectionId format: ${sectionId}`)
  }
  return `/portfolio/${normalizedCaseId}#${normalizedSectionId}`
}

export function parsePortfolioCtaHref(href: string): PortfolioAnchor | null {
  const raw = href.trim()
  const match = raw.match(/^\/portfolio\/([^/#?]+)#([^#/?]+)$/)
  if (!match) return null

  const [, caseId, sectionId] = match

  if (!caseId || !sectionId) return null

  const normalizedCaseId = caseId.trim().toLowerCase()
  const normalizedSectionId = normalizeSectionId(sectionId)

  if (!CASE_ID_PATTERN.test(normalizedCaseId)) return null
  if (!normalizedSectionId) return null

  return {
    caseId: normalizedCaseId,
    sectionId: normalizedSectionId,
  }
}

// Backward-compatible aliases kept for existing call sites and tests.
export function buildPortfolioPath(caseId: string, sectionId: string): string {
  const normalizedCaseId = normalizeCaseId(caseId)
  const normalizedSectionId = normalizeSectionId(sectionId)
  if (!normalizedSectionId) {
    throw new Error(`Invalid sectionId format: ${sectionId}`)
  }
  return `/${normalizedCaseId}#${normalizedSectionId}`
}

export function parsePortfolioPath(pathAndHash: string): PortfolioAnchor | null {
  const raw = pathAndHash.trim()
  const match = raw.match(/\/?([^#]+)#(.*)/)
  if (!match) return null

  const [, caseId, sectionId] = match
  if (!caseId || !sectionId) return null

  const normalizedCaseId = caseId.trim().toLowerCase()
  const normalizedSectionId = normalizeSectionId(sectionId)

  if (!CASE_ID_PATTERN.test(normalizedCaseId)) return null
  if (!normalizedSectionId) return null

  return {
    caseId: normalizedCaseId,
    sectionId: normalizedSectionId,
  }
}
