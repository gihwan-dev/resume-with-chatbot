export interface CompanyProjectSource {
  id: string
  data: {
    companyId: string
    title: string
    priority: number
    dateStart: Date
  }
}

export interface CompanyProjectItem {
  projectId: string
  title: string
  href?: string
}

interface BuildCompanyProjectsOptions {
  hrefByProjectId?: ReadonlyMap<string, string>
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
  projects: readonly CompanyProjectSource[],
  options: BuildCompanyProjectsOptions = {}
): Map<string, CompanyProjectItem[]> {
  const { hrefByProjectId } = options
  const grouped = new Map<string, CompanyProjectSource[]>()

  for (const project of projects) {
    const companyProjects = grouped.get(project.data.companyId)
    if (companyProjects) {
      companyProjects.push(project)
      continue
    }
    grouped.set(project.data.companyId, [project])
  }

  const mapped = new Map<string, CompanyProjectItem[]>()

  for (const [companyId, companyProjects] of grouped) {
    const sorted = [...companyProjects].sort(compareCompanyProjects)
    const items = sorted.map((project) => {
      const href = hrefByProjectId?.get(project.id)
      return {
        projectId: project.id,
        title: project.data.title,
        href,
      }
    })

    mapped.set(companyId, items)
  }

  return mapped
}
