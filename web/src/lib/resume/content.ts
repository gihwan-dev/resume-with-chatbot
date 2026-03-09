import { type CollectionEntry, getCollection } from "astro:content"
import { getObsidianBlogPosts } from "@/lib/blog/obsidian-publish"
import { resolveProjectCompanyId, resolveWorkCompanyId } from "@/lib/experience/company-id"
import {
  buildCompanyProjectsByCompanyId,
  type CompanyProjectItem,
  type CompanyProjectSource,
} from "@/lib/experience/company-projects"
import { getLiveResumeFeedItems } from "@/lib/work-agent/obsidian.server"
import type { LiveResumeFeedItem } from "@/lib/work-agent/types"
import { DEFAULT_RESUME_VARIANT, parseResumeVariant, type ResumeVariantId } from "./variant"

interface VariantScopedEntry {
  variants?: ResumeVariantId[]
}

function includesVariant(
  entryVariants: readonly ResumeVariantId[] | undefined,
  variant: ResumeVariantId
): boolean {
  if (!entryVariants || entryVariants.length === 0) return true
  return entryVariants.includes(variant)
}

function resolveVariantEntry<T extends { data: { variant: ResumeVariantId } }>(
  entries: readonly T[],
  variant: ResumeVariantId
): T | undefined {
  return (
    entries.find((entry) => entry.data.variant === variant) ??
    entries.find((entry) => entry.data.variant === DEFAULT_RESUME_VARIANT)
  )
}

export interface ResumeExperienceEntry {
  data: CollectionEntry<"work">["data"]
  projects: CompanyProjectItem[]
}

export interface ResolvedResumeContent {
  variant: ResumeVariantId
  profile: CollectionEntry<"basics">["data"]
  skillsData?: CollectionEntry<"skills">["data"]
  liveResumeFeedItems: LiveResumeFeedItem[]
  experienceEntries: ResumeExperienceEntry[]
  blogPosts: Awaited<ReturnType<typeof getObsidianBlogPosts>>
  education: CollectionEntry<"education">[]
  certificates: CollectionEntry<"certificates">[]
  awards: CollectionEntry<"awards">[]
}

export async function resolveResumeContent(
  variantInput?: string | null
): Promise<ResolvedResumeContent> {
  const variant = parseResumeVariant(variantInput)

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

  const profile = resolveVariantEntry(basics, variant)?.data
  if (!profile) {
    throw new Error("Profile data is required in basics collection.")
  }

  const skillsData = resolveVariantEntry(skills, variant)?.data

  const filteredWork = work.filter((entry) =>
    includesVariant((entry.data as VariantScopedEntry).variants, variant)
  )
  const filteredProjects = projects.filter((entry) =>
    includesVariant((entry.data as VariantScopedEntry).variants, variant)
  )

  const sortedWork = [...filteredWork].sort(
    (a, b) => b.data.dateStart.getTime() - a.data.dateStart.getTime()
  )
  const workWithCompanyId = sortedWork.map((entry) => ({
    entry,
    companyId: resolveWorkCompanyId(entry),
  }))
  const knownCompanyIds = workWithCompanyId.map((item) => item.companyId)

  const normalizedProjects: CompanyProjectSource[] = filteredProjects.flatMap((project) => {
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
          summary: project.data.summary,
          accomplishments: [...project.data.accomplishments],
        },
      },
    ]
  })

  const companyProjectsByCompanyId = buildCompanyProjectsByCompanyId(normalizedProjects)
  const experienceEntries = workWithCompanyId.map(({ entry, companyId }) => ({
    data: entry.data,
    projects: companyProjectsByCompanyId.get(companyId) ?? [],
  }))
  const sortedAwards = [...awards].sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  const liveResumeFeedItems = getLiveResumeFeedItems(5)

  return {
    variant,
    profile,
    skillsData,
    liveResumeFeedItems,
    experienceEntries,
    blogPosts,
    education,
    certificates,
    awards: sortedAwards,
  }
}
