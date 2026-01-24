/**
 * PII patterns to mask
 */
const PII_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Email addresses
  {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: "[EMAIL_REDACTED]",
  },

  // API keys (common formats)
  {
    pattern: /\b(sk-[a-zA-Z0-9]{20,})\b/g,
    replacement: "[API_KEY_REDACTED]",
  },
  {
    pattern: /\b(api[_-]?key[_-]?[=:]?\s*['"]?)[a-zA-Z0-9_-]{20,}['"]?/gi,
    replacement: "$1[API_KEY_REDACTED]",
  },
  {
    pattern: /\b(OPENAI_API_KEY|ANTHROPIC_API_KEY|GOOGLE_API_KEY)[=:]\s*['"]?[a-zA-Z0-9_-]+['"]?/gi,
    replacement: "$1=[API_KEY_REDACTED]",
  },

  // AWS Access Keys
  {
    pattern: /\b(AKIA[0-9A-Z]{16})\b/g,
    replacement: "[AWS_KEY_REDACTED]",
  },

  // Phone numbers (various formats)
  {
    pattern: /\b(\+?1?[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
    replacement: "[PHONE_REDACTED]",
  },
  // Korean phone numbers
  {
    pattern: /\b01[0-9][-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4}\b/g,
    replacement: "[PHONE_REDACTED]",
  },

  // JWT tokens
  {
    pattern: /\beyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g,
    replacement: "[JWT_REDACTED]",
  },

  // Bearer tokens
  {
    pattern: /\b(Bearer\s+)[A-Za-z0-9_-]{20,}/gi,
    replacement: "$1[TOKEN_REDACTED]",
  },

  // Credit card numbers (basic pattern)
  {
    pattern: /\b[0-9]{4}[-\s]?[0-9]{4}[-\s]?[0-9]{4}[-\s]?[0-9]{4}\b/g,
    replacement: "[CARD_REDACTED]",
  },

  // Social Security Numbers
  {
    pattern: /\b[0-9]{3}[-\s]?[0-9]{2}[-\s]?[0-9]{4}\b/g,
    replacement: "[SSN_REDACTED]",
  },

  // IP addresses
  {
    pattern: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    replacement: "[IP_REDACTED]",
  },

  // Private keys / certificates
  {
    pattern: /-----BEGIN [A-Z ]+-----[\s\S]*?-----END [A-Z ]+-----/g,
    replacement: "[PRIVATE_KEY_REDACTED]",
  },

  // Password patterns
  {
    pattern: /(password|passwd|pwd)[=:]\s*['"]?[^\s'"]{6,}['"]?/gi,
    replacement: "$1=[PASSWORD_REDACTED]",
  },

  // Secret patterns
  {
    pattern: /(secret|token|credential)[=:]\s*['"]?[^\s'"]{10,}['"]?/gi,
    replacement: "$1=[SECRET_REDACTED]",
  },
]

/**
 * Mask PII in a string
 */
export function maskPII(content: string): string {
  let masked = content

  for (const { pattern, replacement } of PII_PATTERNS) {
    // Reset regex state for global patterns
    pattern.lastIndex = 0
    masked = masked.replace(pattern, replacement)
  }

  return masked
}

/**
 * Check if content contains potential PII
 */
export function containsPII(content: string): boolean {
  for (const { pattern } of PII_PATTERNS) {
    pattern.lastIndex = 0
    if (pattern.test(content)) {
      return true
    }
  }
  return false
}

/**
 * Get a summary of PII types found in content
 */
export function detectPIITypes(content: string): string[] {
  const types: string[] = []

  const checks = [
    { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, type: "email" },
    { pattern: /\bsk-[a-zA-Z0-9]{20,}\b/g, type: "api_key" },
    { pattern: /\beyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g, type: "jwt" },
    { pattern: /-----BEGIN [A-Z ]+-----/g, type: "private_key" },
  ]

  for (const { pattern, type } of checks) {
    pattern.lastIndex = 0
    if (pattern.test(content)) {
      types.push(type)
    }
  }

  return types
}
