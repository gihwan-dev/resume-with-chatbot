import { makeAssistantToolUI } from "@assistant-ui/react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { sortSourcesBySection } from "@/lib/evidence-sort"
import { SourceCarousel } from "./source-carousel"
import type { Source } from "./types"

interface AnswerToolArgs {
  answer: string
  sources: {
    type: "obsidian" | "resume"
    title: string
    id?: string
  }[]
  confidence: "high" | "medium" | "low"
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  obsidian: "Obsidian 문서",
  resume: "이력서",
}

const answerMarkdownComponents = {
  strong: ({ ...props }: React.ComponentProps<"strong">) => (
    <strong className="font-semibold" {...props} />
  ),
  p: ({ ...props }: React.ComponentProps<"p">) => (
    <p className="my-2.5 leading-normal first:mt-0 last:mb-0" {...props} />
  ),
  ul: ({ ...props }: React.ComponentProps<"ul">) => (
    <ul className="my-2 ml-4 list-disc marker:text-muted-foreground [&>li]:mt-1" {...props} />
  ),
  ol: ({ ...props }: React.ComponentProps<"ol">) => (
    <ol className="my-2 ml-4 list-decimal marker:text-muted-foreground [&>li]:mt-1" {...props} />
  ),
  li: ({ ...props }: React.ComponentProps<"li">) => <li className="leading-normal" {...props} />,
  a: ({ ...props }: React.ComponentProps<"a">) => (
    <a className="text-primary underline underline-offset-2 hover:text-primary/80" {...props} />
  ),
  code: ({ ...props }: React.ComponentProps<"code">) => (
    <code
      className="rounded-md border border-border/50 bg-muted/50 px-1.5 py-0.5 font-mono text-[0.85em]"
      {...props}
    />
  ),
}

interface AnswerToolContentProps {
  answer?: string
  sources?: AnswerToolArgs["sources"]
}

export function AnswerToolContent({ answer, sources = [] }: AnswerToolContentProps) {
  const normalizedAnswer = answer?.trim() ?? ""
  const hasAnswer = normalizedAnswer.length > 0
  const hasSources = sources.length > 0

  if (!hasAnswer && !hasSources) return null

  const mappedSources: Source[] = hasSources
    ? sortSourcesBySection(sources).map((source, index) => ({
        id: source.id ?? `source-${index}`,
        title: source.title,
        content: SOURCE_TYPE_LABELS[source.type] ?? source.type,
        category: SOURCE_TYPE_LABELS[source.type] ?? source.type,
      }))
    : []

  return (
    <div className="space-y-3">
      {hasAnswer && (
        <div className="text-foreground text-sm leading-relaxed">
          <Markdown remarkPlugins={[remarkGfm]} components={answerMarkdownComponents}>
            {normalizedAnswer}
          </Markdown>
        </div>
      )}
      {mappedSources.length > 0 && <SourceCarousel sources={mappedSources} className="mb-0" />}
    </div>
  )
}

export const AnswerToolUI = makeAssistantToolUI<AnswerToolArgs, unknown>({
  toolName: "answer",
  render: ({ args }) => {
    return <AnswerToolContent answer={args?.answer} sources={args?.sources} />
  },
})
