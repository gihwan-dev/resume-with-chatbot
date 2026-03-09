export interface Source {
  id: string
  title: string
  content: string
  category: string
  sourceType: "obsidian" | "resume"
  previewAvailable: boolean
  relevanceScore?: number
}

export interface SuggestedQuestion {
  id: string
  text: string
  icon?: string
}
