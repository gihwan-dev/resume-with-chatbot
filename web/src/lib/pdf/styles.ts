import { StyleSheet } from "@react-pdf/renderer"

const colors = {
  primary: "#0f172a",
  accent: "#0369a1",
  text: "#020617",
  muted: "#64748b",
  mutedStrong: "#334155",
  border: "#cbd5e1",
  borderStrong: "#94a3b8",
  background: "#ffffff",
  cardBg: "#f8fafc",
  parProblem: "#be185d",
  parAction: "#0369a1",
  parResult: "#059669",
  parProblemBg: "#fdf2f8",
  parActionBg: "#e0f2fe",
  parResultBg: "#ecfdf5",
  highlight: "#fef3c7",
  linkText: "#0369a1",
  bulletDot: "#0369a1",
}

export const styles = StyleSheet.create({
  page: {
    fontFamily: "Pretendard",
    fontSize: 9.2,
    color: colors.text,
    backgroundColor: colors.background,
    paddingTop: 34,
    paddingBottom: 42,
    paddingHorizontal: 40,
  },

  // Header / Profile
  headerMastheadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  headerMastheadPrimary: {
    flex: 1,
    paddingRight: 18,
  },
  headerContactColumn: {
    width: 174,
    alignItems: "flex-end",
  },
  headerName: {
    fontSize: 27,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 2,
  },
  headerLabel: {
    fontSize: 11,
    color: colors.mutedStrong,
    fontWeight: 600,
    letterSpacing: 0.3,
  },
  headerContact: {
    fontSize: 9,
    color: colors.muted,
    marginBottom: 0,
  },
  headerContactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  headerContactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
  },
  headerContactDot: {
    fontSize: 9,
    color: colors.muted,
  },
  headerContactText: {
    fontSize: 9,
    color: colors.mutedStrong,
    lineHeight: 1.35,
  },
  headerSummary: {
    fontSize: 9.2,
    lineHeight: 1.52,
    marginTop: 8,
    marginBottom: 10,
  },
  headerSummaryList: {
    marginTop: 8,
    marginBottom: 8,
  },
  headerSummaryBulletRow: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 2,
  },
  headerSummaryBulletMarker: {
    width: 9,
    fontSize: 9.2,
    color: colors.accent,
  },
  headerSummaryBulletText: {
    flex: 1,
    fontSize: 9.2,
    lineHeight: 1.5,
  },
  headerSummaryHighlight: {
    fontWeight: 600,
    color: colors.accent,
  },
  link: {
    color: colors.linkText,
    textDecoration: "none",
    fontWeight: 600,
  },

  // Section
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.primary,
    marginTop: 18,
    marginBottom: 9,
    letterSpacing: 0.3,
  },

  // Experience / Project item
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 3,
  },
  itemTitle: {
    fontSize: 12.2,
    fontWeight: 700,
    color: colors.text,
  },
  itemDate: {
    fontSize: 9,
    color: colors.muted,
  },
  itemSubtitle: {
    fontSize: 9.4,
    color: colors.mutedStrong,
    fontWeight: 600,
    marginBottom: 7,
  },
  itemSummary: {
    fontSize: 9.2,
    lineHeight: 1.5,
    marginBottom: 4,
    color: colors.mutedStrong,
  },
  experienceProjectList: {
    marginTop: 4,
  },
  experienceProjectRow: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 2,
    alignItems: "flex-start",
  },
  experienceProjectBullet: {
    width: 9,
    fontSize: 9.2,
    color: colors.accent,
  },
  experienceProjectText: {
    flex: 1,
    fontSize: 9.2,
    lineHeight: 1.48,
  },
  experienceCaseList: {
    marginTop: 6,
  },
  experienceCaseCard: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 3,
    paddingBottom: 3,
    marginBottom: 7,
    backgroundColor: colors.background,
  },
  experienceCaseTitle: {
    fontSize: 10.2,
    fontWeight: 600,
    marginBottom: 4,
    color: colors.text,
  },
  experienceCaseSummary: {
    fontSize: 9.2,
    lineHeight: 1.5,
    marginBottom: 4,
    color: colors.mutedStrong,
  },
  experienceCaseBulletRow: {
    flexDirection: "row",
    marginBottom: 2,
    alignItems: "flex-start",
  },
  experienceCaseBullet: {
    width: 9,
    fontSize: 9,
    color: colors.muted,
  },
  experienceCaseBulletDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.bulletDot,
    marginTop: 5,
    marginRight: 5,
  },
  experienceCaseBulletText: {
    flex: 1,
    fontSize: 9.2,
    lineHeight: 1.5,
  },
  experienceCaseMetaText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: colors.muted,
    marginTop: 2,
  },
  experienceCaseMetaLabel: {
    fontWeight: 700,
    color: colors.text,
  },
  compactRow: {
    paddingTop: 3,
    paddingBottom: 3,
    marginBottom: 7,
  },
  compactTitle: {
    fontSize: 10.3,
    fontWeight: 600,
    color: colors.text,
  },
  compactDate: {
    fontSize: 9,
    color: colors.muted,
  },
  compactMeta: {
    fontSize: 9.2,
    lineHeight: 1.42,
    color: colors.mutedStrong,
    marginTop: 2,
  },
  compactBody: {
    fontSize: 9.2,
    lineHeight: 1.48,
    color: colors.mutedStrong,
    marginTop: 3,
  },
  compactLinkText: {
    fontSize: 9.2,
    marginTop: 1,
    color: colors.accent,
    fontWeight: 600,
  },
  blogLinkText: {
    fontSize: 9.2,
    marginBottom: 2,
    fontWeight: 600,
  },
  itemSeparator: {
    marginBottom: 10,
  },
  projectContainer: {
    marginBottom: 14,
    paddingLeft: 0,
  },

  // Skills section
  skillsCategoryLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: colors.mutedStrong,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 3,
    marginTop: 5,
  },
  skillsBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
    marginBottom: 4,
  },

  // Tech stack badges
  techStackRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 4,
  },
  techBadge: {
    fontSize: 9,
    color: colors.mutedStrong,
    backgroundColor: colors.cardBg,
    paddingHorizontal: 4,
    paddingVertical: 1.4,
    borderRadius: 1.6,
  },

  // Markdown body
  mdH4: {
    fontSize: 10.2,
    fontWeight: 700,
    marginTop: 8,
    marginBottom: 3,
  },
  mdH3: {
    fontSize: 11.2,
    fontWeight: 700,
    marginTop: 7,
    marginBottom: 3,
  },
  mdParagraph: {
    fontSize: 9.2,
    lineHeight: 1.52,
    marginBottom: 4,
  },
  mdBulletRow: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 4,
    alignItems: "flex-start",
  },
  mdBulletMarker: {
    width: 9,
    fontSize: 9.2,
    color: colors.accent,
  },
  mdBulletContent: {
    flex: 1,
    fontSize: 9.2,
    lineHeight: 1.5,
  },
  mdQuoteRow: {
    flexDirection: "row",
    marginBottom: 4,
    marginTop: 2,
  },
  mdQuoteBar: {
    width: 2,
    backgroundColor: colors.accent,
    borderRadius: 1,
    marginRight: 6,
  },
  mdQuoteContent: {
    flex: 1,
    fontSize: 9.2,
    color: colors.mutedStrong,
    lineHeight: 1.5,
  },
  mdHr: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    marginVertical: 8,
  },
  mdBold: {
    fontWeight: 700,
  },
  mdHighlight: {
    backgroundColor: colors.highlight,
  },
  mdCode: {
    fontSize: 9,
    fontWeight: 600,
    color: colors.mutedStrong,
  },

  // PAR labels
  parProblemLabel: {
    fontWeight: 700,
    color: colors.parProblem,
  },
  parActionLabel: {
    fontWeight: 700,
    color: colors.parAction,
  },
  parResultLabel: {
    fontWeight: 700,
    color: colors.parResult,
  },
  parBadgeRow: {
    flexDirection: "row",
    marginTop: 6,
    marginBottom: 2,
  },
  parProblemBadge: {
    fontSize: 9,
    fontWeight: 700,
    color: colors.parProblem,
    backgroundColor: colors.parProblemBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  parActionBadge: {
    fontSize: 9,
    fontWeight: 700,
    color: colors.parAction,
    backgroundColor: colors.parActionBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  parResultBadge: {
    fontSize: 9,
    fontWeight: 700,
    color: colors.parResult,
    backgroundColor: colors.parResultBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 18,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8.5,
    color: colors.muted,
  },
})
