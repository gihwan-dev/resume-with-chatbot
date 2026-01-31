"use client"

import type { ReasoningGroupComponent, ReasoningMessagePartComponent } from "@assistant-ui/react"
import { useAuiState } from "@assistant-ui/react"
import { type PropsWithChildren, useEffect } from "react"
import { useThinkingProcess } from "@/components/assistant-ui/thinking-process"

const SOURCE_ID = "reasoning"

export const Reasoning: ReasoningMessagePartComponent = ({ text }) => {
  if (!text) return null
  return (
    <p className="whitespace-pre-wrap text-xs text-muted-foreground/70 leading-relaxed">{text}</p>
  )
}

export const ReasoningGroupWrapper: ReasoningGroupComponent = ({ children }: PropsWithChildren) => {
  const message = useAuiState(({ message }) => message)
  const { registerSteps, unregisterSteps, isOpen, setReasoningTitle } = useThinkingProcess()

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

  // 제목 추출 — isOpen 체크 전에 실행되므로 아코디언 닫혀도 동작
  useEffect(() => {
    const reasoningParts = message.content.filter(
      (p): p is { type: "reasoning"; text: string } => p.type === "reasoning"
    )
    const lastText = reasoningParts[reasoningParts.length - 1]?.text
    if (!lastText) return

    const matches = [...lastText.matchAll(/\*\*(.+?)\*\*/g)]
    if (matches.length > 0) {
      setReasoningTitle(matches[matches.length - 1][1])
    }
  }, [message.content, setReasoningTitle])

  if (!isOpen) return null

  return <div className="border-l-2 border-muted/40 pl-3 py-1">{children}</div>
}
