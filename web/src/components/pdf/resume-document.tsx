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
      {work.map((w) => {
        const fallbackProjectItems =
          w.projectTitles.length > 0
            ? w.projectTitles
            : w.projectCases && w.projectCases.length > 0
              ? []
              : w.highlights

        return (
          <View key={`${w.company}-${w.dateStart}`} style={styles.itemSeparator}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{w.role}</Text>
              <Text style={styles.itemDate}>
                {formatDateRange(w.dateStart, w.dateEnd, w.isCurrent)}
              </Text>
            </View>
            <Text style={styles.itemSubtitle}>{w.company}</Text>
            {w.projectCases && w.projectCases.length > 0 && (
              <View style={styles.experienceCaseList}>
                {w.projectCases.map((projectCase) => (
                  <View
                    key={`${w.company}-${projectCase.projectId}`}
                    style={styles.experienceCaseCard}
                  >
                    <Text style={styles.experienceCaseTitle}>{projectCase.title}</Text>
                    <Text style={styles.experienceCaseSummary}>{projectCase.summary}</Text>
                    {projectCase.accomplishments.slice(0, 2).map((accomplishment) => (
                      <View key={accomplishment} style={styles.experienceCaseBulletRow}>
                        <Text style={styles.experienceCaseBullet}>•</Text>
                        <Text style={styles.experienceCaseBulletText}>{accomplishment}</Text>
                      </View>
                    ))}
                    {projectCase.measurementMethod && (
                      <Text style={styles.experienceCaseMetaText}>
                        <Text style={styles.experienceCaseMetaLabel}>Measurement: </Text>
                        {projectCase.measurementMethod}
                      </Text>
                    )}
                    {projectCase.tradeOffs?.map((tradeOff) => (
                      <Text key={tradeOff} style={styles.experienceCaseMetaText}>
                        <Text style={styles.experienceCaseMetaLabel}>Trade-off: </Text>
                        {tradeOff}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            )}
            {fallbackProjectItems.length > 0 && (
              <View style={styles.experienceProjectList}>
                {fallbackProjectItems.map((projectTitle) => (
                  <View key={`${w.company}-${projectTitle}`} style={styles.experienceProjectRow}>
                    <Text style={styles.experienceProjectBullet}>•</Text>
                    <Text style={styles.experienceProjectText}>{projectTitle}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}

function BlogSection({ blogPosts }: { blogPosts: SerializedResumeData["blogPosts"] }) {
  if (blogPosts.length === 0) return null
  return (
    <View>
      <Text style={styles.sectionTitle}>Technical Writing</Text>
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
        <ExperienceSection work={data.work} />
        <BlogSection blogPosts={data.blogPosts} />
        <AwardSection awards={data.awards} />
        <CertificateSection certificates={data.certificates} />
        <SkillsSection skills={data.skills} />
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}
