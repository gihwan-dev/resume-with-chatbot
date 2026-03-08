import { resolveResumeContent } from "@/lib/resume/content"

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}.${month}`
}

function formatDateRange(dateStart: Date, dateEnd?: Date, isCurrent?: boolean): string {
  const start = formatDate(dateStart)
  if (isCurrent) {
    return `${start} ~ 현재`
  }
  if (dateEnd) {
    return `${start} ~ ${formatDate(dateEnd)}`
  }
  return `${start}~`
}

export async function buildResumePrompt(variantInput?: string | null): Promise<string> {
  const resumeContent = await resolveResumeContent(variantInput)
  const sections: string[] = []

  const profile = resumeContent.profile
  if (profile) {
    sections.push(`## 기본 정보
- 이름: ${profile.name}
- 직무: ${profile.label}
- 이메일: ${profile.email}${profile.url ? `\n- 웹사이트: ${profile.url}` : ""}

## 요약
${profile.summary}`)
  }

  if (resumeContent.experienceEntries.length > 0) {
    const workSection = resumeContent.experienceEntries.map(({ data }) => {
      const dateRange = formatDateRange(data.dateStart, data.dateEnd, data.isCurrent)
      const highlights = data.highlights ?? []
      const lines = [`### ${data.company} (${dateRange})`, `- 직무: ${data.role}`]
      for (const highlight of highlights) {
        lines.push(`- ${highlight}`)
      }
      return lines.join("\n")
    })

    sections.push(`## 경력

${workSection.join("\n\n")}`)
  }

  const sortedProjects = resumeContent.experienceEntries.flatMap(({ projects }) => projects)
  if (sortedProjects.length > 0) {
    const projectSections = sortedProjects.map((project, index) => {
      const accomplishmentLines = project.accomplishments.map((item) => `- ${item}`).join("\n")

      return `### ${index + 1}. ${project.title}
- 요약: ${project.summary}

#### 주요 성과
${accomplishmentLines}`
    })

    sections.push(`## 주요 프로젝트

${projectSections.join("\n\n")}`)
  }

  if (resumeContent.blogPosts.length > 0) {
    const blogSections = resumeContent.blogPosts.map((post, index) => {
      const date = formatDate(new Date(post.publishedAt))
      return `${index + 1}. ${post.title} (${date})\n   - 링크: ${post.url}`
    })

    sections.push(`## 최근 블로그 글
${blogSections.join("\n")}`)
  }

  if (resumeContent.education.length > 0) {
    const eduSection = resumeContent.education.map((e) => {
      const dateRange = formatDateRange(e.data.dateStart, e.data.dateEnd)
      return `- ${e.data.institution} ${e.data.area} (${dateRange})`
    })

    sections.push(`## 학력
${eduSection.join("\n")}`)
  }

  if (resumeContent.certificates.length > 0) {
    const certSections = resumeContent.certificates.map((c) => {
      const date = formatDate(c.data.date)
      const body = c.body?.trim()
      const detail = body ? ` - ${body}` : ""
      return `- ${c.data.name}${detail} (${date})`
    })

    sections.push(`## 자격증
${certSections.join("\n")}`)
  }

  if (resumeContent.awards.length > 0) {
    const awardSections = resumeContent.awards.map((a) => {
      const date = a.data.date.getFullYear().toString()
      const body = a.body?.trim()

      let section = `### ${a.data.title}
- ${a.data.issuer} (${date})${a.data.summary ? `\n- ${a.data.summary}` : ""}`

      if (body) {
        section += `\n\n${body}`
      }

      return section
    })

    sections.push(`## 대외활동

${awardSections.join("\n\n")}`)
  }

  if (profile?.profiles && profile.profiles.length > 0) {
    const linkSection = profile.profiles
      .map((p: { network: string; url: string }) => `- ${p.network}: ${p.url}`)
      .join("\n")

    sections.push(`## 링크
${linkSection}`)
  }

  return sections.join("\n\n")
}
