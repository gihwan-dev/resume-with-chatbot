/**
 * Obsidian wiki 링크 전처리
 * [[target]] / [[target|alias]] → 표준 마크다운 링크 `[alias](#wiki/{docId})`
 * ![[image.png]] → 코드 텍스트 `📎 이미지: image.png`
 * outLinks에 매칭되지 않는 wiki 링크는 일반 텍스트(alias || target)로 치환
 */

const WIKI_LINK_PATTERN = /(!?)\[\[([^[\]\n]+?)(?:\|([^[\]\n]+?))?\]\]/g
const IMAGE_EXTENSION_PATTERN = /\.(png|jpe?g|gif|svg|webp|bmp|avif)$/i

export const WIKI_LINK_HREF_PREFIX = "#wiki/"

export interface WikiLinkRef {
  id: string
  title: string
}

function stripAnchorsAndBlocks(raw: string): string {
  return raw.split("#")[0].split("^")[0]
}

export function preprocessWikiLinks(
  markdown: string,
  outLinks: readonly WikiLinkRef[] = []
): string {
  if (!markdown) return ""

  const titleIndex = new Map<string, string>()
  for (const link of outLinks) {
    if (link?.title && link?.id) titleIndex.set(link.title.toLowerCase(), link.id)
  }

  return markdown.replace(WIKI_LINK_PATTERN, (_match, embed, rawTarget, alias) => {
    const cleanedTarget = stripAnchorsAndBlocks(String(rawTarget ?? "")).trim()
    if (!cleanedTarget) return ""

    const display =
      typeof alias === "string" && alias.trim().length > 0 ? alias.trim() : cleanedTarget

    if (embed === "!") {
      if (IMAGE_EXTENSION_PATTERN.test(cleanedTarget)) {
        return `\`📎 이미지: ${cleanedTarget}\``
      }
      return display
    }

    const docId = titleIndex.get(cleanedTarget.toLowerCase())
    if (!docId) return display

    const safeDisplay = escapeMarkdownBrackets(display)
    return `[${safeDisplay}](${WIKI_LINK_HREF_PREFIX}${encodeURIComponent(docId)})`
  })
}

function escapeMarkdownBrackets(text: string): string {
  return text.replace(/\[/g, "\\[").replace(/\]/g, "\\]")
}

export function extractWikiDocId(href: string): string | null {
  if (typeof href !== "string") return null
  if (!href.startsWith(WIKI_LINK_HREF_PREFIX)) return null
  const encoded = href.slice(WIKI_LINK_HREF_PREFIX.length)
  if (!encoded) return null
  try {
    return decodeURIComponent(encoded)
  } catch {
    return null
  }
}
