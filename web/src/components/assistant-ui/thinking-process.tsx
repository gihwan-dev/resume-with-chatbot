"use client"

import { useAuiState } from "@assistant-ui/react"
import { CheckIcon, ChevronRightIcon } from "lucide-react"
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { TOOL_LABELS } from "@/lib/tool-labels"
import { cn } from "@/lib/utils"

// --- Types ---

export type ThinkingStepStatus = "running" | "complete"

export interface ThinkingStep {
  id: string
  type: "reasoning" | "tool-call"
  label: string
  status: ThinkingStepStatus
}

interface ThinkingProcessContextValue {
  steps: ThinkingStep[]
  currentStep: ThinkingStep | null
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  reasoningTitle: string
}

// --- Pure helpers ---

export function extractReasoningTitle(
  content: ReadonlyArray<{ type: string; text?: string }>
): string {
  const reasoningParts = content.filter((p) => p.type === "reasoning" && p.text)
  const lastText = reasoningParts[reasoningParts.length - 1]?.text
  if (!lastText) return ""
  const matches = [...lastText.matchAll(/\*\*(.+?)\*\*/g)]
  return matches.length > 0 ? matches[matches.length - 1][1] : ""
}

export function computeToolSteps(
  content: ReadonlyArray<{ type: string; toolName?: string }>,
  isComplete: boolean
): ThinkingStep[] {
  const toolSteps: ThinkingStep[] = []
  for (let i = 0; i < content.length; i++) {
    const part = content[i]
    if (part.type === "tool-call") {
      const toolName = part.toolName
      if (toolName) {
        const toolInfo = TOOL_LABELS[toolName]
        if (toolInfo) {
          toolSteps.push({
            id: `tool-${toolName}-${i}`,
            type: "tool-call",
            label: `${toolInfo.label} 중...`,
            status: isComplete ? "complete" : "running",
          })
        }
      }
    }
  }
  return toolSteps
}

export function computeCurrentStep(
  content: ReadonlyArray<{ type: string; toolName?: string }>,
  steps: ThinkingStep[],
  isComplete: boolean
): ThinkingStep | null {
  if (isComplete) return null

  for (let i = content.length - 1; i >= 0; i--) {
    const part = content[i]

    if (part.type === "tool-call") {
      const toolName = part.toolName
      return steps.find((s) => s.type === "tool-call" && s.id === `tool-${toolName}-${i}`) ?? null
    }

    if (part.type === "reasoning") {
      return steps.find((s) => s.type === "reasoning") ?? null
    }
  }

  return null
}

// --- Context ---

const ThinkingProcessContext = createContext<ThinkingProcessContextValue | null>(null)

export function useThinkingProcess() {
  const ctx = useContext(ThinkingProcessContext)
  if (!ctx) {
    throw new Error("useThinkingProcess must be used within a ThinkingProcessProvider")
  }
  return ctx
}

// --- Provider ---

export function ThinkingProcessProvider({ children }: PropsWithChildren) {
  const message = useAuiState(({ message }) => message)
  const isComplete = message.status?.type === "complete"
  const isStreaming =
    message.status?.type === "running" || message.status?.type === "requires-action"
  const [isOpen, setIsOpen] = useState(false)

  const hasReasoning = message.content.some((p) => p.type === "reasoning")

  const reasoningTitle = useMemo(() => extractReasoningTitle(message.content), [message.content])

  const steps = useMemo(() => {
    const all: ThinkingStep[] = []
    if (hasReasoning) {
      all.push({
        id: "reasoning",
        type: "reasoning",
        label: "생각 중...",
        status: isStreaming ? "running" : "complete",
      })
    } else if (isStreaming) {
      // reasoning 파트 도착 전에도 헤더를 즉시 표시
      all.push({
        id: "initial",
        type: "reasoning",
        label: "생각 중...",
        status: "running",
      })
    }
    all.push(...computeToolSteps(message.content, isComplete))
    return all
  }, [message.content, hasReasoning, isStreaming, isComplete])

  const currentStep = useMemo(() => {
    const computed = computeCurrentStep(message.content, steps, isComplete)
    if (!computed && isStreaming && steps.length > 0) return steps[0]
    return computed
  }, [steps, message.content, isComplete, isStreaming])

  const contextValue = useMemo(
    () => ({ steps, currentStep, isOpen, setIsOpen, reasoningTitle }),
    [steps, currentStep, isOpen, reasoningTitle]
  )

  const hasSteps = steps.length > 0

  return (
    <ThinkingProcessContext.Provider value={contextValue}>
      {hasSteps && (
        <ThinkingProcessHeader
          isComplete={isComplete}
          currentStep={currentStep}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          reasoningTitle={reasoningTitle}
        />
      )}
      {children}
    </ThinkingProcessContext.Provider>
  )
}

// --- Header (Accordion trigger) ---

function ThinkingProcessHeader({
  isComplete,
  currentStep,
  isOpen,
  setIsOpen,
  reasoningTitle,
}: {
  isComplete: boolean
  currentStep: ThinkingStep | null
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  reasoningTitle: string
}) {
  const isRunning = !isComplete && currentStep !== null

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="my-1">
      <CollapsibleTrigger className="flex w-full items-center gap-1.5 rounded-lg border border-border/30 bg-muted/20 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/40">
        {!isRunning && <CheckIcon className="size-3.5 shrink-0 text-green-500" />}
        <StepTicker
          currentStep={currentStep}
          isComplete={isComplete}
          reasoningTitle={reasoningTitle}
        />
        <ChevronRightIcon
          className={cn(
            "ml-auto size-3.5 shrink-0 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent
        className={cn(
          "overflow-hidden",
          "data-[state=closed]:animate-collapsible-up",
          "data-[state=open]:animate-collapsible-down"
        )}
      />
    </Collapsible>
  )
}

// --- StepTicker ---

function StepTicker({
  currentStep,
  isComplete,
  reasoningTitle,
}: {
  currentStep: ThinkingStep | null
  isComplete: boolean
  reasoningTitle: string
}) {
  const [displayLabel, setDisplayLabel] = useState("생각 중...")
  const [prevLabel, setPrevLabel] = useState<string | null>(null)
  const displayLabelRef = useRef("생각 중...")
  const pendingRef = useRef<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const targetLabel = isComplete
    ? "사고 과정"
    : currentStep?.type === "reasoning"
      ? reasoningTitle || "생각 중..."
      : (currentStep?.label ?? "생각 중...")

  const transitionTo = useCallback((label: string) => {
    setPrevLabel(displayLabelRef.current)
    displayLabelRef.current = label
    setDisplayLabel(label)

    timerRef.current = setTimeout(() => {
      timerRef.current = null
      setPrevLabel(null)

      const pending = pendingRef.current
      if (pending && pending !== displayLabelRef.current) {
        pendingRef.current = null
        transitionTo(pending)
      }
    }, 100)
  }, [])

  useEffect(() => {
    if (targetLabel === displayLabelRef.current) {
      pendingRef.current = null
      return
    }

    // First label: show immediately without animation
    if (displayLabelRef.current === "") {
      displayLabelRef.current = targetLabel
      setDisplayLabel(targetLabel)
      return
    }

    // On complete: skip pending queue, transition immediately
    if (isComplete) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      pendingRef.current = null
      displayLabelRef.current = targetLabel
      setPrevLabel(null)
      setDisplayLabel(targetLabel)
      return
    }

    // Timer running: save to pending (overwrite with latest)
    if (timerRef.current) {
      pendingRef.current = targetLabel
      return
    }

    // Immediate transition
    transitionTo(targetLabel)
  }, [targetLabel, isComplete, transitionTo])

  // Unmount cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const isAnimating = prevLabel !== null

  return (
    <span className="relative flex min-w-0 flex-1 h-4 items-center overflow-hidden">
      {isAnimating && (
        <span
          className="absolute inset-0 flex items-center truncate"
          style={{ animation: "ticker-slide-up-out 0.1s ease forwards" }}
        >
          {prevLabel}
        </span>
      )}
      <span
        className={cn("flex items-center truncate", isAnimating && "absolute inset-0")}
        style={isAnimating ? { animation: "ticker-slide-up-in 0.1s ease forwards" } : undefined}
      >
        {displayLabel}
      </span>
    </span>
  )
}
