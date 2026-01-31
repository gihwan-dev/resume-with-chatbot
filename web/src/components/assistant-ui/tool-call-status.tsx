"use client"

import type { ToolCallMessagePartComponent } from "@assistant-ui/react"
import { CheckIcon, LoaderIcon } from "lucide-react"
import type { ComponentType, PropsWithChildren } from "react"
import { useThinkingProcess } from "@/components/assistant-ui/thinking-process"
import { TOOL_LABELS } from "@/lib/tool-labels"

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
  const { isOpen } = useThinkingProcess()
  if (!isOpen) return null
  return <div className="flex flex-col gap-0.5 py-0.5">{children}</div>
}
