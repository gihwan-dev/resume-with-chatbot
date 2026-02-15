import { ChevronLeft, ChevronRight, FileSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, useCarousel } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { SourceCard } from "./source-card"
import type { Source } from "./types"

interface SourceCarouselProps {
  sources: Source[]
  className?: string
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
  if (sources.length === 0) return null

  return (
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
              <SourceCard source={source} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
