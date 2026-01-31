import { FileTextIcon, ListTodoIcon, SearchIcon } from "lucide-react"
import type { ComponentType } from "react"

export const TOOL_LABELS: Record<
  string,
  { icon: ComponentType<{ className?: string }>; label: string }
> = {
  searchNotion: { icon: SearchIcon, label: "Notion 검색" },
  getNotionPage: { icon: FileTextIcon, label: "Notion 페이지 조회" },
  searchClickUpTasks: { icon: ListTodoIcon, label: "ClickUp 작업 검색" },
  searchClickUpDocs: { icon: SearchIcon, label: "ClickUp 문서 검색" },
}
