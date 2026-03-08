import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/analytics"
import { dispatchChatPromptRequest } from "@/lib/chat-prompt"
import { cn } from "@/lib/utils"
import type { LiveResumeFeedItem } from "@/lib/work-agent/types"

interface LiveResumeFeedProps {
  items: LiveResumeFeedItem[]
}

function formatFeedDate(dateText: string): string {
  if (!dateText) return "-"
  return dateText.slice(0, 10)
}

export function LiveResumeFeed({ items }: LiveResumeFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentItem = items[currentIndex]
  const previousItem = previousIndex === null ? null : items[previousIndex]

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const syncReducedMotion = () => {
      setIsReducedMotion(mediaQuery.matches)
    }
    syncReducedMotion()
    mediaQuery.addEventListener("change", syncReducedMotion)
    return () => {
      mediaQuery.removeEventListener("change", syncReducedMotion)
    }
  }, [])

  useEffect(() => {
    if (items.length === 0) return
    trackEvent("live_feed_impression", {
      item_count: items.length,
    })
  }, [items.length])

  useEffect(() => {
    if (items.length <= 1 || isPaused || isReducedMotion) return

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % items.length
        setPreviousIndex(prevIndex)
        trackEvent("live_feed_rotate", {
          from_index: prevIndex,
          to_index: nextIndex,
        })
        return nextIndex
      })
    }, 5000)

    return () => {
      clearInterval(intervalId)
    }
  }, [isPaused, isReducedMotion, items.length])

  useEffect(() => {
    if (previousIndex === null || isReducedMotion) return

    animationTimerRef.current = setTimeout(() => {
      setPreviousIndex(null)
      animationTimerRef.current = null
    }, 120)

    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current)
        animationTimerRef.current = null
      }
    }
  }, [previousIndex, isReducedMotion])

  const askCurrentItem = useMemo(
    () => () => {
      if (!currentItem) return
      dispatchChatPromptRequest({
        prompt: currentItem.promptText,
        resetThread: true,
        source: "live_feed",
      })
      trackEvent("live_feed_ask_ai", { item_id: currentItem.id })
    },
    [currentItem]
  )

  if (!currentItem) return null

  return (
    <section
      className="mt-6 rounded-lg border border-resume-border bg-resume-card-bg px-3 py-2"
      aria-label="Live Resume Feed"
      data-testid="live-resume-feed"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false)
        }
      }}
    >
      <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-wide text-resume-text-muted">
        <span>Live Resume Feed</span>
        <span>{items.length} updates</span>
      </div>

      <button
        type="button"
        className="relative flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-md text-left"
        onClick={() => {
          trackEvent("live_feed_item_click", { item_id: currentItem.id })
          askCurrentItem()
        }}
      >
        <span className="shrink-0 rounded bg-resume-highlight px-2 py-1 text-[11px] font-medium text-resume-primary">
          {formatFeedDate(currentItem.date)}
        </span>
        <span className="relative flex min-w-0 flex-1 items-center overflow-hidden text-sm">
          {!isReducedMotion && previousItem ? (
            <span
              className="absolute inset-0 flex items-center truncate text-resume-text-main/70"
              style={{ animation: "ticker-slide-up-out 0.1s ease forwards" }}
            >
              {previousItem.title} - {previousItem.summary}
            </span>
          ) : null}
          <span
            className={cn(
              "truncate text-resume-text-main",
              !isReducedMotion && previousItem && "absolute inset-0"
            )}
            style={
              !isReducedMotion && previousItem
                ? { animation: "ticker-slide-up-in 0.1s ease forwards" }
                : undefined
            }
            data-testid="live-resume-feed-item"
          >
            {currentItem.title} - {currentItem.summary}
          </span>
        </span>
      </button>

      <div className="mt-2 flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={(event) => {
            event.stopPropagation()
            askCurrentItem()
          }}
          data-testid="live-resume-feed-ask-ai"
        >
          Ask AI
        </Button>
      </div>
    </section>
  )
}
