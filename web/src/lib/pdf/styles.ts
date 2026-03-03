import { StyleSheet } from "@react-pdf/renderer"

const colors = {
  primary: "#4338ca",
  text: "#0f172a",
  muted: "#64748b",
  mutedStrong: "#475569",
  border: "#cbd5e1",
  background: "#ffffff",
  cardBg: "#f8fafc",
  parProblem: "#be185d",
  parAction: "#4338ca",
  parResult: "#059669",
  parProblemBg: "#fdf2f8",
  parActionBg: "#eef2ff",
  parResultBg: "#ecfdf5",
  highlight: "#fef9c3",
  linkText: "#4338ca",
  bulletDot: "#6366f1",
}

export const styles = StyleSheet.create({
  page: {
    fontFamily: "Pretendard",
    fontSize: 9.5,
    color: colors.text,
    backgroundColor: colors.background,
    paddingTop: 36,
    paddingBottom: 44,
    paddingHorizontal: 44,
  },

  // Header / Profile
  headerName: {
    fontSize: 24,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 3,
  },
  headerLabel: {
    fontSize: 12,
    color: colors.mutedStrong,
    fontWeight: 600,
    marginBottom: 10,
  },
  headerContact: {
    fontSize: 9,
    color: colors.muted,
    marginBottom: 3,
  },
  headerContactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
    marginBottom: 6,
  },
  headerContactDot: {
    fontSize: 9,
    color: colors.muted,
  },
  headerSummary: {
    fontSize: 9.5,
    lineHeight: 1.6,
    marginTop: 10,
    marginBottom: 6,
  },
  headerSummaryBulletRow: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 4,
  },
  headerSummaryBulletMarker: {
    width: 10,
    fontSize: 9.5,
    color: colors.primary,
  },
  headerSummaryBulletText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.6,
  },
  headerSummaryHighlight: {
    fontWeight: 600,
    color: colors.primary,
  },
  headerDivider: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.primary,
    marginTop: 12,
    marginBottom: 4,
    opacity: 0.3,
  },
  link: {
    color: colors.linkText,
    textDecoration: "none",
    fontWeight: 600,
  },

  // Section
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.primary,
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.primary,
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
    fontSize: 12,
    fontWeight: 700,
  },
  itemDate: {
    fontSize: 8.5,
    color: colors.mutedStrong,
  },
  itemSubtitle: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: 600,
    marginBottom: 6,
  },
  itemSummary: {
    fontSize: 9.5,
    lineHeight: 1.55,
    marginBottom: 6,
  },
  experienceProjectList: {
    marginTop: 4,
  },
  experienceProjectRow: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 4,
    alignItems: "flex-start",
  },
  experienceProjectBullet: {
    width: 10,
    fontSize: 9.5,
    color: colors.primary,
  },
  experienceProjectText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.55,
  },
  experienceCaseList: {
    marginTop: 6,
  },
  experienceCaseCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: colors.cardBg,
  },
  experienceCaseTitle: {
    fontSize: 10.5,
    fontWeight: 600,
    marginBottom: 4,
    color: colors.text,
  },
  experienceCaseSummary: {
    fontSize: 9,
    lineHeight: 1.55,
    marginBottom: 6,
    color: colors.mutedStrong,
  },
  experienceCaseBulletRow: {
    flexDirection: "row",
    marginBottom: 3,
    alignItems: "flex-start",
  },
  experienceCaseBullet: {
    width: 10,
    fontSize: 9,
    color: colors.muted,
  },
  experienceCaseBulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.bulletDot,
    marginTop: 4.5,
    marginRight: 6,
  },
  experienceCaseBulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.55,
  },
  experienceCaseMetaText: {
    fontSize: 8.5,
    lineHeight: 1.4,
    color: colors.mutedStrong,
    marginTop: 2,
  },
  experienceCaseMetaLabel: {
    fontWeight: 700,
    color: colors.text,
  },
  blogLinkText: {
    fontSize: 9,
    marginBottom: 2,
    fontWeight: 600,
  },
  itemSeparator: {
    marginBottom: 14,
  },
  projectContainer: {
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: 10,
  },

  // Skills section
  skillsCategoryLabel: {
    fontSize: 8.5,
    fontWeight: 600,
    color: colors.mutedStrong,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
    marginTop: 6,
  },
  skillsBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 6,
  },

  // Tech stack badges
  techStackRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 6,
  },
  techBadge: {
    fontSize: 8,
    color: colors.text,
    backgroundColor: colors.cardBg,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: colors.border,
  },

  // Markdown body
  mdH4: {
    fontSize: 10,
    fontWeight: 700,
    marginTop: 10,
    marginBottom: 4,
  },
  mdH3: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 8,
    marginBottom: 4,
  },
  mdParagraph: {
    fontSize: 9.5,
    lineHeight: 1.6,
    marginBottom: 5,
  },
  mdBulletRow: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 6,
    alignItems: "flex-start",
  },
  mdBulletMarker: {
    width: 10,
    fontSize: 9.5,
    color: colors.primary,
  },
  mdBulletContent: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.6,
  },
  mdQuoteRow: {
    flexDirection: "row",
    marginBottom: 6,
    marginTop: 2,
  },
  mdQuoteBar: {
    width: 2.5,
    backgroundColor: colors.primary,
    borderRadius: 1,
    marginRight: 8,
  },
  mdQuoteContent: {
    flex: 1,
    fontSize: 9.5,
    color: colors.mutedStrong,
    lineHeight: 1.6,
  },
  mdHr: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    marginVertical: 10,
  },
  mdBold: {
    fontWeight: 700,
  },
  mdHighlight: {
    backgroundColor: colors.highlight,
  },
  mdCode: {
    backgroundColor: "#f1f5f9",
    fontSize: 8.5,
    paddingHorizontal: 3,
    borderRadius: 2,
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
    fontSize: 8,
    fontWeight: 700,
    color: colors.parProblem,
    backgroundColor: colors.parProblemBg,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
  },
  parActionBadge: {
    fontSize: 8,
    fontWeight: 700,
    color: colors.parAction,
    backgroundColor: colors.parActionBg,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
  },
  parResultBadge: {
    fontSize: 8,
    fontWeight: 700,
    color: colors.parResult,
    backgroundColor: colors.parResultBg,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 44,
    right: 44,
    textAlign: "center",
    fontSize: 8,
    color: colors.muted,
  },
})
