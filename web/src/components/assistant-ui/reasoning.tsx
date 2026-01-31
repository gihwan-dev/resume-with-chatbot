"use client"

import type { ReasoningGroupComponent, ReasoningMessagePartComponent } from "@assistant-ui/react"
import { useMessage } from "@assistant-ui/react"
import { BrainIcon, ChevronRightIcon } from "lucide-react"
import { type PropsWithChildren, useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

export const Reasoning: ReasoningMessagePartComponent = ({ text }) => {
  if (!text) return null
  return <p className="whitespace-pre-wrap text-xs text-muted-foreground leading-relaxed">{text}</p>
}

export const ReasoningGroupWrapper: ReasoningGroupComponent = ({ children }: PropsWithChildren) => {
  const message = useMessage()
  const isStreaming =
    message.status?.type === "running" || message.status?.type === "requires-action"
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="my-1">
      <CollapsibleTrigger className="flex w-full items-center gap-1.5 rounded-md px-1 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/50">
        <BrainIcon className={cn("size-3.5 shrink-0", isStreaming && "animate-pulse")} />
        <span>{isStreaming ? "생각 중..." : "사고 과정"}</span>
        <ChevronRightIcon
          className={cn(
            "ml-auto size-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-90"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent
        className={cn(
          "overflow-hidden",
          "data-[state=closed]:animate-collapsible-up",
          "data-[state=open]:animate-collapsible-down"
        )}
      >
        <div className="border-l-2 border-muted pl-3 pt-1 pb-1">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
