/**
 * Noise filter for filtering out system/command messages
 * that are not meaningful for portfolio/resume data collection
 */

const NOISE_PATTERNS = [
  /^<local-command/,
  /^<command-name>/,
  /^<command-message>/,
  /^<system-reminder>/,
  /^\[Request interrupted/,
  /^<local-command-stdout>/,
  /^<local-command-stderr>/,
  /^<tool-result>/,
  /^<tool-call>/,
]

/**
 * Check if a message is a noise message (system/command message)
 */
export function isNoiseMessage(content: string): boolean {
  const trimmed = content.trim()

  // Very short messages are likely noise
  if (trimmed.length < 10) {
    return true
  }

  // Check against noise patterns
  return NOISE_PATTERNS.some((pattern) => pattern.test(trimmed))
}

/**
 * Normalize content for deduplication (removes extra whitespace, newlines)
 */
export function normalizeContent(content: string): string {
  return content
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
}

/**
 * Filter out noise messages from an array
 */
export function filterNoiseMessages<T extends { content: string }>(
  messages: T[]
): { filtered: T[]; noiseRemoved: number } {
  const filtered: T[] = []
  let noiseRemoved = 0

  for (const message of messages) {
    if (isNoiseMessage(message.content)) {
      noiseRemoved++
    } else {
      filtered.push(message)
    }
  }

  return { filtered, noiseRemoved }
}
