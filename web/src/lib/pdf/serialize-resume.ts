import { getCollection } from "astro:content"
import { getObsidianBlogPosts } from "@/lib/blog/obsidian-publish"
import { buildCompanyProjectsByCompanyId } from "@/lib/experience/company-projects"
import { buildResumePortfolioContracts } from "@/lib/resume-portfolio/derive"
import type { SerializedResumeData } from "./types"

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

  const { summaryBlocks } = buildResumePortfolioContracts(projects)
  const companyProjectsByCompanyId = buildCompanyProjectsByCompanyId(projects)

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
    work: sortedWork.map((w) => ({
      company: w.data.company,
      role: w.data.role,
      dateStart: w.data.dateStart.toISOString(),
      dateEnd: w.data.dateEnd?.toISOString(),
      isCurrent: w.data.isCurrent,
      location: w.data.location,
      summary: w.data.summary,
      projectTitles: (companyProjectsByCompanyId.get(w.data.companyId) ?? []).map(
        (project) => project.title
      ),
    })),
    projects: summaryBlocks.map((summaryBlock) => ({
      resumeItemId: summaryBlock.resumeItemId,
      title: summaryBlock.title,
      summary: summaryBlock.summary,
      hasPortfolio: summaryBlock.hasPortfolio,
      technologies: summaryBlock.technologies,
      accomplishments: summaryBlock.accomplishments,
      evidenceIds: summaryBlock.evidenceIds,
      ctaLabel: summaryBlock.ctaLabel,
      ctaHref: summaryBlock.ctaHref,
    })),
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
