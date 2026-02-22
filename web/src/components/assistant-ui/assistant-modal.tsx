"use client"

import { AssistantModalPrimitive } from "@assistant-ui/react"
import { BotIcon, ChevronDownIcon } from "lucide-react"
import { type FC, forwardRef, useEffect, useRef, useState } from "react"
import { Thread } from "@/components/assistant-ui/thread"
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button"
import { trackEvent } from "@/lib/analytics"
import { CHAT_MODAL_OPENED_EVENT, MOBILE_NAV_OPENED_EVENT } from "@/lib/layer-events"

const CHAT_MODAL_CONTENT_ID = "assistant-chat-modal"
const CHAT_MODAL_TITLE_ID = "assistant-chat-modal-title"
const CHAT_MODAL_DESCRIPTION_ID = "assistant-chat-modal-description"

export const AssistantModal: FC = () => {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

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
    setOpen(open)

    if (open) {
      window.dispatchEvent(new Event(CHAT_MODAL_OPENED_EVENT))
      requestAnimationFrame(() => {
        const input = document.querySelector<HTMLTextAreaElement>(".aui-composer-input")
        input?.focus()
      })
      return
    }

    requestAnimationFrame(() => {
      triggerRef.current?.focus()
    })
  }

  return (
    <AssistantModalPrimitive.Root onOpenChange={handleOpenChange}>
      <AssistantModalPrimitive.Anchor className="aui-root aui-modal-anchor fixed right-4 bottom-4 z-[var(--layer-chat)] size-14 print:hidden">
        <AssistantModalPrimitive.Trigger asChild>
          <AssistantModalButton ref={triggerRef} />
        </AssistantModalPrimitive.Trigger>
      </AssistantModalPrimitive.Anchor>
      <AssistantModalPrimitive.Content
        id={CHAT_MODAL_CONTENT_ID}
        sideOffset={16}
        aria-labelledby={CHAT_MODAL_TITLE_ID}
        aria-describedby={CHAT_MODAL_DESCRIPTION_ID}
        className="aui-root aui-modal-content data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-1/2 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:zoom-out data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-1/2 data-[state=open]:slide-in-from-right-1/2 data-[state=open]:zoom-in z-[var(--layer-chat)] h-[min(700px,80vh)] w-[min(500px,calc(100vw-2rem))] overflow-clip overscroll-contain rounded-xl border bg-popover p-0 text-popover-foreground shadow-2xl outline-none data-[state=closed]:invisible data-[state=closed]:animate-out data-[state=open]:animate-in print:hidden [&>.aui-thread-root]:bg-inherit"
      >
        <h2 id={CHAT_MODAL_TITLE_ID} className="sr-only">
          AI 어시스턴트 채팅
        </h2>
        <p id={CHAT_MODAL_DESCRIPTION_ID} className="sr-only">
          이력서에 대한 질문을 입력하고 답변을 받을 수 있습니다.
        </p>
        <Thread />
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
        className="aui-modal-button size-full rounded-full shadow-xl transition-transform hover:scale-110 active:scale-90"
        ref={ref}
      >
        <BotIcon
          data-state={state}
          className="absolute size-7 transition-all data-[state=closed]:rotate-0 data-[state=open]:rotate-90 data-[state=closed]:scale-100 data-[state=open]:scale-0"
        />
        <ChevronDownIcon
          data-state={state}
          className="absolute size-7 transition-all data-[state=closed]:-rotate-90 data-[state=open]:rotate-0 data-[state=closed]:scale-0 data-[state=open]:scale-100"
        />
        <span className="sr-only">{tooltip}</span>
      </TooltipIconButton>
    )
  }
)

AssistantModalButton.displayName = "AssistantModalButton"
