import {
  PORTFOLIO_SECTION_IDS,
  type PortfolioCaseContract,
  type ResumeItemContract,
  type ResumePortfolioMappingEntry,
} from "./contracts"

export interface ValidateResumePortfolioMappingInput {
  resumeItems?: readonly ResumeItemContract[]
  resumeItemIds?: readonly string[]
  mappings: readonly ResumePortfolioMappingEntry[]
  cases: readonly PortfolioCaseContract[]
}

export interface ValidateResumePortfolioMappingResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

function pushUnique(items: string[], message: string) {
  if (!items.includes(message)) {
    items.push(message)
  }
}

function normalizeResumeItems(input: ValidateResumePortfolioMappingInput): ResumeItemContract[] {
  if (input.resumeItems && input.resumeItems.length > 0) {
    return input.resumeItems.map((item) => ({ ...item }))
  }

  if (input.resumeItemIds && input.resumeItemIds.length > 0) {
    return input.resumeItemIds.map((resumeItemId) => ({
      resumeItemId,
      hasPortfolio: true,
    }))
  }

  return []
}

export function validateResumePortfolioMapping(
  input: ValidateResumePortfolioMappingInput
): ValidateResumePortfolioMappingResult {
  const errors: string[] = []
  const warnings: string[] = []

  const resumeItems = normalizeResumeItems(input)
  if (resumeItems.length === 0) {
    pushUnique(errors, "검증 대상 resume item이 없습니다.")
    return { isValid: false, errors, warnings }
  }

  const resumeItemIdSet = new Set(resumeItems.map((item) => item.resumeItemId))
  const requiredResumeItemIdSet = new Set(
    resumeItems.filter((item) => item.hasPortfolio).map((item) => item.resumeItemId)
  )
  const optionalResumeItemIdSet = new Set(
    resumeItems.filter((item) => !item.hasPortfolio).map((item) => item.resumeItemId)
  )
  const caseIdSet = new Set(input.cases.map((item) => item.caseId))
  const sectionIdSet = new Set(PORTFOLIO_SECTION_IDS)

  const resumeItemCount = new Map<string, number>()
  const caseCount = new Map<string, number>()
  const mappedResumeItemIds = new Set<string>()
  const mappedCaseIds = new Set<string>()

  for (const mapping of input.mappings) {
    resumeItemCount.set(mapping.resumeItemId, (resumeItemCount.get(mapping.resumeItemId) ?? 0) + 1)
    caseCount.set(mapping.portfolioCaseId, (caseCount.get(mapping.portfolioCaseId) ?? 0) + 1)

    mappedResumeItemIds.add(mapping.resumeItemId)
    mappedCaseIds.add(mapping.portfolioCaseId)

    if (!resumeItemIdSet.has(mapping.resumeItemId)) {
      pushUnique(
        errors,
        `알 수 없는 resumeItemId가 매핑에 포함되어 있습니다: ${mapping.resumeItemId}`
      )
    }

    if (!caseIdSet.has(mapping.portfolioCaseId)) {
      pushUnique(
        errors,
        `알 수 없는 portfolioCaseId가 매핑에 포함되어 있습니다: ${mapping.portfolioCaseId}`
      )
    }

    if (!sectionIdSet.has(mapping.defaultSectionId)) {
      pushUnique(
        errors,
        `허용되지 않은 sectionId가 매핑에 포함되어 있습니다: ${mapping.defaultSectionId}`
      )
    }
  }

  for (const [resumeItemId, count] of resumeItemCount) {
    if (count > 1) {
      pushUnique(errors, `resumeItemId가 중복 매핑되었습니다: ${resumeItemId} (${count}회)`)
    }
  }

  for (const [caseId, count] of caseCount) {
    if (count > 1) {
      pushUnique(errors, `portfolioCaseId가 중복 매핑되었습니다: ${caseId} (${count}회)`)
    }
  }

  for (const resumeItemId of requiredResumeItemIdSet) {
    if (!mappedResumeItemIds.has(resumeItemId)) {
      pushUnique(errors, `매핑이 누락된 resumeItemId가 있습니다: ${resumeItemId}`)
    }
  }

  for (const resumeItemId of optionalResumeItemIdSet) {
    if (!mappedResumeItemIds.has(resumeItemId)) {
      pushUnique(warnings, `선택 매핑 항목이 누락되었습니다: ${resumeItemId}`)
    }
  }

  for (const caseId of caseIdSet) {
    if (!mappedCaseIds.has(caseId)) {
      pushUnique(warnings, `매핑되지 않은 portfolioCaseId가 있습니다: ${caseId}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
