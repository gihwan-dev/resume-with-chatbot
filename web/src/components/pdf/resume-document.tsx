import { Document, Link, Page, Text, View } from "@react-pdf/renderer"
import { markdownToPdf } from "@/lib/pdf/markdown-to-pdf"
import { styles } from "@/lib/pdf/styles"
import type { SerializedResumeData } from "@/lib/pdf/types"

function formatDate(iso: string): string {
  const d = new Date(iso)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  return `${year}.${month}`
}

function formatDateRange(start: string, end?: string, isCurrent?: boolean): string {
  const s = formatDate(start)
  if (isCurrent) return `${s} ~ 현재`
  if (end) return `${s} ~ ${formatDate(end)}`
  return `${s}~`
}

function ProfileSection({ profile }: { profile: SerializedResumeData["profile"] }) {
  const links = [
    profile.url ? { label: "Website", url: profile.url } : null,
    ...profile.profiles.map((p) => ({ label: p.network, url: p.url })),
  ].filter(Boolean) as { label: string; url: string }[]

  return (
    <View>
      <Text style={styles.headerName}>{profile.name}</Text>
      <Text style={styles.headerLabel}>{profile.label}</Text>
      <View style={styles.headerContact}>
        <Link src={`mailto:${profile.email}`} style={styles.link}>
          <Text>{profile.email}</Text>
        </Link>
      </View>
      {links.length > 0 && (
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
          {links.map((l) => (
            <Link key={l.url} src={l.url} style={styles.link}>
              <Text style={{ fontSize: 8 }}>{l.label}</Text>
            </Link>
          ))}
        </View>
      )}
      <Text style={styles.headerSummary}>{profile.summary}</Text>
    </View>
  )
}

function SkillsSection({ skills }: { skills: SerializedResumeData["skills"] }) {
  if (!skills || skills.length === 0) return null
  return (
    <View>
      <Text style={styles.sectionTitle}>Skills</Text>
      {skills.map((category) => (
        <View key={category.name}>
          <Text style={styles.skillsCategoryLabel}>{category.name}</Text>
          <View style={styles.skillsBadgeRow}>
            {category.items.map((item) => (
              <Text key={item} style={styles.techBadge}>
                {item}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  )
}

function ExperienceSection({ work }: { work: SerializedResumeData["work"] }) {
  if (work.length === 0) return null
  return (
    <View>
      <Text style={styles.sectionTitle}>Experience</Text>
      {work.map((w) => (
        <View key={`${w.company}-${w.dateStart}`} style={styles.itemSeparator} wrap={false}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{w.company}</Text>
            <Text style={styles.itemDate}>
              {formatDateRange(w.dateStart, w.dateEnd, w.isCurrent)}
            </Text>
          </View>
          <Text style={styles.itemSubtitle}>{w.role}</Text>
          <Text style={styles.itemSummary}>{w.summary}</Text>
        </View>
      ))}
    </View>
  )
}

function ProjectSection({ projects }: { projects: SerializedResumeData["projects"] }) {
  if (projects.length === 0) return null
  return (
    <View>
      <Text style={styles.sectionTitle}>Projects</Text>
      {projects.map((p) => (
        <View key={`${p.title}-${p.dateStart}`} style={styles.projectContainer}>
          <View minPresenceAhead={60}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{p.title}</Text>
              <Text style={styles.itemDate}>{formatDateRange(p.dateStart, p.dateEnd)}</Text>
            </View>
            {p.company && <Text style={styles.itemSubtitle}>{p.company}</Text>}
            <Text style={styles.itemSummary}>{p.description}</Text>
            {p.techStack.length > 0 && (
              <View style={styles.techStackRow}>
                {p.techStack.map((t) => (
                  <Text key={t} style={styles.techBadge}>
                    {t}
                  </Text>
                ))}
              </View>
            )}
          </View>
          {p.body && <View>{markdownToPdf(p.body)}</View>}
        </View>
      ))}
    </View>
  )
}

function BlogSection({ blogPosts }: { blogPosts: SerializedResumeData["blogPosts"] }) {
  if (blogPosts.length === 0) return null
  return (
    <View>
      <Text style={styles.sectionTitle}>Blog</Text>
      {blogPosts.map((post) => (
        <View key={post.url} style={styles.itemSeparator} wrap={false}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{post.title}</Text>
            <Text style={styles.itemDate}>{formatDate(post.publishedAt)}</Text>
          </View>
          <Link src={post.url} style={styles.link}>
            <Text style={styles.blogLinkText}>Read post</Text>
          </Link>
        </View>
      ))}
    </View>
  )
}

function EducationSection({ education }: { education: SerializedResumeData["education"] }) {
  if (education.length === 0) return null
  return (
    <View>
      <Text style={styles.sectionTitle}>Education</Text>
      {education.map((e) => (
        <View key={`${e.institution}-${e.dateStart}`} style={styles.itemSeparator} wrap={false}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{e.institution}</Text>
            <Text style={styles.itemDate}>{formatDateRange(e.dateStart, e.dateEnd)}</Text>
          </View>
          <Text style={styles.itemSubtitle}>
            {e.studyType} · {e.area}
          </Text>
        </View>
      ))}
    </View>
  )
}

function CertificateSection({
  certificates,
}: {
  certificates: SerializedResumeData["certificates"]
}) {
  if (certificates.length === 0) return null
  return (
    <View>
      <Text style={styles.sectionTitle}>Certificates</Text>
      {certificates.map((c) => (
        <View key={`${c.name}-${c.date}`} style={styles.itemSeparator} wrap={false}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{c.name}</Text>
            <Text style={styles.itemDate}>{formatDate(c.date)}</Text>
          </View>
          <Text style={styles.itemSubtitle}>{c.issuer}</Text>
          {c.body && <Text style={styles.itemSummary}>{c.body}</Text>}
        </View>
      ))}
    </View>
  )
}

function AwardSection({ awards }: { awards: SerializedResumeData["awards"] }) {
  if (awards.length === 0) return null
  return (
    <View>
      <Text style={styles.sectionTitle}>Awards</Text>
      {awards.map((a) => (
        <View key={`${a.title}-${a.date}`} style={styles.itemSeparator}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{a.title}</Text>
            <Text style={styles.itemDate}>{formatDate(a.date)}</Text>
          </View>
          <Text style={styles.itemSubtitle}>{a.issuer}</Text>
          {a.summary && <Text style={styles.itemSummary}>{a.summary}</Text>}
          {a.body && <View>{markdownToPdf(a.body)}</View>}
        </View>
      ))}
    </View>
  )
}

export function ResumeDocument({ data }: { data: SerializedResumeData }) {
  return (
    <Document
      title={`${data.profile.name} | ${data.profile.label}`}
      author={data.profile.name}
      subject="이력서"
      creator="resume-with-ai"
    >
      <Page size="A4" style={styles.page} wrap>
        <ProfileSection profile={data.profile} />
        <SkillsSection skills={data.skills} />
        <ExperienceSection work={data.work} />
        <ProjectSection projects={data.projects} />
        <BlogSection blogPosts={data.blogPosts} />
        <EducationSection education={data.education} />
        <CertificateSection certificates={data.certificates} />
        <AwardSection awards={data.awards} />
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}
