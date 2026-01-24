import { Bot, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle } from "@/components/ui/card"

interface ChatHeaderProps {
  onClose: () => void
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <div className="flex flex-row items-center justify-between p-4 bg-linear-to-r from-primary to-primary/80 text-primary-foreground shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-sm leading-none">Resume Bot</h3>
          <p className="text-[10px] text-primary-foreground/80 font-medium mt-0.5">Always here to help</p>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClose} 
        className="h-8 w-8 text-primary-foreground/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}
