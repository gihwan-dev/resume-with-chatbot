import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/analytics"
import { dispatchChatPromptRequest } from "@/lib/chat-prompt"
import type { LiveResumeFeedItem } from "@/lib/work-agent/types"

interface LiveResumeFeedProps {
  items: LiveResumeFeedItem[]
}

const ROTATE_INTERVAL_MS = 5000
const TRANSITION_DURATION_MS = 360
const ROW_HEIGHT_PX = 32

function formatActivityDate(activityAt: string): string {
  if (!activityAt) return "-"

  const prefixMatch = activityAt.match(/^(\d{4}-\d{2}-\d{2})/)
  if (prefixMatch?.[1]) return prefixMatch[1]

  const parsedDate = new Date(activityAt)
  if (Number.isNaN(parsedDate.getTime())) return "-"
  return parsedDate.toISOString().slice(0, 10)
}

export function LiveResumeFeed({ items }: LiveResumeFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentItem = items[currentIndex]
  const nextItem = nextIndex === null ? null : items[nextIndex]
  const actionableItem = nextItem ?? currentItem

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
    if (items.length === 0) return
    setCurrentIndex((prevIndex) => (prevIndex >= items.length ? 0 : prevIndex))
    setNextIndex(null)
    setIsAnimating(false)
  }, [items.length])

  useEffect(() => {
    if (items.length <= 1 || isPaused || isReducedMotion || isAnimating) return

    const rotateTimer = setTimeout(() => {
      const toIndex = (currentIndex + 1) % items.length
      setNextIndex(toIndex)
      setIsAnimating(true)
      trackEvent("live_feed_rotate", {
        from_index: currentIndex,
        to_index: toIndex,
      })
    }, ROTATE_INTERVAL_MS)

    return () => {
      clearTimeout(rotateTimer)
    }
  }, [currentIndex, isAnimating, isPaused, isReducedMotion, items.length])

  useEffect(() => {
    if (!isAnimating || nextIndex === null || isReducedMotion) return

    transitionTimerRef.current = setTimeout(() => {
      setCurrentIndex(nextIndex)
      setNextIndex(null)
      setIsAnimating(false)
      transitionTimerRef.current = null
    }, TRANSITION_DURATION_MS)

    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current)
        transitionTimerRef.current = null
      }
    }
  }, [isAnimating, isReducedMotion, nextIndex])

  const askItem = useMemo(
    () => (item: LiveResumeFeedItem | null) => {
      if (!item) return
      dispatchChatPromptRequest({
        prompt: item.promptText,
        resetThread: true,
        source: "live_feed",
      })
      trackEvent("live_feed_ask_ai", { item_id: item.id })
    },
    []
  )

  if (!currentItem) return null

  const rows = !isReducedMotion && isAnimating && nextItem ? [currentItem, nextItem] : [currentItem]
  const trackTransform =
    !isReducedMotion && isAnimating && nextItem
      ? `translateY(-${ROW_HEIGHT_PX}px)`
      : "translateY(0)"
  const trackTransition =
    !isReducedMotion && isAnimating && nextItem
      ? `transform ${TRANSITION_DURATION_MS}ms ease`
      : "none"

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
        className="w-full rounded-md text-left"
        onClick={() => {
          if (!actionableItem) return
          trackEvent("live_feed_item_click", { item_id: actionableItem.id })
          askItem(actionableItem)
        }}
      >
        <span className="block h-8 overflow-hidden">
          <span
            className="block will-change-transform"
            style={{
              transform: trackTransform,
              transition: trackTransition,
            }}
            data-testid="live-resume-feed-track"
          >
            {rows.map((item, index) => (
              <span key={`${item.id}-${index}`} className="flex h-8 min-w-0 items-center gap-2">
                <span className="shrink-0 rounded bg-resume-highlight px-2 py-1 text-resume-primary">
                  <span className="block text-[9px] uppercase leading-none tracking-wide text-resume-primary/75">
                    Updated
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium leading-none">
                    {formatActivityDate(item.activityAt)}
                  </span>
                </span>
                <span
                  className="min-w-0 truncate text-sm text-resume-text-main"
                  data-testid={index === 0 ? "live-resume-feed-item" : undefined}
                >
                  {item.title} - {item.summary}
                </span>
              </span>
            ))}
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
            askItem(actionableItem ?? null)
          }}
          data-testid="live-resume-feed-ask-ai"
        >
          Ask AI
        </Button>
      </div>
    </section>
  )
}
