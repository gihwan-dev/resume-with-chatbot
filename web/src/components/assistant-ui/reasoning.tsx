"use client"

import type { ReasoningGroupComponent, ReasoningMessagePartComponent } from "@assistant-ui/react"
import type { PropsWithChildren } from "react"
import { useThinkingProcess } from "@/components/assistant-ui/thinking-process"

export const Reasoning: ReasoningMessagePartComponent = ({ text }) => {
  if (!text) return null
  return (
    <p className="whitespace-pre-wrap text-xs text-muted-foreground/70 leading-relaxed">{text}</p>
  )
}

export const ReasoningGroupWrapper: ReasoningGroupComponent = ({ children }: PropsWithChildren) => {
  const { isOpen } = useThinkingProcess()
  if (!isOpen) return null
  return <div className="border-l-2 border-muted/40 pl-3 py-1">{children}</div>
}
