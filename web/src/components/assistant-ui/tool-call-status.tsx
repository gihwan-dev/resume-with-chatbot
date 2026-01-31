"use client"

import type { ToolCallMessagePartComponent } from "@assistant-ui/react"
import { CheckIcon, FileTextIcon, ListTodoIcon, LoaderIcon, SearchIcon } from "lucide-react"
import type { ComponentType, PropsWithChildren } from "react"
import { cn } from "@/lib/utils"

const TOOL_LABELS: Record<string, { icon: ComponentType<{ className?: string }>; label: string }> =
  {
    searchNotion: { icon: SearchIcon, label: "Notion 검색" },
    getNotionPage: { icon: FileTextIcon, label: "Notion 페이지 조회" },
    searchClickUpTasks: { icon: ListTodoIcon, label: "ClickUp 작업 검색" },
    searchClickUpDocs: { icon: SearchIcon, label: "ClickUp 문서 검색" },
  }

export const ToolCallStatus: ToolCallMessagePartComponent = ({ toolName, status }) => {
  const tool = TOOL_LABELS[toolName]
  if (!tool) return null

  const isRunning = status?.type === "running"
  const ToolIcon = tool.icon

  return (
    <div className="flex items-center gap-2 py-0.5 text-xs text-muted-foreground">
      {isRunning ? (
        <LoaderIcon className="size-3.5 shrink-0 animate-spin" />
      ) : (
        <CheckIcon className="size-3.5 shrink-0 text-green-500" />
      )}
      <ToolIcon className="size-3.5 shrink-0" />
      <span>
        {tool.label}
        {isRunning ? " 중" : " 완료"}
      </span>
    </div>
  )
}

export const ToolGroupWrapper: ComponentType<
  PropsWithChildren<{ startIndex: number; endIndex: number }>
> = ({ children }) => {
  return (
    <div
      className={cn(
        "my-1 rounded-md border border-border/50 bg-muted/30 px-3 py-2",
        "flex flex-col gap-0.5"
      )}
    >
      {children}
    </div>
  )
}
