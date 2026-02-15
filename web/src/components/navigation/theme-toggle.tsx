"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"
import { Switch } from "@/components/ui/switch"

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Switch disabled aria-label="테마 전환" />
  }

  return (
    <div className="flex items-center w-full justify-center space-x-2">
      <Sun className="h-[1.2rem] w-[1.2rem]" aria-hidden />
      <Switch
        aria-label="다크 모드 전환"
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
      <Moon className="h-[1.2rem] w-[1.2rem]" aria-hidden />
      <span className="sr-only">Toggle theme</span>
    </div>
  )
}
