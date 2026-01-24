import { Bot, Code, FolderOpen, Lightbulb, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SUGGESTED_QUESTIONS } from "@/lib/chat-utils"
import { cn } from "@/lib/utils"
import type { SuggestedQuestion } from "./types"

interface WelcomeScreenProps {
  onQuestionClick: (question: string) => void
  className?: string
}

const iconMap: Record<string, typeof Code> = {
  code: Code,
  users: Users,
  folder: FolderOpen,
  lightbulb: Lightbulb,
}

function QuestionButton({
  question,
  onClick,
}: {
  question: SuggestedQuestion
  onClick: () => void
}) {
  const Icon = question.icon ? iconMap[question.icon] : Code

  return (
    <Button
      variant="outline"
      className="h-auto py-2 px-3 justify-start text-left text-sm font-normal hover:bg-accent"
      onClick={onClick}
    >
      <Icon className="w-4 h-4 mr-2 shrink-0 text-muted-foreground" />
      <span>{question.text}</span>
    </Button>
  )
}

export function WelcomeScreen({ onQuestionClick, className }: WelcomeScreenProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center h-full px-4 overflow-y-auto scrollbar-hide py-8", className)}>
      <div className="flex flex-col items-center text-center mb-8 shrink-0">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 shadow-sm ring-1 ring-primary/10">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2 tracking-tight">Resume Bot</h3>
        <p className="text-sm text-muted-foreground/80 max-w-[240px] leading-relaxed">
          이력서에 대해 궁금한 점이 있으신가요?
          <br />
          아래 질문 중 하나를 선택해 보세요.
        </p>
      </div>

      <div className="w-full max-w-[320px] flex flex-col gap-4 shrink-0">
        <div className="grid grid-cols-1 gap-2.5">
          {SUGGESTED_QUESTIONS.map((question) => (
            <QuestionButton
              key={question.id}
              question={question}
              onClick={() => onQuestionClick(question.text)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
