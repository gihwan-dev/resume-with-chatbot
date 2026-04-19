import { ArrowLeft, ChevronLeft, ChevronRight, FileSearch } from "lucide-react"
import { type ComponentProps, useEffect, useMemo, useRef, useState } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
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
import { extractWikiDocId, preprocessWikiLinks, type WikiLinkRef } from "./wiki-link-preprocessor"

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
  fullContent?: string
  outLinks?: WikiLinkRef[]
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
  const [navigationStack, setNavigationStack] = useState<string[]>([])
  const previewRequestIdRef = useRef(0)
  const previewAbortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      previewAbortControllerRef.current?.abort()
    }
  }, [])

  if (sources.length === 0) return null

  const fetchPreview = async (docId: string) => {
    setPreviewError(null)
    setIsLoadingPreview(true)

    const requestId = previewRequestIdRef.current + 1
    previewRequestIdRef.current = requestId
    previewAbortControllerRef.current?.abort()
    const abortController = new AbortController()
    previewAbortControllerRef.current = abortController

    try {
      const variant = getActiveResumeVariant()
      const response = await fetch(
        `/api/source-preview?id=${encodeURIComponent(docId)}&variant=${encodeURIComponent(variant)}&full=true`,
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
      return data
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      if (previewRequestIdRef.current !== requestId) return

      const message =
        error instanceof Error ? error.message : "출처 상세 정보를 불러오지 못했습니다."
      setPreviewError(message)
      throw error
    } finally {
      if (previewRequestIdRef.current === requestId) {
        previewAbortControllerRef.current = null
        setIsLoadingPreview(false)
      }
    }
  }

  const handlePreviewOpenChange = (open: boolean) => {
    setPreviewOpen(open)
    if (open) return

    previewAbortControllerRef.current?.abort()
    previewAbortControllerRef.current = null
    setIsLoadingPreview(false)
    setSelectedSourceId(null)
    setNavigationStack([])
  }

  const handleSourceClick = async (source: Source) => {
    trackEvent("source_card_clicked", {
      source_type: source.sourceType,
      source_id: source.id,
    })

    if (!source.previewAvailable) return

    setSelectedSourceId(source.id)
    setPreview(null)
    setNavigationStack([])
    setPreviewOpen(true)

    try {
      await fetchPreview(source.id)
      trackEvent("source_preview_opened", {
        source_id: source.id,
        source_type: source.sourceType,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "출처 상세 정보를 불러오지 못했습니다."
      trackEvent("source_preview_failed", {
        source_id: source.id,
        source_type: source.sourceType,
        error: message,
      })
    }
  }

  const handleWikiLinkNavigate = async (docId: string) => {
    if (!preview || docId === preview.id) return
    const previousId = preview.id

    setNavigationStack((stack) => [...stack, previousId])
    setPreview(null)
    try {
      await fetchPreview(docId)
      trackEvent("source_preview_wiki_navigated", {
        from_id: previousId,
        to_id: docId,
      })
    } catch {
      // 실패 시 스택 롤백하여 뒤로가기가 엉키지 않도록
      setNavigationStack((stack) => stack.slice(0, -1))
    }
  }

  const handlePreviewBack = async () => {
    if (navigationStack.length === 0) return
    const previousId = navigationStack[navigationStack.length - 1]
    setNavigationStack((stack) => stack.slice(0, -1))
    setPreview(null)
    try {
      await fetchPreview(previousId)
    } catch {
      // 유지: fetch 실패 시 스택은 이미 pop된 상태
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
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0">
          <DialogHeader className="sticky top-0 z-10 border-b bg-background px-6 py-4">
            <div className="flex items-center gap-2">
              {navigationStack.length > 0 ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={handlePreviewBack}
                  disabled={isLoadingPreview}
                  aria-label="이전 문서로 돌아가기"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              ) : null}
              <DialogTitle className="truncate text-left text-base">
                {preview?.title ?? "근거 상세 보기"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-left text-xs text-muted-foreground">
              {preview
                ? `${preview.category} · ${preview.path}`
                : "답변 생성에 사용된 Obsidian 문서의 전체 내용입니다."}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto px-6 py-4">
            {isLoadingPreview ? (
              <p className="text-sm text-muted-foreground">근거 정보를 불러오는 중...</p>
            ) : null}

            {previewError ? (
              <p className="text-sm text-destructive" data-testid="source-preview-error">
                {previewError}
              </p>
            ) : null}

            {preview && !isLoadingPreview ? (
              <PreviewBody preview={preview} onWikiLinkNavigate={handleWikiLinkNavigate} />
            ) : null}
          </div>

          <DialogFooter className="border-t bg-background px-6 py-3">
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

interface PreviewBodyProps {
  preview: SourcePreviewResponse
  onWikiLinkNavigate: (docId: string) => void
}

function PreviewBody({ preview, onWikiLinkNavigate }: PreviewBodyProps) {
  const outLinks = preview.outLinks ?? []
  const processedMarkdown = useMemo(() => {
    if (!preview.fullContent) return ""
    return preprocessWikiLinks(preview.fullContent, outLinks)
  }, [preview.fullContent, outLinks])

  const components = useMemo(
    () => createMarkdownComponents(onWikiLinkNavigate),
    [onWikiLinkNavigate]
  )

  if (!processedMarkdown) {
    return (
      <div className="space-y-3 text-sm" data-testid="source-preview-content">
        <div className="rounded-md border bg-muted/20 p-3">
          <p className="mb-1 text-xs text-muted-foreground">요약</p>
          <p className="leading-relaxed">{preview.summary}</p>
        </div>
        <div className="rounded-md border bg-muted/20 p-3">
          <p className="mb-1 text-xs text-muted-foreground">본문 발췌</p>
          <p className="leading-relaxed">{preview.excerpt}</p>
        </div>
        {preview.tags.length > 0 ? (
          <p className="text-xs text-muted-foreground">태그: {preview.tags.join(", ")}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-4 text-sm" data-testid="source-preview-content">
      {preview.summary ? (
        <div className="rounded-md border bg-muted/20 p-3">
          <p className="mb-1 text-xs text-muted-foreground">요약</p>
          <p className="leading-relaxed">{preview.summary}</p>
        </div>
      ) : null}

      <div className="prose prose-sm max-w-none dark:prose-invert">
        <Markdown remarkPlugins={[remarkGfm]} components={components}>
          {processedMarkdown}
        </Markdown>
      </div>

      {preview.tags.length > 0 ? (
        <p className="text-xs text-muted-foreground">태그: {preview.tags.join(", ")}</p>
      ) : null}
    </div>
  )
}

function createMarkdownComponents(onWikiLinkNavigate: (docId: string) => void) {
  return {
    a: ({ href, children, ...rest }: ComponentProps<"a">) => {
      const wikiDocId = typeof href === "string" ? extractWikiDocId(href) : null
      if (wikiDocId) {
        return (
          <button
            type="button"
            onClick={() => onWikiLinkNavigate(wikiDocId)}
            className="text-primary underline underline-offset-2 hover:text-primary/80"
            data-testid="source-preview-wiki-link"
          >
            {children}
          </button>
        )
      }
      return (
        <a
          href={href}
          className="text-primary underline underline-offset-2 hover:text-primary/80"
          target="_blank"
          rel="noreferrer"
          {...rest}
        >
          {children}
        </a>
      )
    },
    h1: ({ ...props }: ComponentProps<"h1">) => (
      <h1 className="mt-4 mb-2 text-lg font-semibold" {...props} />
    ),
    h2: ({ ...props }: ComponentProps<"h2">) => (
      <h2 className="mt-4 mb-2 text-base font-semibold" {...props} />
    ),
    h3: ({ ...props }: ComponentProps<"h3">) => (
      <h3 className="mt-3 mb-1 text-sm font-semibold" {...props} />
    ),
    p: ({ ...props }: ComponentProps<"p">) => (
      <p className="my-2 leading-relaxed first:mt-0 last:mb-0" {...props} />
    ),
    ul: ({ ...props }: ComponentProps<"ul">) => (
      <ul className="my-2 ml-4 list-disc [&>li]:mt-1" {...props} />
    ),
    ol: ({ ...props }: ComponentProps<"ol">) => (
      <ol className="my-2 ml-4 list-decimal [&>li]:mt-1" {...props} />
    ),
    li: ({ ...props }: ComponentProps<"li">) => <li className="leading-relaxed" {...props} />,
    code: ({ ...props }: ComponentProps<"code">) => (
      <code
        className="rounded-md border border-border/50 bg-muted/50 px-1 py-0.5 font-mono text-[0.85em]"
        {...props}
      />
    ),
    blockquote: ({ ...props }: ComponentProps<"blockquote">) => (
      <blockquote className="my-2 border-l-2 border-border pl-3 text-muted-foreground" {...props} />
    ),
  }
}
