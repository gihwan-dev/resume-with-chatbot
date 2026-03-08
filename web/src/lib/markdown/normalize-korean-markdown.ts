const STRONG_BEFORE_HANGUL_PATTERN = /(^|[^\p{L}\p{N}*])\*\*([^*]+)\*\*(?=[가-힣])/gu

type FenceState = {
  marker: "`" | "~"
  length: number
}

function normalizeStrongBeforeHangul(text: string): string {
  return text.replace(STRONG_BEFORE_HANGUL_PATTERN, "$1<strong>$2</strong>")
}

function normalizeInlineMarkdown(text: string): string {
  let result = ""
  let plainStart = 0
  let index = 0
  let inlineCodeDelimiter: string | null = null

  while (index < text.length) {
    if (inlineCodeDelimiter === null) {
      if (text[index] !== "`") {
        index += 1
        continue
      }

      const delimiterStart = index
      while (index < text.length && text[index] === "`") {
        index += 1
      }
      const delimiter = text.slice(delimiterStart, index)

      result += normalizeStrongBeforeHangul(text.slice(plainStart, delimiterStart))
      result += delimiter
      inlineCodeDelimiter = delimiter
      plainStart = index
      continue
    }

    if (text.startsWith(inlineCodeDelimiter, index)) {
      const delimiterEnd = index + inlineCodeDelimiter.length
      result += text.slice(plainStart, delimiterEnd)
      index = delimiterEnd
      plainStart = index
      inlineCodeDelimiter = null
      continue
    }

    index += 1
  }

  if (plainStart < text.length) {
    const trailingText = text.slice(plainStart)
    result += inlineCodeDelimiter ? trailingText : normalizeStrongBeforeHangul(trailingText)
  }

  return result
}

function readFenceState(line: string): FenceState | null {
  const trimmed = line.trimStart()
  const match = /^(`{3,}|~{3,})(?![`~])/.exec(trimmed)
  if (!match) return null

  const marker = match[1][0] as "`" | "~"
  return {
    marker,
    length: match[1].length,
  }
}

function isClosingFence(line: string, fenceState: FenceState): boolean {
  const trimmed = line.trimStart()
  const closingFencePattern = new RegExp(`^${fenceState.marker}{${fenceState.length},}\\s*$`)
  return closingFencePattern.test(trimmed)
}

export function normalizeKoreanMarkdown(markdown: string): string {
  const lines = markdown.split("\n")
  const normalizedLines: string[] = []
  let fenceState: FenceState | null = null

  for (const line of lines) {
    if (fenceState) {
      normalizedLines.push(line)
      if (isClosingFence(line, fenceState)) {
        fenceState = null
      }
      continue
    }

    const nextFenceState = readFenceState(line)
    if (nextFenceState) {
      fenceState = nextFenceState
      normalizedLines.push(line)
      continue
    }

    normalizedLines.push(normalizeInlineMarkdown(line))
  }

  return normalizedLines.join("\n")
}
