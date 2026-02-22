import { getCollection } from "astro:content"
import { getObsidianBlogPosts } from "@/lib/blog/obsidian-publish"
import { resolveProjectCompanyId, resolveWorkCompanyId } from "@/lib/experience/company-id"
import {
  buildCompanyProjectsByCompanyId,
  type CompanyProjectSource,
} from "@/lib/experience/company-projects"
import { buildResumePortfolioContracts } from "@/lib/resume-portfolio/derive"
import type { SerializedResumeData } from "./types"

function toOptionalText(value: string | undefined): string | undefined {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

function extractTradeOffs(decisions: { tradeOff: string }[] | undefined): string[] | undefined {
  if (!decisions || decisions.length === 0) return undefined

  const uniqueTradeOffs = [
    ...new Set(decisions.map((decision) => toOptionalText(decision.tradeOff))),
  ].filter((tradeOff): tradeOff is string => Boolean(tradeOff))

  return uniqueTradeOffs.length > 0 ? uniqueTradeOffs : undefined
}

export async function serializeResumeData(): Promise<SerializedResumeData> {
  const [basics, work, projects, education, certificates, awards, skills, blogPosts] =
    await Promise.all([
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
  const projectById = new Map(projects.map((project) => [project.id, project]))
  const projectIdByResumeItemId = new Map(
    mappings.map((mapping) => [mapping.resumeItemId, mapping.portfolioCaseId])
  )
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
      heroMetrics: profile.heroMetrics,
    },
    coreStrengths: skills[0]?.data.coreStrengths,
    work: workWithCompanyId.map(({ entry: w, companyId }) => ({
      company: w.data.company,
      role: w.data.role,
      dateStart: w.data.dateStart.toISOString(),
      dateEnd: w.data.dateEnd?.toISOString(),
      isCurrent: w.data.isCurrent,
      location: w.data.location,
      summary: w.data.summary,
      projectTitles: (companyProjectsByCompanyId.get(companyId) ?? []).map(
        (project) => project.title
      ),
      highlights: w.data.highlights ?? [],
    })),
    projects: summaryBlocks.map((summaryBlock) => {
      const projectId = projectIdByResumeItemId.get(summaryBlock.resumeItemId)
      const storyThread = projectId ? projectById.get(projectId)?.data.storyThread : undefined

      return {
        resumeItemId: summaryBlock.resumeItemId,
        title: summaryBlock.title,
        summary: summaryBlock.summary,
        hasPortfolio: summaryBlock.hasPortfolio,
        technologies: summaryBlock.technologies,
        accomplishments: summaryBlock.accomplishments,
        evidenceIds: summaryBlock.evidenceIds,
        architectureSummary: toOptionalText(storyThread?.coreApproach),
        measurementMethod: toOptionalText(storyThread?.validationImpact?.measurementMethod),
        tradeOffs: extractTradeOffs(storyThread?.decisions),
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
