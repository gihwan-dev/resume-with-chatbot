const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const ISO_DATE_PREFIX_PATTERN = /^(\d{4}-\d{2}-\d{2})(?:[T\s].*)?$/
const PATH_DATE_PATTERN = /(\d{4}-\d{2}-\d{2})/

function normalizeIsoDate(rawValue) {
  if (!rawValue) return null
  const trimmedValue = String(rawValue)
    .trim()
    .replace(/^['"]|['"]$/g, "")
  if (ISO_DATE_PATTERN.test(trimmedValue)) return trimmedValue
  const prefixMatch = trimmedValue.match(ISO_DATE_PREFIX_PATTERN)
  if (prefixMatch?.[1]) return prefixMatch[1]

  const parsedDate = new Date(trimmedValue)
  if (Number.isNaN(parsedDate.getTime())) return null
  return parsedDate.toISOString().slice(0, 10)
}

function extractFrontmatter(content) {
  if (!content.startsWith("---")) return null
  const frontmatterEnd = content.indexOf("\n---", 3)
  if (frontmatterEnd === -1) return null
  return content.slice(3, frontmatterEnd).trim()
}

function readFrontmatterField(frontmatter, fieldName) {
  if (!frontmatter) return null
  const pattern = new RegExp(`^${fieldName}\\s*:\\s*(.+)$`, "im")
  const match = frontmatter.match(pattern)
  return normalizeIsoDate(match?.[1] ?? null)
}

function extractPathDate(relativePath) {
  const match = relativePath.match(PATH_DATE_PATTERN)
  return normalizeIsoDate(match?.[1] ?? null)
}

export function extractVaultDateMeta(content, relativePath) {
  const frontmatter = extractFrontmatter(content)
  const frontmatterDate = readFrontmatterField(frontmatter, "date")
  const frontmatterUpdated = readFrontmatterField(frontmatter, "updated")
  const pathDate = extractPathDate(relativePath)

  const eventDate = frontmatterDate ?? frontmatterUpdated ?? pathDate ?? undefined
  const updatedAt = frontmatterUpdated ?? frontmatterDate ?? pathDate ?? undefined

  return {
    eventDate,
    updatedAt,
  }
}
