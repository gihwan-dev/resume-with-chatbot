"use client"

import { useAuiState } from "@assistant-ui/react"
import { CheckIcon, ChevronRightIcon, LoaderIcon } from "lucide-react"
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
  registerSteps: (sourceId: string, steps: ThinkingStep[]) => void
  unregisterSteps: (sourceId: string) => void
  steps: ThinkingStep[]
  currentStep: ThinkingStep | null
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  reasoningTitle: string
  setReasoningTitle: (title: string) => void
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
  const [isOpen, setIsOpen] = useState(false)
  const [reasoningTitle, setReasoningTitle] = useState("")
  const stepsMapRef = useRef<Map<string, ThinkingStep[]>>(new Map())
  const [stepsVersion, setStepsVersion] = useState(0)

  const registerSteps = useCallback((sourceId: string, steps: ThinkingStep[]) => {
    stepsMapRef.current.set(sourceId, steps)
    setStepsVersion((v) => v + 1)
  }, [])

  const unregisterSteps = useCallback((sourceId: string) => {
    stepsMapRef.current.delete(sourceId)
    setStepsVersion((v) => v + 1)
  }, [])

  const steps = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    stepsVersion // subscribe to changes
    const all: ThinkingStep[] = []
    for (const s of stepsMapRef.current.values()) {
      all.push(...s)
    }
    return all
  }, [stepsVersion])

  const currentStep = useMemo(() => {
    const running = steps.filter((s) => s.status === "running")
    return running.length > 0 ? running[running.length - 1] : null
  }, [steps])

  const contextValue = useMemo(
    () => ({ registerSteps, unregisterSteps, steps, currentStep, isOpen, setIsOpen, reasoningTitle, setReasoningTitle }),
    [registerSteps, unregisterSteps, steps, currentStep, isOpen, setIsOpen, reasoningTitle]
  )

  const hasSteps = steps.length > 0

  return (
    <ThinkingProcessContext.Provider value={contextValue}>
      {hasSteps && (
        <ThinkingProcessHeader isComplete={isComplete} currentStep={currentStep} isOpen={isOpen} setIsOpen={setIsOpen} reasoningTitle={reasoningTitle} />
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
        {isRunning ? (
          <LoaderIcon className="size-3.5 shrink-0 animate-spin" />
        ) : (
          <CheckIcon className="size-3.5 shrink-0 text-green-500" />
        )}
        <StepTicker currentStep={currentStep} isComplete={isComplete} reasoningTitle={reasoningTitle} />
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
  const [displayLabel, setDisplayLabel] = useState<string>("")
  const [prevLabel, setPrevLabel] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const targetLabel = isComplete
    ? "사고 과정"
    : currentStep?.type === "reasoning"
      ? reasoningTitle || "생각 중..."
      : currentStep?.label ?? "생각 중..."

  useEffect(() => {
    if (targetLabel === displayLabel && !isAnimating) return

    if (displayLabel === "") {
      // First render, no animation
      setDisplayLabel(targetLabel)
      return
    }

    if (targetLabel !== displayLabel && !isAnimating) {
      setPrevLabel(displayLabel)
      setDisplayLabel(targetLabel)
      setIsAnimating(true)

      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setIsAnimating(false)
        setPrevLabel(null)
      }, 300)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [targetLabel, displayLabel, isAnimating])

  return (
    <span className="relative inline-flex h-4 items-center overflow-hidden">
      {isAnimating && prevLabel && (
        <span
          className="absolute inset-0 flex items-center"
          style={{ animation: "ticker-slide-up-out 0.3s ease forwards" }}
        >
          {prevLabel}
        </span>
      )}
      <span
        className={cn("flex items-center", isAnimating && "absolute inset-0")}
        style={isAnimating ? { animation: "ticker-slide-up-in 0.3s ease forwards" } : undefined}
      >
        {displayLabel}
      </span>
    </span>
  )
}
