"use client"

import { Menu } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { SectionNav } from "./section-nav"
import { ThemeToggle } from "./theme-toggle"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="fixed top-4 right-4 z-100">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "bg-resume-card-bg border-resume-border shadow-resume-shadow",
              open && "hidden"
            )}
          >
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64 bg-resume-card-bg">
          <SheetHeader>
            <SheetTitle className="text-resume-text-heading">Menu</SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex flex-col gap-6 px-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-resume-text-muted">Theme</span>
              <ThemeToggle />
            </div>
            <div className="border-t border-resume-border pt-4">
              <span className="text-xs font-medium uppercase text-resume-text-muted tracking-wider mb-2 block">
                Sections
              </span>
              <SectionNav onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
