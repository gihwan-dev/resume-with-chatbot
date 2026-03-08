import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { ComponentProps } from "react"
import { sortSourcesBySection } from "@/lib/evidence-sort"
import { cn } from "@/lib/utils"
import { SourceCarousel } from "./source-carousel"
import type { Source } from "./types"

export interface AnswerSource {
  type: "obsidian" | "resume"
  title: string
  id?: string
}

export interface AnswerToolArgs {
  answer: string
  sources: AnswerSource[]
  confidence: "high" | "medium" | "low"
}

interface AnswerMessageContentProps extends AnswerToolArgs {
  className?: string
}

interface ToolCallPartLike {
  type: string
  toolName?: string
  args?: unknown
  result?: unknown
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  obsidian: "Obsidian 문서",
  resume: "이력서",
}

function normalizeAnswerSources(value: unknown): AnswerSource[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .filter((item) => item.type === "obsidian" || item.type === "resume")
    .filter((item) => typeof item.title === "string")
    .map((item) => ({
      type: item.type as "obsidian" | "resume",
      title: item.title as string,
      ...(typeof item.id === "string" ? { id: item.id } : {}),
    }))
}

export function extractLatestAnswerToolArgs(
  content: ReadonlyArray<ToolCallPartLike>
): AnswerToolArgs | null {
  for (let i = content.length - 1; i >= 0; i--) {
    const part = content[i]
    if (part.type !== "tool-call" || part.toolName !== "answer") continue

    const fromArgs = parseAnswerToolPayload(part.args)
    if (fromArgs) return fromArgs

    const fromResult = parseAnswerToolPayload(part.result)
    if (fromResult) return fromResult
  }

  return null
}

export function extractLatestCompletedAnswerToolArgs(
  content: ReadonlyArray<ToolCallPartLike>,
  messageStatusType?: string
): AnswerToolArgs | null {
  if (messageStatusType !== "complete") return null
  return extractLatestAnswerToolArgs(content)
}

function parseAnswerToolPayload(payload: unknown): AnswerToolArgs | null {
  if (!payload || typeof payload !== "object") return null

  const candidates: Array<Record<string, unknown>> = [payload as Record<string, unknown>]
  const payloadRecord = payload as Record<string, unknown>

  for (const nestedKey of ["output", "result", "data"] as const) {
    const nested = payloadRecord[nestedKey]
    if (nested && typeof nested === "object") {
      candidates.push(nested as Record<string, unknown>)
    }
  }

  for (const candidate of candidates) {
    const answer = typeof candidate.answer === "string" ? candidate.answer.trim() : ""
    if (!answer) continue

    const confidence =
      candidate.confidence === "high" ||
      candidate.confidence === "medium" ||
      candidate.confidence === "low"
        ? candidate.confidence
        : "low"

    return {
      answer,
      sources: normalizeAnswerSources(candidate.sources),
      confidence,
    }
  }

  return null
}

function toSourceCarouselItems(answerSources: AnswerSource[]): Source[] {
  const sortedAnswerSources = sortSourcesBySection(answerSources)
  return sortedAnswerSources.map((source, index) => ({
    id: source.id ?? `source-${index}`,
    title: source.title,
    content: SOURCE_TYPE_LABELS[source.type] ?? source.type,
    category: SOURCE_TYPE_LABELS[source.type] ?? source.type,
    sourceType: source.type,
    previewAvailable: source.type === "obsidian" && Boolean(source.id),
  }))
}

const answerMarkdownComponents = {
  strong: ({ ...props }: ComponentProps<"strong">) => (
    <strong className="font-semibold" {...props} />
  ),
  p: ({ ...props }: ComponentProps<"p">) => (
    <p className="my-2 leading-relaxed first:mt-0 last:mb-0" {...props} />
  ),
  ul: ({ ...props }: ComponentProps<"ul">) => (
    <ul className="my-2 ml-4 list-disc [&>li]:mt-1" {...props} />
  ),
  ol: ({ ...props }: ComponentProps<"ol">) => (
    <ol className="my-2 ml-4 list-decimal [&>li]:mt-1" {...props} />
  ),
  li: ({ ...props }: ComponentProps<"li">) => <li className="leading-relaxed" {...props} />,
  a: ({ ...props }: ComponentProps<"a">) => (
    <a className="text-primary underline underline-offset-2 hover:text-primary/80" {...props} />
  ),
  code: ({ ...props }: ComponentProps<"code">) => (
    <code
      className="rounded-md border border-border/50 bg-muted/50 px-1 py-0.5 font-mono text-[0.85em]"
      {...props}
    />
  ),
}

export function AnswerMessageContent({
  answer,
  sources,
  className,
}: AnswerMessageContentProps) {
  const hasAnswer = answer.trim().length > 0
  if (!hasAnswer) return null

  const sourceItems = toSourceCarouselItems(sources)

  return (
    <div className={cn("mt-2", className)}>
      <div className="text-sm text-foreground leading-relaxed">
        <Markdown remarkPlugins={[remarkGfm]} components={answerMarkdownComponents}>
          {answer}
        </Markdown>
      </div>
      {sourceItems.length > 0 ? <SourceCarousel sources={sourceItems} /> : null}
    </div>
  )
}
