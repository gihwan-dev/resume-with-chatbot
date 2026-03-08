import { resolveResumeContent } from "@/lib/resume/content"
import type { SerializedResumeData } from "./types"

export async function serializeResumeData(variantInput?: string | null): Promise<SerializedResumeData> {
  const resumeContent = await resolveResumeContent(variantInput)
  const { profile, experienceEntries, blogPosts, education, certificates, awards, skillsData } =
    resumeContent

  return {
    profile: {
      name: profile.name,
      label: profile.label,
      email: profile.email,
      url: profile.url,
      summary: profile.summary,
      profiles: profile.profiles,
    },
    work: experienceEntries.map(({ data, projects }) => {
      return {
        company: data.company,
        role: data.role,
        dateStart: data.dateStart.toISOString(),
        dateEnd: data.dateEnd?.toISOString(),
        isCurrent: data.isCurrent,
        projects: projects.length > 0 ? projects : undefined,
        highlights: data.highlights ?? [],
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
    awards: awards.map((a) => ({
      title: a.data.title,
      issuer: a.data.issuer,
      date: a.data.date.toISOString(),
      summary: a.data.summary,
      body: a.body?.trim() || undefined,
    })),
    skills: skillsData?.categories,
  }
}
