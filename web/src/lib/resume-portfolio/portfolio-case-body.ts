import type { PortfolioSectionId } from "./contracts"

interface PortfolioBodySectionDefinition {
  id: PortfolioSectionId
  heading: string
}

const PORTFOLIO_BODY_SECTIONS: readonly PortfolioBodySectionDefinition[] = [
  { id: "tldr", heading: "TL;DR" },
  { id: "problem-definition", heading: "문제 정의" },
  { id: "key-decisions", heading: "핵심 의사결정" },
  { id: "implementation-highlights", heading: "구현 전략" },
  { id: "validation-impact", heading: "검증 및 결과" },
  { id: "learned", heading: "What I Learned" },
] as const

export interface PortfolioCaseBodySection {
  id: PortfolioSectionId
  heading: string
  markdown: string
}

export interface ParsedPortfolioCaseBody {
  summary: string
  sections: PortfolioCaseBodySection[]
}

interface FenceState {
  character: "`" | "~"
  length: number
}

function sectionContext(caseId?: string): string {
  return caseId ? ` (caseId: ${caseId})` : ""
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s{0,3}(?:[-*+]|\d+\.)\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function readFenceState(line: string): FenceState | null {
  const match = line.match(/^\s{0,3}(`{3,}|~{3,})[^\n]*$/)
  if (!match) return null

  return {
    character: match[1][0] as FenceState["character"],
    length: match[1].length,
  }
}

function isClosingFence(line: string, fenceState: FenceState): boolean {
  const markerPattern = escapeRegex(fenceState.character)
  const closingFencePattern = new RegExp(`^\\s{0,3}${markerPattern}{${fenceState.length},}\\s*$`)

  return closingFencePattern.test(line)
}

function isParagraphCandidateLine(line: string): boolean {
  return !/^(?:#{1,6}\s+|[-*+]\s+|\d+\.\s+|>\s?|`{3,}|~{3,}|\||-{3,}\s*$|\*{3,}\s*$|_{3,}\s*$|<)/.test(
    line
  )
}

function extractSummaryFromTldr(markdown: string, caseId?: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n")
  const paragraphLines: string[] = []
  let fenceState: FenceState | null = null

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (fenceState) {
      if (isClosingFence(rawLine, fenceState)) {
        fenceState = null
      }
      continue
    }

    const openingFenceState = readFenceState(rawLine)
    if (openingFenceState) {
      fenceState = openingFenceState
      if (paragraphLines.length > 0) break
      continue
    }

    if (line.length === 0) {
      if (paragraphLines.length > 0) break
      continue
    }

    if (!isParagraphCandidateLine(line)) {
      if (paragraphLines.length > 0) break
      continue
    }

    paragraphLines.push(line)
  }

  if (paragraphLines.length === 0) {
    throw new Error(`TL;DR section must contain at least one paragraph${sectionContext(caseId)}`)
  }

  const summary = stripMarkdown(paragraphLines.join(" "))
  if (summary.length === 0) {
    throw new Error(`Unable to extract summary from TL;DR section${sectionContext(caseId)}`)
  }

  return summary
}

function toSectionIdMap(caseId?: string): Map<string, PortfolioSectionId> {
  return new Map(
    PORTFOLIO_BODY_SECTIONS.map((section) => {
      if (!section.heading.trim()) {
        throw new Error(`Invalid portfolio section heading configuration${sectionContext(caseId)}`)
      }

      return [section.heading, section.id]
    })
  )
}

export function parsePortfolioCaseBody(
  body: string,
  options: { caseId?: string } = {}
): ParsedPortfolioCaseBody {
  const { caseId } = options
  const normalizedBody = body.replace(/\r\n/g, "\n").trim()
  if (!normalizedBody) {
    throw new Error(`Portfolio body is empty${sectionContext(caseId)}`)
  }

  const headingToId = toSectionIdMap(caseId)
  const lines = normalizedBody.split("\n")
  const sectionMarkdownMap = new Map<PortfolioSectionId, string>()

  let activeSectionId: PortfolioSectionId | null = null
  let activeSectionHeading = ""
  let activeBuffer: string[] = []
  let expectedSectionIndex = 0
  let fenceState: FenceState | null = null

  const flushSection = () => {
    if (!activeSectionId) return

    const markdown = activeBuffer.join("\n").trim()
    if (markdown.length === 0) {
      throw new Error(
        `Section "${activeSectionHeading}" must contain markdown content${sectionContext(caseId)}`
      )
    }

    sectionMarkdownMap.set(activeSectionId, markdown)
    activeBuffer = []
  }

  for (const line of lines) {
    if (fenceState) {
      activeBuffer.push(line)

      if (isClosingFence(line, fenceState)) {
        fenceState = null
      }

      continue
    }

    const openingFenceState = readFenceState(line)
    if (openingFenceState) {
      if (!activeSectionId) {
        throw new Error(
          `Portfolio body must start with "## ${PORTFOLIO_BODY_SECTIONS[0].heading}"${sectionContext(caseId)}`
        )
      }

      activeBuffer.push(line)
      fenceState = openingFenceState
      continue
    }

    const headingMatch = line.match(/^##\s+(.+?)\s*$/)
    if (headingMatch) {
      const headingText = headingMatch[1].trim()
      const sectionId = headingToId.get(headingText)
      const expectedSection = PORTFOLIO_BODY_SECTIONS[expectedSectionIndex]

      if (!sectionId) {
        throw new Error(`Unexpected H2 heading "${headingText}"${sectionContext(caseId)}`)
      }

      if (!expectedSection || expectedSection.heading !== headingText) {
        const expectedHeading = expectedSection?.heading ?? "(no more sections expected)"
        throw new Error(
          `Invalid section order: expected "${expectedHeading}" but got "${headingText}"${sectionContext(caseId)}`
        )
      }

      flushSection()
      activeSectionId = sectionId
      activeSectionHeading = headingText
      expectedSectionIndex += 1
      continue
    }

    if (!activeSectionId) {
      if (line.trim().length === 0) continue
      throw new Error(
        `Portfolio body must start with "## ${PORTFOLIO_BODY_SECTIONS[0].heading}"${sectionContext(caseId)}`
      )
    }

    activeBuffer.push(line)
  }

  flushSection()

  if (sectionMarkdownMap.size !== PORTFOLIO_BODY_SECTIONS.length) {
    const missingHeadings = PORTFOLIO_BODY_SECTIONS.filter(
      (section) => !sectionMarkdownMap.has(section.id)
    )
      .map((section) => section.heading)
      .join(", ")

    throw new Error(`Missing required sections: ${missingHeadings}${sectionContext(caseId)}`)
  }

  const sections = PORTFOLIO_BODY_SECTIONS.map((section) => {
    const markdown = sectionMarkdownMap.get(section.id)
    if (!markdown) {
      throw new Error(
        `Missing markdown for required section "${section.heading}"${sectionContext(caseId)}`
      )
    }

    return {
      id: section.id,
      heading: section.heading,
      markdown,
    }
  })
  const tldrMarkdown = sectionMarkdownMap.get("tldr")
  if (!tldrMarkdown) {
    throw new Error(`Missing TL;DR section${sectionContext(caseId)}`)
  }

  return {
    summary: extractSummaryFromTldr(tldrMarkdown, caseId),
    sections,
  }
}
