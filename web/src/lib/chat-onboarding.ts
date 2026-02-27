export type ChatOnboardingStatus = "never_shown" | "shown" | "dismissed" | "completed"
export type ChatOnboardingSource = "first_visit" | "manual_reopen"
export type ChatOnboardingVariant = "A" | "B"
export type ChatOnboardingDevice = "mobile" | "desktop"

export interface ChatOnboardingState {
  status: ChatOnboardingStatus
  shownAt?: number
  dismissedAt?: number
  completedAt?: number
  source: ChatOnboardingSource
  variant: ChatOnboardingVariant
}

type TrackingEventParams = Record<string, string | number | boolean | undefined>

export const CHAT_ONBOARDING_STORAGE_KEY = "chat_onboarding_v1"
export const CHAT_ONBOARDING_VARIANT_STORAGE_KEY = "chat_onboarding_variant_v1"
export const CHAT_FIRST_VISIT_SEEN_AT_KEY = "chat_first_visit_seen_at"

interface ShouldShowOnboardingArgs {
  isFirstVisit: boolean
  state: ChatOnboardingState | null
}

const VALID_STATUS = new Set<ChatOnboardingStatus>([
  "never_shown",
  "shown",
  "dismissed",
  "completed",
])
const VALID_SOURCE = new Set<ChatOnboardingSource>(["first_visit", "manual_reopen"])
const VALID_VARIANT = new Set<ChatOnboardingVariant>(["A", "B"])

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function normalizeTimestamp(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function parseChatOnboardingState(raw: string | null): ChatOnboardingState | null {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const status = parsed.status
    const source = parsed.source
    const variant = parsed.variant

    if (
      !VALID_STATUS.has(status as ChatOnboardingStatus) ||
      !VALID_SOURCE.has(source as ChatOnboardingSource) ||
      !VALID_VARIANT.has(variant as ChatOnboardingVariant)
    ) {
      return null
    }

    return {
      status: status as ChatOnboardingStatus,
      source: source as ChatOnboardingSource,
      variant: variant as ChatOnboardingVariant,
      shownAt: normalizeTimestamp(parsed.shownAt),
      dismissedAt: normalizeTimestamp(parsed.dismissedAt),
      completedAt: normalizeTimestamp(parsed.completedAt),
    }
  } catch {
    return null
  }
}

function persistState(state: ChatOnboardingState): void {
  const storage = getStorage()
  if (!storage) {
    return
  }

  try {
    storage.setItem(CHAT_ONBOARDING_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // no-op
  }
}

function detectDevice(): ChatOnboardingDevice {
  if (typeof window === "undefined") {
    return "desktop"
  }

  return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop"
}

export function markFirstVisitSeen(): boolean {
  const storage = getStorage()
  if (!storage) {
    return false
  }

  try {
    const seenAt = storage.getItem(CHAT_FIRST_VISIT_SEEN_AT_KEY)
    if (seenAt) {
      return false
    }

    storage.setItem(CHAT_FIRST_VISIT_SEEN_AT_KEY, String(Date.now()))
    return true
  } catch {
    return false
  }
}

export function readChatOnboardingState(): ChatOnboardingState | null {
  const storage = getStorage()
  if (!storage) {
    return null
  }

  try {
    const raw = storage.getItem(CHAT_ONBOARDING_STORAGE_KEY)
    const parsed = parseChatOnboardingState(raw)
    if (!parsed && raw !== null) {
      storage.removeItem(CHAT_ONBOARDING_STORAGE_KEY)
    }
    return parsed
  } catch {
    return null
  }
}

export function writeChatOnboardingState(state: ChatOnboardingState): void {
  persistState(state)
}

export function getOrAssignChatOnboardingVariant(): ChatOnboardingVariant {
  const storage = getStorage()
  const fallbackVariant: ChatOnboardingVariant = Math.random() < 0.5 ? "A" : "B"

  if (!storage) {
    return fallbackVariant
  }

  try {
    const storedVariant = storage.getItem(CHAT_ONBOARDING_VARIANT_STORAGE_KEY)
    if (storedVariant === "A" || storedVariant === "B") {
      return storedVariant
    }

    storage.setItem(CHAT_ONBOARDING_VARIANT_STORAGE_KEY, fallbackVariant)
    return fallbackVariant
  } catch {
    return fallbackVariant
  }
}

export function shouldShowOnboarding({ isFirstVisit, state }: ShouldShowOnboardingArgs): boolean {
  if (!isFirstVisit) {
    return false
  }

  if (!state) {
    return true
  }

  if (state.status === "dismissed" || state.status === "completed") {
    return false
  }

  return state.status === "never_shown"
}

export function markOnboardingShown(args: {
  source: ChatOnboardingSource
  variant: ChatOnboardingVariant
  at?: number
}): ChatOnboardingState {
  const nextState: ChatOnboardingState = {
    status: "shown",
    shownAt: args.at ?? Date.now(),
    source: args.source,
    variant: args.variant,
  }

  persistState(nextState)
  return nextState
}

export function markOnboardingDismissed(
  state: ChatOnboardingState,
  at = Date.now()
): ChatOnboardingState {
  const nextState: ChatOnboardingState = {
    ...state,
    status: "dismissed",
    dismissedAt: at,
  }

  persistState(nextState)
  return nextState
}

export function markOnboardingCompleted(
  state: ChatOnboardingState,
  at = Date.now()
): ChatOnboardingState {
  const nextState: ChatOnboardingState = {
    ...state,
    status: "completed",
    completedAt: at,
  }

  persistState(nextState)
  return nextState
}

export function getOnboardingEventParams(
  state: Pick<ChatOnboardingState, "variant" | "source">,
  params: TrackingEventParams = {}
): TrackingEventParams {
  return {
    device: detectDevice(),
    variant: state.variant,
    source: state.source,
    ...params,
  }
}
