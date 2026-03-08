export const RESUME_VARIANT_IDS = ["frontend", "ai-agent"] as const

export type ResumeVariantId = (typeof RESUME_VARIANT_IDS)[number]

export const DEFAULT_RESUME_VARIANT: ResumeVariantId = "frontend"

export interface ResumeVariantMeta {
  id: ResumeVariantId
  path: string
  label: string
  pageTitle: string
  pageDescription: string
}

export const RESUME_VARIANT_META: Record<ResumeVariantId, ResumeVariantMeta> = {
  frontend: {
    id: "frontend",
    path: "/",
    label: "Frontend",
    pageTitle: "Frontend Resume",
    pageDescription:
      "최기환의 프론트엔드 이력서입니다. 성능 최적화, 대규모 데이터 UI, 아키텍처 설계 경험을 확인할 수 있습니다.",
  },
  "ai-agent": {
    id: "ai-agent",
    path: "/ai-agent",
    label: "AI Agent",
    pageTitle: "AI Agent Resume",
    pageDescription:
      "최기환의 AI Agent 개발 이력서입니다. MCP 서버 개발, AI 자동화 파이프라인, RAG 챗봇 구축 경험을 담았습니다.",
  },
}

function normalizeVariantInput(input: string | null | undefined): string {
  return input?.trim().toLowerCase() ?? ""
}

export function parseResumeVariant(input: string | null | undefined): ResumeVariantId {
  const normalized = normalizeVariantInput(input)
  return normalized === "ai-agent" ? "ai-agent" : DEFAULT_RESUME_VARIANT
}

export function getResumeVariantMeta(variantInput: string | null | undefined): ResumeVariantMeta {
  const variant = parseResumeVariant(variantInput)
  return RESUME_VARIANT_META[variant]
}

function normalizePathname(pathname: string): string {
  if (!pathname) return "/"
  const trimmed = pathname.trim()
  if (trimmed === "/") return "/"
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed
}

export function isResumeRoutePath(pathname: string): boolean {
  const normalized = normalizePathname(pathname)
  return normalized === "/" || normalized === "/ai-agent"
}

export function parseResumeVariantFromPath(pathname: string): ResumeVariantId {
  const normalized = normalizePathname(pathname)
  return normalized === "/ai-agent" ? "ai-agent" : DEFAULT_RESUME_VARIANT
}
