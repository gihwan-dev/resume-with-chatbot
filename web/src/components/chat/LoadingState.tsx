import { Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface LoadingStateProps {
  status: "searching" | "generating"
  className?: string
}

export function LoadingState({ status, className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col gap-2 max-w-[90%]", className)}>
      {/* Search status indicator */}
      {status === "searching" && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
          <Search className="w-3.5 h-3.5" />
          <span>관련 경험을 찾고 있어요...</span>
        </div>
      )}

      {/* Skeleton for sources */}
      {status === "searching" && (
        <div className="flex gap-2 overflow-hidden">
          <Skeleton className="h-20 w-[200px] shrink-0 rounded-lg" />
          <Skeleton className="h-20 w-[200px] shrink-0 rounded-lg" />
        </div>
      )}

      {/* Skeleton for message content */}
      <div className="rounded-lg px-3 py-2 bg-muted">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[70%]" />
        </div>
      </div>

      {/* Generating indicator */}
      {status === "generating" && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="flex gap-0.5">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
          </span>
          <span>답변을 생성하고 있어요...</span>
        </div>
      )}
    </div>
  )
}
