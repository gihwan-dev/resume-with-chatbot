export const MOBILE_NAV_OPENED_EVENT = "resume:mobile-nav-opened"
export const CHAT_MODAL_OPENED_EVENT = "resume:chat-modal-opened"
export const CHAT_WIDGET_READY_EVENT = "resume:chat-widget-ready"
export const NAVIGATION_READY_EVENT = "resume:navigation-ready"
export const CHAT_PROMPT_REQUEST_EVENT = "resume:chat-prompt-request"

export type ChatPromptRequestSource = "source_preview" | "live_feed"

export interface ChatPromptRequestDetail {
  prompt: string
  resetThread?: boolean
  source: ChatPromptRequestSource
}
