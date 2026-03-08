import { Document, Link, Page, Text, View } from "@react-pdf/renderer"
import { markdownInlineToPdf } from "@/lib/pdf/markdown-to-pdf"
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

const BULLET_PREFIX = /^-\s*/

function parseSummaryBullets(summary: string): string[] | null {
  const lines = summary
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
  if (lines.length === 0) return null
  const allBullets = lines.every((l) => BULLET_PREFIX.test(l))
  if (!allBullets) return null
  return lines.map((l) => l.replace(BULLET_PREFIX, "").trim()).filter((l) => l.length > 0)
}

function ProfileSection({ profile }: { profile: SerializedResumeData["profile"] }) {
  const links = [
    profile.url ? { label: "Website", url: profile.url } : null,
    ...profile.profiles.map((p) => ({ label: p.network, url: p.url })),
  ].filter(Boolean) as { label: string; url: string }[]

  const bullets = parseSummaryBullets(profile.summary)

  return (
    <View>
      <View style={styles.headerMastheadRow}>
        <View style={styles.headerMastheadPrimary}>
          <Text style={styles.headerName}>{profile.name}</Text>
          <Text style={styles.headerLabel}>{profile.label}</Text>
        </View>

        <View style={styles.headerContactColumn}>
          <Link src={`mailto:${profile.email}`} style={styles.link}>
            <Text style={styles.headerContactText}>{profile.email}</Text>
          </Link>
          {links.length > 0 && (
            <View style={styles.headerContactRow}>
              {links.map((l, index) => (
                <View key={l.url} style={styles.headerContactItem}>
                  {index > 0 && <Text style={styles.headerContactDot}>·</Text>}
                  <Link src={l.url} style={styles.link}>
                    <Text style={styles.headerContactText}>{l.label}</Text>
                  </Link>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {bullets ? (
        <View style={styles.headerSummaryList}>
          {bullets.map((bullet) => (
            <View key={bullet} style={styles.headerSummaryBulletRow}>
              <Text style={styles.headerSummaryBulletMarker}>•</Text>
              <Text style={styles.headerSummaryBulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.headerSummary}>{profile.summary}</Text>
      )}
    </View>
  )
}

interface CompactRowProps {
  title: string
  date: string
  meta?: string
  body?: string
  linkLabel?: string
  linkUrl?: string
}

interface CompactSectionRow extends CompactRowProps {
  rowKey: string
}

function CompactRow({ title, date, meta, body, linkLabel, linkUrl }: CompactRowProps) {
  return (
    <View style={styles.compactRow} wrap={false}>
      <View style={styles.itemHeader}>
        <Text style={styles.compactTitle}>{title}</Text>
        <Text style={styles.compactDate}>{date}</Text>
      </View>
      {meta && <Text style={styles.compactMeta}>{meta}</Text>}
      {body && <Text style={styles.compactBody}>{body}</Text>}
      {linkUrl && linkLabel && (
        <Link src={linkUrl} style={styles.link}>
          <Text style={styles.compactLinkText}>{linkLabel}</Text>
        </Link>
      )}
    </View>
  )
}

function CompactRowsSection({ title, rows }: { title: string; rows: CompactSectionRow[] }) {
  if (rows.length === 0) return null

  const [firstRow, ...remainingRows] = rows
  const firstRowProps: CompactRowProps = firstRow

  return (
    <View>
      <View wrap={false} minPresenceAhead={50}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <CompactRow {...firstRowProps} />
      </View>
      {remainingRows.map((row) => {
        const rowProps: CompactRowProps = row
        return <CompactRow key={row.rowKey} {...rowProps} />
      })}
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
        const fallbackHighlights = w.projects && w.projects.length > 0 ? [] : w.highlights

        return (
          <View
            key={`${w.company}-${w.dateStart}`}
            style={styles.itemSeparator}
            minPresenceAhead={80}
          >
            <View style={styles.projectContainer}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{w.role}</Text>
                <Text style={styles.itemDate}>
                  {formatDateRange(w.dateStart, w.dateEnd, w.isCurrent)}
                </Text>
              </View>
              <Text style={styles.itemSubtitle}>{w.company}</Text>

              {w.projects && w.projects.length > 0 && (
                <View style={styles.experienceCaseList}>
                  {w.projects.map((project) => (
                    <View
                      key={`${w.company}-${project.projectId}`}
                      style={styles.experienceCaseCard}
                      minPresenceAhead={60}
                    >
                      <Text style={styles.experienceCaseTitle}>{project.title}</Text>
                      {markdownInlineToPdf(project.summary, {
                        key: `${w.company}-${project.projectId}-summary`,
                        textStyle: styles.experienceCaseSummary,
                      })}
                      {project.accomplishments.map((accomplishment, accomplishmentIndex) => (
                        <View
                          key={accomplishment}
                          style={styles.experienceCaseBulletRow}
                          minPresenceAhead={30}
                        >
                          <View style={styles.experienceCaseBulletDot} />
                          {markdownInlineToPdf(accomplishment, {
                            key: `${w.company}-${project.projectId}-accomplishment-${accomplishmentIndex}`,
                            textStyle: styles.experienceCaseBulletText,
                          })}
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              )}

              {fallbackHighlights.length > 0 && (
                <View style={styles.experienceProjectList}>
                  {fallbackHighlights.map((highlight) => (
                    <View key={`${w.company}-${highlight}`} style={styles.experienceProjectRow}>
                      <Text style={styles.experienceProjectBullet}>•</Text>
                      <Text style={styles.experienceProjectText}>{highlight}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )
      })}
    </View>
  )
}

function BlogSection({ blogPosts }: { blogPosts: SerializedResumeData["blogPosts"] }) {
  if (blogPosts.length === 0) return null

  const rows: CompactSectionRow[] = blogPosts.map((post) => ({
    rowKey: post.url,
    title: post.title,
    date: formatDate(post.publishedAt),
    linkLabel: "Read post",
    linkUrl: post.url,
  }))

  return <CompactRowsSection title="Technical Writing" rows={rows} />
}

function CertificateSection({
  certificates,
}: {
  certificates: SerializedResumeData["certificates"]
}) {
  if (certificates.length === 0) return null

  const rows: CompactSectionRow[] = certificates.map((c) => ({
    rowKey: `${c.name}-${c.date}`,
    title: c.name,
    date: formatDate(c.date),
    meta: c.issuer,
    body: c.body,
  }))

  return <CompactRowsSection title="Certificates" rows={rows} />
}

function AwardSection({ awards }: { awards: SerializedResumeData["awards"] }) {
  if (awards.length === 0) return null

  const rows: CompactSectionRow[] = awards.map((a) => ({
    rowKey: `${a.title}-${a.date}`,
    title: a.title,
    date: formatDate(a.date),
    meta: a.issuer,
    body: a.summary,
  }))

  return <CompactRowsSection title="Awards" rows={rows} />
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
