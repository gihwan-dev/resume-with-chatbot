"use client"

import type { ToolCallMessagePartComponent } from "@assistant-ui/react"
import { useAuiState } from "@assistant-ui/react"
import { CheckIcon, FileTextIcon, ListTodoIcon, LoaderIcon, SearchIcon } from "lucide-react"
import { type ComponentType, type PropsWithChildren, useEffect, useMemo } from "react"
import { useThinkingProcess, type ThinkingStep } from "@/components/assistant-ui/thinking-process"

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
> = ({ children, startIndex, endIndex }) => {
  const message = useAuiState(({ message }) => message)
  const { registerSteps, unregisterSteps, isOpen } = useThinkingProcess()

  const sourceId = `tools-${startIndex}-${endIndex}`

  const toolSteps: ThinkingStep[] = useMemo(() => {
    const steps: ThinkingStep[] = []
    for (let i = startIndex; i < endIndex; i++) {
      const part = message.content[i]
      if (part && part.type === "tool-call") {
        const toolInfo = TOOL_LABELS[part.toolName]
        if (toolInfo) {
          const isRunning = !("result" in part) || part.status?.type === "running"
          steps.push({
            id: `tool-${part.toolName}-${i}`,
            type: "tool-call",
            label: `${toolInfo.label} 중...`,
            status: isRunning ? "running" : "complete",
          })
        }
      }
    }
    return steps
  }, [message.content, startIndex, endIndex])

  useEffect(() => {
    if (toolSteps.length > 0) {
      registerSteps(sourceId, toolSteps)
    }
    return () => unregisterSteps(sourceId)
  }, [registerSteps, unregisterSteps, sourceId, toolSteps])

  if (!isOpen) return null

  return <div className="flex flex-col gap-0.5 py-0.5">{children}</div>
}
