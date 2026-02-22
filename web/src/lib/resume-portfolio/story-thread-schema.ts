import { z } from "zod"
import type { DecisionItem, ImpactItem, ProjectStoryThread, ValidationImpact } from "./contracts"

const nonEmptyText = z
  .string({
    required_error: "필수 문자열 필드가 누락되었습니다.",
    invalid_type_error: "문자열 타입이어야 합니다.",
  })
  .trim()
  .min(1, "빈 문자열은 허용되지 않습니다.")

const maxThreeLinesText = nonEmptyText.refine(
  (value) => value.split(/\r?\n/).filter((line) => line.trim().length > 0).length <= 3,
  "최대 3줄까지 허용됩니다."
)

export const impactItemSchema: z.ZodType<ImpactItem> = z.object({
  value: nonEmptyText,
  label: nonEmptyText,
  description: nonEmptyText,
})

export const decisionItemSchema: z.ZodType<DecisionItem> = z.object({
  title: nonEmptyText,
  whyThisChoice: nonEmptyText,
  alternative: nonEmptyText,
  tradeOff: nonEmptyText,
})

export const validationImpactSchema: z.ZodType<ValidationImpact> = z.object({
  measurementMethod: nonEmptyText,
  metrics: z
    .array(nonEmptyText, {
      required_error: "validationImpact.metrics 필드가 누락되었습니다.",
      invalid_type_error: "validationImpact.metrics는 문자열 배열이어야 합니다.",
    })
    .min(2, "validationImpact.metrics는 최소 2개 이상이어야 합니다.")
    .max(3, "validationImpact.metrics는 최대 3개까지 허용됩니다."),
  operationalImpact: nonEmptyText,
})

export const projectStoryThreadSchema: z.ZodType<ProjectStoryThread> = z.object({
  tldrSummary: nonEmptyText,
  keyMetrics: z
    .array(impactItemSchema, {
      required_error: "keyMetrics 필드가 누락되었습니다.",
      invalid_type_error: "keyMetrics는 배열이어야 합니다.",
    })
    .min(3, "keyMetrics는 정확히 3개여야 합니다.")
    .max(3, "keyMetrics는 정확히 3개여야 합니다."),
  coreApproach: nonEmptyText,
  problemDefinition: nonEmptyText,
  problemPoints: z
    .array(nonEmptyText, {
      required_error: "problemPoints 필드가 누락되었습니다.",
      invalid_type_error: "problemPoints는 문자열 배열이어야 합니다.",
    })
    .min(3, "problemPoints는 최소 3개 이상이어야 합니다.")
    .max(4, "problemPoints는 최대 4개까지 허용됩니다."),
  decisions: z
    .array(decisionItemSchema, {
      required_error: "decisions 필드가 누락되었습니다.",
      invalid_type_error: "decisions는 배열이어야 합니다.",
    })
    .min(2, "decisions는 최소 2개 이상이어야 합니다.")
    .max(3, "decisions는 최대 3개까지 허용됩니다."),
  implementationHighlights: z
    .array(nonEmptyText, {
      required_error: "implementationHighlights 필드가 누락되었습니다.",
      invalid_type_error: "implementationHighlights는 문자열 배열이어야 합니다.",
    })
    .min(3, "implementationHighlights는 최소 3개 이상이어야 합니다.")
    .max(4, "implementationHighlights는 최대 4개까지 허용됩니다."),
  validationImpact: validationImpactSchema,
  lessonsLearned: maxThreeLinesText,
})

export type StoryThreadValidationErrorCode =
  | "missing"
  | "type_mismatch"
  | "empty_array"
  | "invalid_value"

export interface StoryThreadValidationError {
  code: StoryThreadValidationErrorCode
  path: string
  message: string
}

export interface ProjectStoryThreadValidationResult {
  isValid: boolean
  errors: StoryThreadValidationError[]
}

function formatIssuePath(path: (string | number)[]): string {
  if (path.length === 0) {
    return "storyThread"
  }

  return path.reduce<string>((acc, segment) => {
    if (typeof segment === "number") {
      return `${acc}[${segment}]`
    }

    return acc ? `${acc}.${segment}` : segment
  }, "storyThread")
}

function getValueAtPath(input: unknown, path: (string | number)[]): unknown {
  let current: unknown = input

  for (const segment of path) {
    if (typeof segment === "number") {
      if (!Array.isArray(current)) return undefined
      current = current[segment]
      continue
    }

    if (!current || typeof current !== "object" || !(segment in current)) {
      return undefined
    }

    current = (current as Record<string, unknown>)[segment]
  }

  return current
}

function classifyIssue(
  issue: z.ZodIssue,
  input: unknown
): Pick<StoryThreadValidationError, "code" | "message"> {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.received === "undefined") {
      return {
        code: "missing",
        message: "필수 필드가 누락되었습니다.",
      }
    }

    return {
      code: "type_mismatch",
      message: `타입 불일치: ${issue.message}`,
    }
  }

  if (issue.code === z.ZodIssueCode.too_small && issue.type === "array") {
    const arrayValue = getValueAtPath(input, issue.path)
    if (Array.isArray(arrayValue) && arrayValue.length === 0) {
      return {
        code: "empty_array",
        message: "빈 배열은 허용되지 않습니다.",
      }
    }
  }

  return {
    code: "invalid_value",
    message: issue.message,
  }
}

export function validateProjectStoryThread(input: unknown): ProjectStoryThreadValidationResult {
  const parsed = projectStoryThreadSchema.safeParse(input)

  if (parsed.success) {
    return {
      isValid: true,
      errors: [],
    }
  }

  const errors = parsed.error.issues.map((issue) => {
    const classified = classifyIssue(issue, input)

    return {
      code: classified.code,
      path: formatIssuePath(issue.path),
      message: classified.message,
    }
  })

  return {
    isValid: false,
    errors,
  }
}
