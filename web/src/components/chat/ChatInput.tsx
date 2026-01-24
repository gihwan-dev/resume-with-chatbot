import { Send } from "lucide-react"
import type { FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  isLoading: boolean
  placeholder?: string
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = "질문을 입력하세요...",
}: ChatInputProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!value.trim() || isLoading) return
    onSubmit(e)
  }

  return (
    <div className="p-4 pt-2 bg-linear-to-t from-white via-white to-transparent shrink-0">
      <form 
        onSubmit={handleSubmit} 
        className="flex w-full items-center gap-2 bg-muted/50 p-1.5 rounded-full border border-primary/10 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 focus-within:bg-white shadow-sm"
      >
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent h-9 px-4 text-sm"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !value.trim()}
          className="h-8 w-8 rounded-full shrink-0 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  )
}
