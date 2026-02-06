import { makeAssistantToolUI } from "@assistant-ui/react"
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

export const AnswerToolUI = makeAssistantToolUI<AnswerToolArgs, unknown>({
  toolName: "answer",
  render: ({ args }) => {
    if (!args?.sources?.length) return null

    const sources: Source[] = args.sources.map((s, i) => ({
      id: s.id ?? `source-${i}`,
      title: s.title,
      content: SOURCE_TYPE_LABELS[s.type] ?? s.type,
      category: SOURCE_TYPE_LABELS[s.type] ?? s.type,
    }))

    return <SourceCarousel sources={sources} />
  },
})
