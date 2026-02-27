"use client"

import { AssistantModalPrimitive } from "@assistant-ui/react"
import { BotIcon, ChevronDownIcon } from "lucide-react"
import { type FC, forwardRef, useEffect, useRef, useState } from "react"
import { Thread, type UserMessageSubmitMethod } from "@/components/assistant-ui/thread"
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/analytics"
import {
  type ChatOnboardingSource,
  type ChatOnboardingState,
  type ChatOnboardingVariant,
  getOnboardingEventParams,
  getOrAssignChatOnboardingVariant,
  markFirstVisitSeen,
  markOnboardingCompleted,
  markOnboardingDismissed,
  markOnboardingShown,
  readChatOnboardingState,
  shouldShowOnboarding,
} from "@/lib/chat-onboarding"
import { CHAT_MODAL_OPENED_EVENT, MOBILE_NAV_OPENED_EVENT } from "@/lib/layer-events"
import { cn } from "@/lib/utils"

const CHAT_MODAL_CONTENT_ID = "assistant-chat-modal"
const CHAT_MODAL_TITLE_ID = "assistant-chat-modal-title"
const CHAT_MODAL_DESCRIPTION_ID = "assistant-chat-modal-description"

export const AssistantModal: FC = () => {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [onboardingCardVisible, setOnboardingCardVisible] = useState(false)
  const [onboardingVariant, setOnboardingVariant] = useState<ChatOnboardingVariant>("A")
  const [onboardingSource, setOnboardingSource] = useState<ChatOnboardingSource>("manual_reopen")
  const [onboardingExamplesVisible, setOnboardingExamplesVisible] = useState(false)
  const [composerHighlightVisible, setComposerHighlightVisible] = useState(false)
  const onboardingStateRef = useRef<ChatOnboardingState | null>(null)
  const onboardingShownTrackedRef = useRef(false)

  const focusComposer = () => {
    requestAnimationFrame(() => {
      const input = document.querySelector<HTMLTextAreaElement>(".aui-composer-input")
      input?.focus()
    })
  }

  const openModalAndFocusComposer = () => {
    if (!open) {
      setOpen(true)
      window.dispatchEvent(new Event(CHAT_MODAL_OPENED_EVENT))
    }
    focusComposer()
  }

  const closeModal = () => {
    setOpen(false)
    requestAnimationFrame(() => {
      triggerRef.current?.focus()
    })
  }

  useEffect(() => {
    const anchor = triggerRef.current?.closest<HTMLElement>(".aui-modal-anchor")
    if (!anchor) {
      return
    }

    const applyVisibilityGuard = () => {
      anchor.style.setProperty("display", "block", "important")
      anchor.style.setProperty("visibility", "visible", "important")
      anchor.style.setProperty("opacity", "1", "important")
    }

    const clearVisibilityGuard = () => {
      anchor.style.removeProperty("display")
      anchor.style.removeProperty("visibility")
      anchor.style.removeProperty("opacity")
    }

    const printMediaQuery = window.matchMedia("print")
    const handlePrintMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        clearVisibilityGuard()
        return
      }
      applyVisibilityGuard()
    }

    applyVisibilityGuard()
    printMediaQuery.addEventListener("change", handlePrintMediaChange)

    return () => {
      printMediaQuery.removeEventListener("change", handlePrintMediaChange)
      clearVisibilityGuard()
    }
  }, [])

  useEffect(() => {
    const isFirstVisit = markFirstVisitSeen()
    const currentState = readChatOnboardingState()
    const assignedVariant = getOrAssignChatOnboardingVariant()
    const variant = currentState?.variant ?? assignedVariant
    const source = currentState?.source ?? (isFirstVisit ? "first_visit" : "manual_reopen")

    setOnboardingVariant(variant)
    setOnboardingSource(source)
    onboardingStateRef.current = currentState

    if (!shouldShowOnboarding({ isFirstVisit, state: currentState })) {
      return
    }

    const shownState = markOnboardingShown({ source: "first_visit", variant })
    onboardingStateRef.current = shownState
    setOnboardingCardVisible(true)
    setOnboardingSource(shownState.source)

    if (!onboardingShownTrackedRef.current) {
      trackEvent("chat_onboarding_shown", getOnboardingEventParams(shownState))
      onboardingShownTrackedRef.current = true
    }
  }, [])

  useEffect(() => {
    const handleEscapeToClose = (event: KeyboardEvent) => {
      if (!open || event.key !== "Escape") {
        return
      }

      triggerRef.current?.click()
    }

    window.addEventListener("keydown", handleEscapeToClose)
    return () => {
      window.removeEventListener("keydown", handleEscapeToClose)
    }
  }, [open])

  useEffect(() => {
    const closeChatWhenMobileNavOpens = () => {
      const modal = document.querySelector<HTMLElement>(".aui-modal-content[data-state='open']")
      if (!modal) {
        return
      }

      triggerRef.current?.click()
    }

    window.addEventListener(MOBILE_NAV_OPENED_EVENT, closeChatWhenMobileNavOpens)
    return () => {
      window.removeEventListener(MOBILE_NAV_OPENED_EVENT, closeChatWhenMobileNavOpens)
    }
  }, [])

  const handleOpenChange = (open: boolean) => {
    if (open) {
      openModalAndFocusComposer()
      return
    }

    closeModal()
  }

  const dismissOnboardingCard = () => {
    const state = onboardingStateRef.current ?? {
      status: "shown",
      source: onboardingSource,
      variant: onboardingVariant,
    }
    const nextState = markOnboardingDismissed(state)

    onboardingStateRef.current = nextState
    setOnboardingCardVisible(false)
    setOnboardingExamplesVisible(false)
    setComposerHighlightVisible(false)
    trackEvent("chat_onboarding_dismissed", getOnboardingEventParams(nextState))
  }

  const handleOnboardingCtaClick = () => {
    const eventState = onboardingStateRef.current ?? {
      source: onboardingSource,
      variant: onboardingVariant,
    }
    trackEvent("chat_onboarding_cta_clicked", getOnboardingEventParams(eventState))
    openModalAndFocusComposer()

    if (onboardingVariant === "B") {
      setOnboardingExamplesVisible(true)
      setComposerHighlightVisible(true)
    }
  }

  const handleUserMessageSubmitted = (method: UserMessageSubmitMethod) => {
    const currentState = onboardingStateRef.current
    if (!currentState) {
      return
    }

    if (currentState.status === "dismissed" || currentState.status === "completed") {
      return
    }

    const nextState = markOnboardingCompleted(currentState)
    onboardingStateRef.current = nextState
    setOnboardingCardVisible(false)
    setOnboardingExamplesVisible(false)
    setComposerHighlightVisible(false)
    trackEvent(
      "chat_onboarding_completed",
      getOnboardingEventParams(nextState, {
        method,
      })
    )
  }

  return (
    <AssistantModalPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <AssistantModalPrimitive.Anchor className="aui-root aui-modal-anchor fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-[var(--layer-chat)] size-14 print:hidden">
        {onboardingCardVisible ? (
          <div
            data-testid="chat-onboarding-card"
            className="absolute right-0 bottom-[calc(100%+0.75rem)] w-72 rounded-xl border bg-background px-3 py-2.5 text-sm shadow-xl transition-all motion-reduce:animate-none motion-reduce:transition-none"
          >
            <p className="font-medium">AI 어시스턴트로 빠르게 확인해보세요.</p>
            <p className="mt-1 text-muted-foreground text-xs">
              질문 예시를 눌러 바로 시작하거나 직접 입력해볼 수 있습니다.
            </p>
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                data-testid="chat-onboarding-dismiss"
                onClick={dismissOnboardingCard}
              >
                닫기
              </Button>
              <Button
                type="button"
                size="sm"
                data-testid="chat-onboarding-cta"
                onClick={handleOnboardingCtaClick}
              >
                시작하기
              </Button>
            </div>
          </div>
        ) : null}
        <AssistantModalPrimitive.Trigger asChild>
          <AssistantModalButton ref={triggerRef} />
        </AssistantModalPrimitive.Trigger>
      </AssistantModalPrimitive.Anchor>
      <AssistantModalPrimitive.Content
        id={CHAT_MODAL_CONTENT_ID}
        sideOffset={16}
        aria-labelledby={CHAT_MODAL_TITLE_ID}
        aria-describedby={CHAT_MODAL_DESCRIPTION_ID}
        className="aui-root aui-modal-content data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-1/2 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:zoom-out data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-1/2 data-[state=open]:slide-in-from-right-1/2 data-[state=open]:zoom-in z-[var(--layer-chat)] h-[min(700px,80vh)] w-[min(500px,calc(100vw-2rem))] overflow-clip overscroll-contain rounded-xl border bg-popover p-0 text-popover-foreground shadow-2xl outline-none data-[state=closed]:invisible data-[state=closed]:animate-out data-[state=open]:animate-in motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none print:hidden [&>.aui-thread-root]:bg-inherit"
      >
        <h2 id={CHAT_MODAL_TITLE_ID} className="sr-only">
          AI 어시스턴트 채팅
        </h2>
        <p id={CHAT_MODAL_DESCRIPTION_ID} className="sr-only">
          이력서에 대한 질문을 입력하고 답변을 받을 수 있습니다.
        </p>
        <Thread
          onUserMessageSubmitted={handleUserMessageSubmitted}
          onboardingVariant={onboardingVariant}
          onboardingExamplesVisible={onboardingExamplesVisible}
          composerHighlightVisible={composerHighlightVisible}
        />
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  )
}

type AssistantModalButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  "data-state"?: "open" | "closed"
}

const AssistantModalButton = forwardRef<HTMLButtonElement, AssistantModalButtonProps>(
  ({ "data-state": state, ...rest }, ref) => {
    const tooltip = state === "open" ? "닫기" : "AI 어시스턴트"

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (state === "closed") {
        trackEvent("chat_open")
      }
      const originalOnClick = rest.onClick as React.MouseEventHandler<HTMLButtonElement> | undefined
      originalOnClick?.(e)
    }

    return (
      <TooltipIconButton
        variant="default"
        tooltip={tooltip}
        side="left"
        aria-controls={CHAT_MODAL_CONTENT_ID}
        aria-expanded={state === "open"}
        aria-haspopup="dialog"
        aria-label={tooltip}
        {...rest}
        onClick={handleClick}
        className={cn(
          "aui-modal-button size-full rounded-full shadow-xl transition-transform hover:scale-110 active:scale-90",
          "motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
        )}
        ref={ref}
      >
        <BotIcon
          data-state={state}
          className="absolute size-7 transition-all motion-reduce:transition-none data-[state=closed]:rotate-0 data-[state=open]:rotate-90 data-[state=closed]:scale-100 data-[state=open]:scale-0"
        />
        <ChevronDownIcon
          data-state={state}
          className="absolute size-7 transition-all motion-reduce:transition-none data-[state=closed]:-rotate-90 data-[state=open]:rotate-0 data-[state=closed]:scale-0 data-[state=open]:scale-100"
        />
        <span className="sr-only">{tooltip}</span>
      </TooltipIconButton>
    )
  }
)

AssistantModalButton.displayName = "AssistantModalButton"
