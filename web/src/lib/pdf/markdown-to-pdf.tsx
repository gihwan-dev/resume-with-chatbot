import { Link, Text, View } from "@react-pdf/renderer"
import { styles } from "./styles"

type PdfNode = React.JSX.Element

interface InlineSegment {
  text: string
  bold?: boolean
  code?: boolean
  link?: string
  highlight?: boolean
  parLabel?: "Problem" | "Action" | "Result"
}

const PAR_LABELS = ["Problem", "Action", "Result"] as const
type ParLabel = (typeof PAR_LABELS)[number]

const parStyles: Record<ParLabel, typeof styles.parProblemLabel> = {
  Problem: styles.parProblemLabel,
  Action: styles.parActionLabel,
  Result: styles.parResultLabel,
}

function isParLabel(text: string): ParLabel | null {
  const trimmed = text.trim()
  for (const label of PAR_LABELS) {
    if (trimmed === label) return label
  }
  return null
}

function parseInline(text: string): InlineSegment[] {
  const segments: InlineSegment[] = []
  // Regex handles: **[text](url)**, **text**, [text](url), <mark>text</mark>, `code`
  const re =
    /\*\*\[([^\]]+)\]\(([^)]+)\)\*\*|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)|<mark>([^<]+)<\/mark>|`([^`]+)`/g
  let lastIndex = 0
  let match: RegExpExecArray | null = re.exec(text)

  while (match !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index) })
    }

    if (match[1] !== undefined) {
      // **[text](url)** — bold link
      segments.push({ text: match[1], bold: true, link: match[2] })
    } else if (match[3] !== undefined) {
      // **text** — bold or PAR label; re-parse for backtick code inside bold
      const par = isParLabel(match[3])
      if (par) {
        segments.push({ text: match[3], bold: true, parLabel: par })
      } else if (match[3].includes("`")) {
        const codeRe = /`([^`]+)`/g
        let boldLastIndex = 0
        let codeMatch: RegExpExecArray | null = codeRe.exec(match[3])
        while (codeMatch !== null) {
          if (codeMatch.index > boldLastIndex) {
            segments.push({ text: match[3].slice(boldLastIndex, codeMatch.index), bold: true })
          }
          segments.push({ text: codeMatch[1], bold: true, code: true })
          boldLastIndex = codeMatch.index + codeMatch[0].length
          codeMatch = codeRe.exec(match[3])
        }
        if (boldLastIndex < match[3].length) {
          segments.push({ text: match[3].slice(boldLastIndex), bold: true })
        }
      } else {
        segments.push({ text: match[3], bold: true })
      }
    } else if (match[4] !== undefined) {
      // [text](url) — link
      segments.push({ text: match[4], link: match[5] })
    } else if (match[6] !== undefined) {
      // <mark>text</mark> — highlight
      segments.push({ text: match[6], highlight: true })
    } else if (match[7] !== undefined) {
      // `code` — inline code
      segments.push({ text: match[7], code: true })
    }

    lastIndex = match.index + match[0].length
    match = re.exec(text)
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) })
  }

  return segments
}

function renderInline(segments: InlineSegment[], key: string): PdfNode {
  return (
    <Text key={key}>
      {segments.map((seg, i) => {
        const segKey = `${key}-s${i}`
        if (seg.link) {
          return (
            <Link key={segKey} src={seg.link} style={styles.link}>
              <Text style={seg.bold ? styles.mdBold : undefined}>{seg.text}</Text>
            </Link>
          )
        }
        if (seg.parLabel) {
          return (
            <Text key={segKey} style={parStyles[seg.parLabel]}>
              {seg.text}
            </Text>
          )
        }
        if (seg.bold && seg.code) {
          return (
            <Text key={segKey} style={[styles.mdBold, styles.mdCode]}>
              {seg.text}
            </Text>
          )
        }
        if (seg.bold) {
          return (
            <Text key={segKey} style={styles.mdBold}>
              {seg.text}
            </Text>
          )
        }
        if (seg.code) {
          return (
            <Text key={segKey} style={styles.mdCode}>
              {seg.text}
            </Text>
          )
        }
        if (seg.highlight) {
          return (
            <Text key={segKey} style={styles.mdHighlight}>
              {seg.text}
            </Text>
          )
        }
        return <Text key={segKey}>{seg.text}</Text>
      })}
    </Text>
  )
}

export function markdownToPdf(markdown: string): PdfNode[] {
  const lines = markdown.split("\n")
  const nodes: PdfNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // Skip empty lines
    if (trimmed === "") {
      i++
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      nodes.push(<View key={`hr-${i}`} style={styles.mdHr} />)
      i++
      continue
    }

    // H4: #### heading
    if (trimmed.startsWith("#### ")) {
      const content = trimmed.slice(5)
      const segments = parseInline(content)
      nodes.push(
        <View key={`h4-${i}`} style={styles.mdH4}>
          {renderInline(segments, `h4t-${i}`)}
        </View>
      )
      i++
      continue
    }

    // H3: ### heading
    if (trimmed.startsWith("### ")) {
      const content = trimmed.slice(4)
      const segments = parseInline(content)
      nodes.push(
        <View key={`h3-${i}`} style={styles.mdH3}>
          {renderInline(segments, `h3t-${i}`)}
        </View>
      )
      i++
      continue
    }

    // Ordered list: 1. item
    const olMatch = trimmed.match(/^(\d+)\.\s+(.+)/)
    if (olMatch) {
      const segments = parseInline(olMatch[2])
      nodes.push(
        <View key={`ol-${i}`} style={styles.mdBulletRow}>
          <Text style={styles.mdBulletMarker}>{olMatch[1]}.</Text>
          <View style={styles.mdBulletContent}>{renderInline(segments, `olt-${i}`)}</View>
        </View>
      )
      i++
      continue
    }

    // Unordered list: * item or - item (but not ---)
    const ulMatch = trimmed.match(/^[*-]\s+(.+)/)
    if (ulMatch) {
      const segments = parseInline(ulMatch[1])
      nodes.push(
        <View key={`ul-${i}`} style={styles.mdBulletRow}>
          <Text style={styles.mdBulletMarker}>•</Text>
          <View style={styles.mdBulletContent}>{renderInline(segments, `ult-${i}`)}</View>
        </View>
      )
      i++
      continue
    }

    // Regular paragraph
    const segments = parseInline(trimmed)
    nodes.push(
      <View key={`p-${i}`} style={styles.mdParagraph}>
        {renderInline(segments, `pt-${i}`)}
      </View>
    )
    i++
  }

  return nodes
}
