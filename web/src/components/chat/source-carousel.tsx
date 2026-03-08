import { ChevronLeft, ChevronRight, FileSearch } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, useCarousel } from "@/components/ui/carousel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { trackEvent } from "@/lib/analytics"
import { dispatchChatPromptRequest } from "@/lib/chat-prompt"
import { cn } from "@/lib/utils"
import { SourceCard } from "./source-card"
import type { Source } from "./types"

interface SourceCarouselProps {
  sources: Source[]
  className?: string
}

interface SourcePreviewResponse {
  id: string
  sourceType: "obsidian"
  title: string
  category: string
  path: string
  summary: string
  excerpt: string
  tags: string[]
}

function getActiveResumeVariant(): string {
  if (typeof document === "undefined") return "frontend"
  return document.body.dataset.resumeVariant ?? "frontend"
}

function CarouselNavigation() {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel()

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        aria-label="이전 참고 항목"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={scrollNext}
        disabled={!canScrollNext}
        aria-label="다음 참고 항목"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function SourceCarousel({ sources, className }: SourceCarouselProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [preview, setPreview] = useState<SourcePreviewResponse | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null)
  const previewRequestIdRef = useRef(0)
  const previewAbortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      previewAbortControllerRef.current?.abort()
    }
  }, [])

  if (sources.length === 0) return null

  const handlePreviewOpenChange = (open: boolean) => {
    setPreviewOpen(open)
    if (open) return

    previewAbortControllerRef.current?.abort()
    previewAbortControllerRef.current = null
    setIsLoadingPreview(false)
    setSelectedSourceId(null)
  }

  const handleSourceClick = async (source: Source) => {
    trackEvent("source_card_clicked", {
      source_type: source.sourceType,
      source_id: source.id,
    })

    if (!source.previewAvailable) return

    setSelectedSourceId(source.id)
    setPreview(null)
    setPreviewError(null)
    setPreviewOpen(true)
    setIsLoadingPreview(true)

    const requestId = previewRequestIdRef.current + 1
    previewRequestIdRef.current = requestId
    previewAbortControllerRef.current?.abort()
    const abortController = new AbortController()
    previewAbortControllerRef.current = abortController

    try {
      const variant = getActiveResumeVariant()
      const response = await fetch(
        `/api/source-preview?id=${encodeURIComponent(source.id)}&variant=${encodeURIComponent(variant)}`,
        { signal: abortController.signal }
      )

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string }
        const message = payload.error ?? `요청 실패 (${response.status})`
        throw new Error(message)
      }

      const data = (await response.json()) as SourcePreviewResponse
      if (previewRequestIdRef.current !== requestId) return

      setPreview(data)
      trackEvent("source_preview_opened", {
        source_id: source.id,
        source_type: source.sourceType,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return
      }
      if (previewRequestIdRef.current !== requestId) return

      const message =
        error instanceof Error ? error.message : "출처 상세 정보를 불러오지 못했습니다."
      setPreviewError(message)
      trackEvent("source_preview_failed", {
        source_id: source.id,
        source_type: source.sourceType,
        error: message,
      })
    } finally {
      if (previewRequestIdRef.current === requestId) {
        previewAbortControllerRef.current = null
        setIsLoadingPreview(false)
      }
    }
  }

  const handleAskWithPreview = () => {
    if (!preview) return

    const prompt = `"${preview.title}" 문서를 근거로 문제, 해결, 성과를 자세히 설명해줘.`
    dispatchChatPromptRequest({
      prompt,
      resetThread: false,
      source: "source_preview",
    })
    trackEvent("source_preview_ask_ai", {
      source_id: preview.id,
      source_type: preview.sourceType,
    })
    setPreviewOpen(false)
  }

  return (
    <>
      <div className={cn("mb-3", className)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileSearch className="w-3.5 h-3.5" aria-hidden />
            <span>참고한 경험 ({sources.length})</span>
          </div>
        </div>
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
          aria-label="참고한 경험 캐러셀"
        >
          <div className="flex items-center justify-between mb-1">
            <div />
            <CarouselNavigation />
          </div>
          <CarouselContent className="-ml-2">
            {sources.map((source) => (
              <CarouselItem key={source.id} className="pl-2 basis-auto">
                <SourceCard
                  source={source}
                  onClick={handleSourceClick}
                  isLoading={isLoadingPreview && selectedSourceId === source.id}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <Dialog open={previewOpen} onOpenChange={handlePreviewOpenChange}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>근거 상세 보기</DialogTitle>
            <DialogDescription>답변 생성에 사용된 문서의 핵심 요약과 발췌입니다.</DialogDescription>
          </DialogHeader>

          {isLoadingPreview ? (
            <p className="text-sm text-muted-foreground">근거 정보를 불러오는 중...</p>
          ) : null}

          {previewError ? (
            <p className="text-sm text-destructive" data-testid="source-preview-error">
              {previewError}
            </p>
          ) : null}

          {preview ? (
            <div className="space-y-3 text-sm" data-testid="source-preview-content">
              <div>
                <p className="font-medium text-foreground">{preview.title}</p>
                <p className="text-xs text-muted-foreground">{preview.category}</p>
              </div>

              <div className="rounded-md border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground mb-1">요약</p>
                <p className="leading-relaxed">{preview.summary}</p>
              </div>

              <div className="rounded-md border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground mb-1">본문 발췌</p>
                <p className="leading-relaxed">{preview.excerpt}</p>
              </div>

              <p className="text-xs text-muted-foreground">경로: {preview.path}</p>
              {preview.tags.length > 0 ? (
                <p className="text-xs text-muted-foreground">태그: {preview.tags.join(", ")}</p>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              onClick={handleAskWithPreview}
              disabled={!preview || isLoadingPreview}
              data-testid="source-preview-ask-ai"
            >
              이 근거로 더 물어보기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
