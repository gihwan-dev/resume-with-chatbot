import { cn } from "@/lib/utils"
import { FollowUpQuestions } from "./FollowUpQuestions"
import { MarkdownRenderer } from "./MarkdownRenderer"
import { SourceCarousel } from "./SourceCarousel"
import type { Source } from "./types"

interface AssistantMessageProps {
  content: string
  sources?: Source[]
  followUpQuestions?: string[]
  onFollowUpClick?: (question: string) => void
  isLatest?: boolean
  className?: string
}

export function AssistantMessage({
  content,
  sources = [],
  followUpQuestions = [],
  onFollowUpClick,
  isLatest = false,
  className,
}: AssistantMessageProps) {
  return (
    <div className={cn("flex flex-col gap-2 max-w-[90%]", className)}>
      {/* Sources carousel */}
      {sources.length > 0 && <SourceCarousel sources={sources} />}

      {/* Message content */}
      <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm bg-muted/50 border border-primary/5 shadow-sm text-foreground/90 leading-relaxed">
        <MarkdownRenderer content={content} />
      </div>

      {/* Follow-up questions (only for latest message) */}
      {isLatest && followUpQuestions.length > 0 && onFollowUpClick && (
        <FollowUpQuestions questions={followUpQuestions} onQuestionClick={onFollowUpClick} />
      )}
    </div>
  )
}
