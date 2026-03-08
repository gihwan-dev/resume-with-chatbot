import { FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { truncateText } from "@/lib/chat-utils"
import { cn } from "@/lib/utils"
import type { Source } from "./types"

interface SourceCardProps {
  source: Source
  className?: string
  onClick?: (source: Source) => void
  isLoading?: boolean
}

export function SourceCard({ source, className, onClick, isLoading = false }: SourceCardProps) {
  const isClickable = source.previewAvailable && typeof onClick === "function"
  const CardBody = (
    <>
      <CardHeader className="p-3 pb-1">
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
          <CardTitle className="text-xs font-medium leading-tight">
            {truncateText(source.title, 40)}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {truncateText(source.content, 80)}
        </p>
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {source.category}
          </Badge>
          {isClickable ? (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {isLoading ? "불러오는 중..." : "근거 보기"}
            </Badge>
          ) : null}
        </div>
      </CardContent>
    </>
  )

  if (isClickable) {
    return (
      <Card
        className={cn(
          "min-w-[200px] max-w-[220px] transition-colors hover:bg-accent/50",
          isLoading && "opacity-70",
          className
        )}
      >
        <button
          type="button"
          className="w-full cursor-pointer text-left"
          onClick={() => onClick?.(source)}
          disabled={isLoading}
          aria-label={`출처 ${source.title} 상세 보기`}
          data-testid={`source-card-${source.id}`}
        >
          {CardBody}
        </button>
      </Card>
    )
  }

  return (
    <Card className={cn("min-w-[200px] max-w-[220px] transition-colors", className)}>
      {CardBody}
    </Card>
  )
}
