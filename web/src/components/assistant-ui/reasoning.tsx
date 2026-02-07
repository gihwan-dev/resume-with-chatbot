"use client"

import type { ReasoningGroupComponent, ReasoningMessagePartComponent } from "@assistant-ui/react"
import { memo, type PropsWithChildren } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useThinkingProcess } from "@/components/assistant-ui/thinking-process"

const reasoningComponents = {
  strong: ({ ...props }: React.ComponentProps<"strong">) => (
    <strong className="font-semibold" {...props} />
  ),
  p: ({ ...props }: React.ComponentProps<"p">) => (
    <p className="my-1 leading-relaxed first:mt-0 last:mb-0" {...props} />
  ),
  ul: ({ ...props }: React.ComponentProps<"ul">) => (
    <ul className="my-1 ml-3 list-disc [&>li]:mt-0.5" {...props} />
  ),
  ol: ({ ...props }: React.ComponentProps<"ol">) => (
    <ol className="my-1 ml-3 list-decimal [&>li]:mt-0.5" {...props} />
  ),
  li: ({ ...props }: React.ComponentProps<"li">) => <li className="leading-relaxed" {...props} />,
  a: ({ ...props }: React.ComponentProps<"a">) => (
    <a className="text-primary underline underline-offset-2 hover:text-primary/80" {...props} />
  ),
  code: ({ ...props }: React.ComponentProps<"code">) => (
    <code
      className="rounded-md border border-border/50 bg-muted/50 px-1 py-0.5 font-mono text-[0.85em]"
      {...props}
    />
  ),
}

const ReasoningImpl: ReasoningMessagePartComponent = ({ text }) => {
  if (!text) return null
  return (
    <div className="text-xs text-muted-foreground/70">
      <Markdown remarkPlugins={[remarkGfm]} components={reasoningComponents}>
        {text}
      </Markdown>
    </div>
  )
}

export const Reasoning = memo(ReasoningImpl)

export const ReasoningGroupWrapper: ReasoningGroupComponent = ({ children }: PropsWithChildren) => {
  const { isOpen } = useThinkingProcess()
  if (!isOpen) return null
  return <div className="border-l-2 border-muted/40 pl-3 py-1">{children}</div>
}
