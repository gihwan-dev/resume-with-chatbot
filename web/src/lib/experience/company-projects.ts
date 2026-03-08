export interface CompanyProjectSource {
  id: string
  data: {
    companyId?: string
    title: string
    priority: number
    dateStart: Date
    summary: string
    accomplishments: string[]
  }
}

export interface CompanyProjectItem {
  projectId: string
  title: string
  summary: string
  accomplishments: string[]
}

function compareCompanyProjects(a: CompanyProjectSource, b: CompanyProjectSource): number {
  if (a.data.priority !== b.data.priority) {
    return a.data.priority - b.data.priority
  }

  const startTimeDiff = b.data.dateStart.getTime() - a.data.dateStart.getTime()
  if (startTimeDiff !== 0) {
    return startTimeDiff
  }

  return a.data.title.localeCompare(b.data.title)
}

export function buildCompanyProjectsByCompanyId(
  projects: readonly CompanyProjectSource[]
): Map<string, CompanyProjectItem[]> {
  const grouped = new Map<string, CompanyProjectSource[]>()

  for (const project of projects) {
    const companyId = project.data.companyId
    if (!companyId) continue

    const companyProjects = grouped.get(companyId)
    if (companyProjects) {
      companyProjects.push(project)
      continue
    }
    grouped.set(companyId, [project])
  }

  const mapped = new Map<string, CompanyProjectItem[]>()

  for (const [companyId, companyProjects] of grouped) {
    const sorted = [...companyProjects].sort(compareCompanyProjects)
    const items = sorted.map((project) => ({
      projectId: project.id,
      title: project.data.title,
      summary: project.data.summary,
      accomplishments: [...project.data.accomplishments],
    }))

    mapped.set(companyId, items)
  }

  return mapped
}
