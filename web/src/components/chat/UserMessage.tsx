import { cn } from "@/lib/utils"

interface UserMessageProps {
  content: string
  className?: string
}

export function UserMessage({ content, className }: UserMessageProps) {
  return (
    <div
      className={cn(
        "flex w-max max-w-[85%] flex-col gap-2 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm ml-auto bg-primary text-primary-foreground shadow-sm",
        className
      )}
    >
      {content}
    </div>
  )
}
