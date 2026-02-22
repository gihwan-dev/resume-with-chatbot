import type { CollectionEntry } from "astro:content"

function normalizeCompanyId(companyId: string | null | undefined): string | null {
  const normalized = companyId?.trim()
  return normalized && normalized.length > 0 ? normalized : null
}

export function resolveWorkCompanyId(workEntry: CollectionEntry<"work">): string {
  const companyIdFromData = normalizeCompanyId((workEntry.data as { companyId?: string }).companyId)
  if (companyIdFromData) return companyIdFromData

  const companyIdFromEntryId = normalizeCompanyId(workEntry.id)
  if (companyIdFromEntryId) return companyIdFromEntryId

  throw new Error(`Unable to resolve companyId for work entry: ${workEntry.id}`)
}

export function inferCompanyIdFromProjectId(
  projectId: string,
  knownCompanyIds: readonly string[]
): string | null {
  const uniqueCompanyIds = [
    ...new Set(
      knownCompanyIds
        .map((companyId) => normalizeCompanyId(companyId))
        .filter((companyId): companyId is string => companyId !== null)
    ),
  ].sort((a, b) => b.length - a.length)

  for (const companyId of uniqueCompanyIds) {
    if (projectId === companyId || projectId.startsWith(`${companyId}-`)) {
      return companyId
    }
  }

  return null
}

export function resolveProjectCompanyId(
  projectEntry: CollectionEntry<"projects">,
  knownCompanyIds: readonly string[]
): string | null {
  const companyIdFromData = normalizeCompanyId(
    (projectEntry.data as { companyId?: string }).companyId
  )
  if (companyIdFromData) return companyIdFromData

  return inferCompanyIdFromProjectId(projectEntry.id, knownCompanyIds)
}
