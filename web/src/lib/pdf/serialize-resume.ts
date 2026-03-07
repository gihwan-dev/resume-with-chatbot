import { type CollectionEntry, getCollection } from "astro:content"
import { getObsidianBlogPosts } from "@/lib/blog/obsidian-publish"
import { resolveProjectCompanyId, resolveWorkCompanyId } from "@/lib/experience/company-id"
import {
  buildCompanyProjectsByCompanyId,
  type CompanyProjectSource,
} from "@/lib/experience/company-projects"
import { buildResumePortfolioContracts } from "@/lib/resume-portfolio/derive"
import type { SerializedResumeData } from "./types"

export async function serializeResumeData(): Promise<SerializedResumeData> {
  const [basics, work, projects, education, certificates, awards, skills, blogPosts]: [
    CollectionEntry<"basics">[],
    CollectionEntry<"work">[],
    CollectionEntry<"projects">[],
    CollectionEntry<"education">[],
    CollectionEntry<"certificates">[],
    CollectionEntry<"awards">[],
    CollectionEntry<"skills">[],
    Awaited<ReturnType<typeof getObsidianBlogPosts>>,
  ] = await Promise.all([
    getCollection("basics"),
    getCollection("work"),
    getCollection("projects"),
    getCollection("education"),
    getCollection("certificates"),
    getCollection("awards"),
    getCollection("skills"),
    getObsidianBlogPosts({ limit: 5 }),
  ])

  const profile = basics[0]?.data
  if (!profile) {
    throw new Error("Profile data is required in basics collection.")
  }

  const sortedWork = [...work].sort(
    (a, b) => b.data.dateStart.getTime() - a.data.dateStart.getTime()
  )
  const workWithCompanyId = sortedWork.map((entry) => ({
    entry,
    companyId: resolveWorkCompanyId(entry),
  }))
  const knownCompanyIds = workWithCompanyId.map((item) => item.companyId)
  const normalizedProjects: CompanyProjectSource[] = projects.flatMap((project) => {
    const companyId = resolveProjectCompanyId(project, knownCompanyIds)
    if (!companyId) return []

    return [
      {
        id: project.id,
        data: {
          companyId,
          title: project.data.title,
          priority: project.data.priority,
          dateStart: project.data.dateStart,
        },
      },
    ]
  })

  const { summaryBlocks, mappings } = buildResumePortfolioContracts(projects)
  const projectIdByResumeItemId = new Map(
    mappings.map((mapping) => [mapping.resumeItemId, mapping.portfolioCaseId])
  )
  const summaryBlockByProjectId = new Map<string, (typeof summaryBlocks)[number]>()
  for (const summaryBlock of summaryBlocks) {
    const projectId = projectIdByResumeItemId.get(summaryBlock.resumeItemId)
    if (!projectId) continue
    summaryBlockByProjectId.set(projectId, summaryBlock)
  }
  const companyProjectsByCompanyId = buildCompanyProjectsByCompanyId(normalizedProjects)

  const sortedAwards = [...awards].sort((a, b) => b.data.date.getTime() - a.data.date.getTime())

  return {
    profile: {
      name: profile.name,
      label: profile.label,
      email: profile.email,
      url: profile.url,
      summary: profile.summary,
      profiles: profile.profiles,
    },
    work: workWithCompanyId.map(({ entry: w, companyId }) => {
      const companyProjects = companyProjectsByCompanyId.get(companyId) ?? []
      const projectCases = companyProjects.flatMap((project) => {
        const summaryBlock = summaryBlockByProjectId.get(project.projectId)
        if (!summaryBlock) return []

        return [
          {
            projectId: project.projectId,
            title: summaryBlock.title,
            summary: summaryBlock.summary,
            accomplishments: summaryBlock.accomplishments,
          },
        ]
      })
      const mappedProjectCaseIds = new Set(projectCases.map((projectCase) => projectCase.projectId))
      const unmappedProjectTitles = companyProjects
        .filter((project) => !mappedProjectCaseIds.has(project.projectId))
        .map((project) => project.title)

      return {
        company: w.data.company,
        role: w.data.role,
        dateStart: w.data.dateStart.toISOString(),
        dateEnd: w.data.dateEnd?.toISOString(),
        isCurrent: w.data.isCurrent,
        projectCases: projectCases.length > 0 ? projectCases : undefined,
        projectTitles: unmappedProjectTitles,
        highlights: w.data.highlights ?? [],
      }
    }),
    projects: summaryBlocks.map((summaryBlock) => {
      return {
        resumeItemId: summaryBlock.resumeItemId,
        title: summaryBlock.title,
        summary: summaryBlock.summary,
        hasPortfolio: summaryBlock.hasPortfolio,
        technologies: summaryBlock.technologies,
        accomplishments: summaryBlock.accomplishments,
        ctaLabel: summaryBlock.ctaLabel,
        ctaHref: summaryBlock.ctaHref,
      }
    }),
    blogPosts,
    education: education.map((e) => ({
      institution: e.data.institution,
      area: e.data.area,
      studyType: e.data.studyType,
      dateStart: e.data.dateStart.toISOString(),
      dateEnd: e.data.dateEnd?.toISOString(),
      score: e.data.score,
    })),
    certificates: certificates.map((c) => ({
      name: c.data.name,
      issuer: c.data.issuer,
      date: c.data.date.toISOString(),
      body: c.body?.trim() || undefined,
    })),
    awards: sortedAwards.map((a) => ({
      title: a.data.title,
      issuer: a.data.issuer,
      date: a.data.date.toISOString(),
      summary: a.data.summary,
      body: a.body?.trim() || undefined,
    })),
    skills: skills[0]?.data.categories,
  }
}
