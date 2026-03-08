export const prerender = false

import { parseResumeVariant } from "@/lib/resume/variant"
import { readDocumentContent } from "@/lib/work-agent/obsidian.server"

function tokenizeSummary(summary: string): string[] {
  return summary
    .toLowerCase()
    .split(/[^a-z0-9가-힣]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2)
    .slice(0, 8)
}

function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith("---")) return markdown
  const endIndex = markdown.indexOf("\n---", 3)
  if (endIndex === -1) return markdown
  return markdown.slice(endIndex + 4)
}

function toPlainLine(line: string): string {
  return line
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .trim()
}

function extractMeaningfulLines(markdown: string): string[] {
  const withoutFrontmatter = stripFrontmatter(markdown)
  const lines = withoutFrontmatter.split("\n")
  const meaningfulLines: string[] = []
  let inCodeBlock = false

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue

    if (
      !line ||
      line.startsWith("#") ||
      line.startsWith("![") ||
      line.startsWith("![[") ||
      line.startsWith("---") ||
      line.startsWith("|")
    ) {
      continue
    }

    const plainLine = toPlainLine(line)
    if (plainLine.length === 0) continue
    meaningfulLines.push(plainLine)
  }

  return meaningfulLines
}

function truncateText(text: string, maxLength = 240): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trim()}...`
}

export function buildExcerpt(content: string, summary: string): string {
  const lines = extractMeaningfulLines(content)
  if (lines.length === 0) return "본문 발췌를 찾지 못했습니다."

  const summaryKeywords = tokenizeSummary(summary)
  const summaryMatchedLine = lines.find((line) =>
    summaryKeywords.some((keyword) => line.toLowerCase().includes(keyword))
  )

  return truncateText(summaryMatchedLine ?? lines[0])
}

export const GET = async ({ request }: { request: Request }) => {
  const url = new URL(request.url)
  const id = url.searchParams.get("id")?.trim()
  parseResumeVariant(url.searchParams.get("variant"))

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing source id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const document = readDocumentContent(id)
  if (!document) {
    return new Response(JSON.stringify({ error: "Source not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }

  const summary = document.summary?.trim() || "요약 정보가 없습니다."
  const excerpt = buildExcerpt(document.content, summary)

  return new Response(
    JSON.stringify({
      id: document.id,
      sourceType: "obsidian",
      title: document.title,
      category: document.category,
      path: document.path,
      summary,
      excerpt,
      tags: document.tags,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  )
}
