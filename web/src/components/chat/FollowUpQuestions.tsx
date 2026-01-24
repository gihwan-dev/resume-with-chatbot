import { MessageSquarePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FollowUpQuestionsProps {
  questions: string[]
  onQuestionClick: (question: string) => void
  isLoading?: boolean
  className?: string
}

export function FollowUpQuestions({
  questions,
  onQuestionClick,
  isLoading = false,
  className,
}: FollowUpQuestionsProps) {
  if (questions.length === 0 && !isLoading) return null

  return (
    <div className={cn("flex flex-col gap-1.5 mt-1", className)}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MessageSquarePlus className="w-3.5 h-3.5" />
        <span>이어서 물어보기</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {isLoading ? (
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-7 w-24 bg-muted rounded-md animate-pulse" />
            ))}
          </div>
        ) : (
          questions.map((question) => (
            <Button
              key={question}
              variant="secondary"
              size="sm"
              className="h-auto py-1.5 px-2.5 text-xs font-normal whitespace-normal text-left"
              onClick={() => onQuestionClick(question)}
            >
              {question}
            </Button>
          ))
        )}
      </div>
    </div>
  )
}
