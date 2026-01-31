import { StyleSheet } from "@react-pdf/renderer"

const colors = {
  primary: "#4338ca",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  background: "#ffffff",
  parProblem: "#be185d",
  parAction: "#4338ca",
  parResult: "#059669",
  parProblemBg: "#fdf2f8",
  parActionBg: "#eef2ff",
  parResultBg: "#ecfdf5",
  highlight: "#fef9c3",
  linkText: "#4338ca",
}

export const styles = StyleSheet.create({
  page: {
    fontFamily: "Pretendard",
    fontSize: 9,
    color: colors.text,
    backgroundColor: colors.background,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
  },

  // Header / Profile
  headerName: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 2,
  },
  headerLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: 600,
    marginBottom: 8,
  },
  headerContact: {
    fontSize: 8,
    color: colors.muted,
    marginBottom: 4,
  },
  headerSummary: {
    fontSize: 9,
    lineHeight: 1.6,
    marginTop: 8,
    marginBottom: 4,
  },
  link: {
    color: colors.linkText,
    textDecoration: "none",
  },

  // Section
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  // Experience / Project item
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: 700,
  },
  itemDate: {
    fontSize: 8,
    color: colors.muted,
  },
  itemSubtitle: {
    fontSize: 9,
    color: colors.muted,
    marginBottom: 4,
  },
  itemSummary: {
    fontSize: 9,
    lineHeight: 1.5,
    marginBottom: 6,
  },
  itemSeparator: {
    marginBottom: 12,
  },
  projectContainer: {
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: 10,
  },

  // Tech stack badges
  techStackRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 6,
  },
  techBadge: {
    fontSize: 7,
    color: colors.primary,
    backgroundColor: "#eef2ff",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },

  // Markdown body
  mdH4: {
    fontSize: 10,
    fontWeight: 700,
    marginTop: 10,
    marginBottom: 4,
    paddingLeft: 6,
  },
  mdH3: {
    fontSize: 10,
    fontWeight: 600,
    marginTop: 6,
    marginBottom: 3,
  },
  mdParagraph: {
    fontSize: 9,
    lineHeight: 1.6,
    marginBottom: 4,
  },
  mdBulletRow: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 8,
  },
  mdBulletMarker: {
    width: 10,
    fontSize: 9,
  },
  mdBulletContent: {
    flex: 1,
    fontSize: 9,
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
    fontSize: 8,
    paddingHorizontal: 2,
    borderRadius: 1,
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
    fontSize: 7,
    fontWeight: 700,
    color: colors.parProblem,
    backgroundColor: colors.parProblemBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  parActionBadge: {
    fontSize: 7,
    fontWeight: 700,
    color: colors.parAction,
    backgroundColor: colors.parActionBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  parResultBadge: {
    fontSize: 7,
    fontWeight: 700,
    color: colors.parResult,
    backgroundColor: colors.parResultBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: colors.muted,
  },
})
