import { PORTFOLIO_SECTION_IDS, type PortfolioAnchor, type PortfolioSectionId } from "./contracts"

const CASE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SECTION_ID_SET = new Set<PortfolioSectionId>(PORTFOLIO_SECTION_IDS)

export function buildPortfolioHash(caseId: string, sectionId: PortfolioSectionId): string {
  const normalizedCaseId = caseId.trim().toLowerCase()

  if (!CASE_ID_PATTERN.test(normalizedCaseId)) {
    throw new Error(`Invalid caseId format: ${caseId}`)
  }

  return `#${normalizedCaseId}.${sectionId}`
}

export function parsePortfolioHash(hash: string): PortfolioAnchor | null {
  const raw = hash.trim()
  const normalizedHash = raw.startsWith("#") ? raw.slice(1) : raw

  if (!normalizedHash) return null

  const [caseId, sectionId, ...rest] = normalizedHash.split(".")
  if (rest.length > 0 || !caseId || !sectionId) return null

  const normalizedCaseId = caseId.trim().toLowerCase()
  const normalizedSectionId = sectionId.trim().toLowerCase() as PortfolioSectionId

  if (!CASE_ID_PATTERN.test(normalizedCaseId)) return null
  if (!SECTION_ID_SET.has(normalizedSectionId)) return null

  return {
    caseId: normalizedCaseId,
    sectionId: normalizedSectionId,
  }
}
