import { FileTextIcon, SearchIcon } from "lucide-react"
import type { ComponentType } from "react"

export const TOOL_LABELS: Record<
  string,
  { icon: ComponentType<{ className?: string }>; label: string }
> = {
  searchDocuments: { icon: SearchIcon, label: "문서 검색" },
  readDocument: { icon: FileTextIcon, label: "문서 상세 조회" },
}
