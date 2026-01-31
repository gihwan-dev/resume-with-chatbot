import { getCollection } from "astro:content"

/**
 * 날짜를 YYYY.MM 형식으로 변환
 */
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}.${month}`
}

/**
 * 날짜 범위 문자열 생성
 */
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

/**
 * Content Collections 데이터를 읽어 프롬프트 문자열로 변환
 */
export async function buildResumePrompt(): Promise<string> {
  const [basics, work, projects, education, certificates, awards] = await Promise.all([
    getCollection("basics"),
    getCollection("work"),
    getCollection("projects"),
    getCollection("education"),
    getCollection("certificates"),
    getCollection("awards"),
  ])

  const sections: string[] = []

  // 1. 기본 정보
  const profile = basics[0]?.data
  if (profile) {
    sections.push(`## 기본 정보
- 이름: ${profile.name}
- 직무: ${profile.label}
- 이메일: ${profile.email}${profile.url ? `\n- 웹사이트: ${profile.url}` : ""}

## 요약
${profile.summary}`)
  }

  // 2. 경력 (최신순 정렬)
  if (work.length > 0) {
    const sortedWork = [...work].sort(
      (a, b) => b.data.dateStart.getTime() - a.data.dateStart.getTime()
    )

    const workSection = sortedWork.map((w) => {
      const dateRange = formatDateRange(w.data.dateStart, w.data.dateEnd, w.data.isCurrent)
      return `### ${w.data.company} (${dateRange})
- 직무: ${w.data.role}
- ${w.data.summary}`
    })

    sections.push(`## 경력

${workSection.join("\n\n")}`)
  }

  // 3. 주요 프로젝트 (최신순 정렬)
  if (projects.length > 0) {
    const sortedProjects = [...projects].sort(
      (a, b) => b.data.dateStart.getTime() - a.data.dateStart.getTime()
    )

    const projectSections = sortedProjects.map((p, index) => {
      const dateRange = formatDateRange(p.data.dateStart, p.data.dateEnd)
      const techStack = p.data.techStack.join(", ")
      const body = p.body?.trim()

      let section = `### ${index + 1}. ${p.data.title}
- 기간: ${dateRange}
- 기술: ${techStack}
- 요약: ${p.data.description}`

      if (body) {
        section += `\n\n${body}`
      }

      return section
    })

    sections.push(`## 주요 프로젝트

${projectSections.join("\n\n---\n\n")}`)
  }

  // 4. 학력
  if (education.length > 0) {
    const eduSection = education.map((e) => {
      const dateRange = formatDateRange(e.data.dateStart, e.data.dateEnd)
      return `- ${e.data.institution} ${e.data.area} (${dateRange})`
    })

    sections.push(`## 학력
${eduSection.join("\n")}`)
  }

  // 5. 자격증
  if (certificates.length > 0) {
    const certSections = certificates.map((c) => {
      const date = formatDate(c.data.date)
      const body = c.body?.trim()
      const detail = body ? ` - ${body}` : ""
      return `- ${c.data.name}${detail} (${date})`
    })

    sections.push(`## 자격증
${certSections.join("\n")}`)
  }

  // 6. 대외활동
  if (awards.length > 0) {
    const awardSections = awards.map((a) => {
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

  // 7. 링크
  if (profile?.profiles && profile.profiles.length > 0) {
    const linkSection = profile.profiles.map((p: { network: string; url: string }) => `- ${p.network}: ${p.url}`).join("\n")

    sections.push(`## 링크
${linkSection}`)
  }

  return sections.join("\n\n")
}
