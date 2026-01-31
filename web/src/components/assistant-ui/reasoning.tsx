"use client"

import type { ReasoningGroupComponent, ReasoningMessagePartComponent } from "@assistant-ui/react"
import { useAuiState } from "@assistant-ui/react"
import { type PropsWithChildren, useEffect } from "react"
import { useThinkingProcess } from "@/components/assistant-ui/thinking-process"

const SOURCE_ID = "reasoning"

export const Reasoning: ReasoningMessagePartComponent = ({ text }) => {
  const { setReasoningTitle } = useThinkingProcess()

  useEffect(() => {
    if (!text) return
    const matches = [...text.matchAll(/\*\*(.+?)\*\*/g)]
    if (matches.length > 0) {
      setReasoningTitle(matches[matches.length - 1][1])
    }
  }, [text, setReasoningTitle])

  if (!text) return null
  return (
    <p className="whitespace-pre-wrap text-xs text-muted-foreground/70 leading-relaxed">{text}</p>
  )
}

export const ReasoningGroupWrapper: ReasoningGroupComponent = ({ children }: PropsWithChildren) => {
  const message = useAuiState(({ message }) => message)
  const { registerSteps, unregisterSteps, isOpen } = useThinkingProcess()

  const isStreaming =
    message.status?.type === "running" || message.status?.type === "requires-action"

  useEffect(() => {
    registerSteps(SOURCE_ID, [
      {
        id: "reasoning",
        type: "reasoning",
        label: "생각 중...",
        status: isStreaming ? "running" : "complete",
      },
    ])
    return () => unregisterSteps(SOURCE_ID)
  }, [registerSteps, unregisterSteps, isStreaming])

  if (!isOpen) return null

  return <div className="border-l-2 border-muted/40 pl-3 py-1">{children}</div>
}
