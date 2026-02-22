import { z } from "zod"
import type {
  ImpactItem,
  ProjectStoryThread,
  StoryThreadComparison,
  StoryThreadItem,
} from "./contracts"

const nonEmptyText = z
  .string({
    required_error: "필수 문자열 필드가 누락되었습니다.",
    invalid_type_error: "문자열 타입이어야 합니다.",
  })
  .trim()
  .min(1, "빈 문자열은 허용되지 않습니다.")

export const impactItemSchema: z.ZodType<ImpactItem> = z.object({
  value: nonEmptyText,
  label: nonEmptyText,
  description: nonEmptyText,
})

export const storyThreadComparisonSchema: z.ZodType<StoryThreadComparison> = z.object({
  beforeLabel: nonEmptyText.optional(),
  afterLabel: nonEmptyText.optional(),
  before: z
    .array(nonEmptyText, {
      required_error: "comparison.before 필드가 누락되었습니다.",
      invalid_type_error: "comparison.before는 문자열 배열이어야 합니다.",
    })
    .min(1, "comparison.before는 최소 1개 이상이어야 합니다."),
  after: z
    .array(nonEmptyText, {
      required_error: "comparison.after 필드가 누락되었습니다.",
      invalid_type_error: "comparison.after는 문자열 배열이어야 합니다.",
    })
    .min(1, "comparison.after는 최소 1개 이상이어야 합니다."),
})

export const storyThreadItemSchema: z.ZodType<StoryThreadItem> = z.object({
  issueTitle: nonEmptyText,
  problems: z
    .array(nonEmptyText, {
      required_error: "problems 필드가 누락되었습니다.",
      invalid_type_error: "problems는 문자열 배열이어야 합니다.",
    })
    .min(1, "problems는 최소 1개 이상이어야 합니다."),
  thoughtProcess: nonEmptyText,
  actions: z
    .array(nonEmptyText, {
      required_error: "actions 필드가 누락되었습니다.",
      invalid_type_error: "actions는 문자열 배열이어야 합니다.",
    })
    .min(1, "actions는 최소 1개 이상이어야 합니다."),
  comparison: storyThreadComparisonSchema.optional(),
  result: nonEmptyText,
})

export const projectStoryThreadSchema: z.ZodType<ProjectStoryThread> = z.object({
  context: nonEmptyText,
  impacts: z
    .array(impactItemSchema, {
      required_error: "impacts 필드가 누락되었습니다.",
      invalid_type_error: "impacts는 배열이어야 합니다.",
    })
    .min(2, "impacts는 최소 2개 이상이어야 합니다.")
    .max(3, "impacts는 최대 3개까지 허용됩니다."),
  threads: z
    .array(storyThreadItemSchema, {
      required_error: "threads 필드가 누락되었습니다.",
      invalid_type_error: "threads는 배열이어야 합니다.",
    })
    .min(2, "threads는 최소 2개 이상이어야 합니다.")
    .max(3, "threads는 최대 3개까지 허용됩니다."),
  lessonsLearned: nonEmptyText,
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
