import { FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { truncateText } from "@/lib/chat-utils"
import { cn } from "@/lib/utils"
import type { Source } from "./types"

interface SourceCardProps {
  source: Source
  className?: string
}

export function SourceCard({ source, className }: SourceCardProps) {
  return (
    <Card
      className={cn(
        "min-w-[200px] max-w-[220px] cursor-pointer transition-colors hover:bg-accent/50",
        className
      )}
    >
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
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          {source.category}
        </Badge>
      </CardContent>
    </Card>
  )
}
