import { parseISO, isValid, format } from "date-fns"

export interface NormalizedTimestamp {
  iso: string
  ms: number
}

/**
 * Normalize timestamps from various formats to ISO 8601
 * Handles:
 * - Milliseconds (13 digits)
 * - Seconds (10 digits)
 * - ISO 8601 strings
 */
export function normalizeTimestamp(
  timestamp: string | number | undefined | null
): NormalizedTimestamp {
  const now = new Date()

  if (timestamp === undefined || timestamp === null) {
    return {
      iso: now.toISOString(),
      ms: now.getTime(),
    }
  }

  // Handle numeric timestamps
  if (typeof timestamp === "number") {
    let ms: number

    // Determine if timestamp is in seconds or milliseconds
    if (timestamp > 1e12) {
      // Already in milliseconds (13+ digits)
      ms = timestamp
    } else if (timestamp > 1e9) {
      // In seconds (10 digits), convert to milliseconds
      ms = timestamp * 1000
    } else {
      // Very small number, treat as milliseconds from epoch
      ms = timestamp
    }

    const date = new Date(ms)
    if (isValid(date)) {
      return {
        iso: date.toISOString(),
        ms: date.getTime(),
      }
    }
  }

  // Handle string timestamps
  if (typeof timestamp === "string") {
    // Try parsing as ISO 8601
    const parsed = parseISO(timestamp)
    if (isValid(parsed)) {
      return {
        iso: parsed.toISOString(),
        ms: parsed.getTime(),
      }
    }

    // Try parsing as numeric string
    const numericValue = Number.parseFloat(timestamp)
    if (!Number.isNaN(numericValue)) {
      return normalizeTimestamp(numericValue)
    }

    // Try parsing with Date constructor
    const dateFromString = new Date(timestamp)
    if (isValid(dateFromString)) {
      return {
        iso: dateFromString.toISOString(),
        ms: dateFromString.getTime(),
      }
    }
  }

  // Fallback to current time
  return {
    iso: now.toISOString(),
    ms: now.getTime(),
  }
}

/**
 * Format a timestamp for display
 */
export function formatTimestamp(timestamp: string | number): string {
  const normalized = normalizeTimestamp(timestamp)
  return format(new Date(normalized.ms), "yyyy-MM-dd HH:mm:ss")
}

/**
 * Check if a timestamp is after a given date
 */
export function isAfter(timestamp: string | number, afterDate: string): boolean {
  const normalized = normalizeTimestamp(timestamp)
  const afterNormalized = normalizeTimestamp(afterDate)
  return normalized.ms >= afterNormalized.ms
}
