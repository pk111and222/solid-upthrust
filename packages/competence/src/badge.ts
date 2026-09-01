import { createMemo } from "solid-js";

/**
 * Headless logic for Badge — the display state machine antd's Badge.js
 * derives inline: overflow formatting, zero suppression, status/color
 * priority over counts, dot gating, and the multi-character pill flag.
 * Pure derivation (the createDialog/createSkeleton family), so the UI layer
 * only decides how to render the returned fields.
 */

export type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning'

export type BadgeConfig = {
  /** Count content: a number gets overflow formatting; JSX = custom badge node. */
  count?: number | string | { node?: unknown }
  /** Cap for numeric counts; above shows `${overflowCount}+`. Default 99. */
  overflowCount?: number
  /** Zero counts stay hidden unless true. */
  showZero?: boolean
  /** Red dot mode — no number, and zero still hides. */
  dot?: boolean
  status?: BadgeStatus
  color?: string
  /** Status text shown beside the dot (status mode). */
  text?: string | number
}

export type BadgeDisplayState = {
  /** Formatted count: `${overflowCount}+` above the cap; '0' suppression is `hidden`'s job. */
  displayCount: number | string | undefined
  /** True when count (or text) resolves to zero. */
  isZero: boolean
  /** Count null or zero-suppressed. */
  ignoreCount: boolean
  /** status/color present AND count is ignored — the status dot takes over. */
  hasStatus: boolean
  /** dot mode with a non-zero payload. */
  showAsDot: boolean
  /** Nothing to render at all. */
  hidden: boolean
  /** Multi-character pill (adds horizontal padding). */
  multipleWords: boolean
  /** Status text is renderable (antd: text===0 needs showZero, '' hides). */
  textVisible: boolean
}

const isReactable = (v: unknown): boolean =>
  v !== undefined && v !== null && v !== '' && v !== false && v !== true

/**
 * Pure display derivation — exported for tests. Mirrors antd's
 * numberedDisplayCount/isZero/ignoreCount/hasStatus/showAsDot/isHidden
 * chain, minus the count-caching refs (those exist to freeze the number
 * during rc-motion's leave animation, which this library replaces with a
 * plain CSS transition on a persistent node).
 */
export const resolveBadgeDisplay = (config: BadgeConfig): BadgeDisplayState => {
  const overflowCount = config.overflowCount ?? 99
  const count = config.count

  const numberedDisplayCount =
    typeof count === 'number' && overflowCount !== undefined && count > overflowCount
      ? `${overflowCount}+`
      : count

  const isZero =
    numberedDisplayCount === '0' || numberedDisplayCount === 0 ||
    config.text === '0' || config.text === 0

  // antd: the zero check runs on the DISPLAYED count, but a zero-VALUED
  // text with a live count doesn't suppress the count itself — the count
  // only ignores when ITS OWN value is zero/absent.
  const countIsZero = numberedDisplayCount === '0' || numberedDisplayCount === 0
  const ignoreCount = count === undefined || count === null || (countIsZero && !config.showZero)

  const hasStatus =
    (config.status !== undefined || config.color !== undefined) && ignoreCount

  const showAsDot = !!config.dot && !isZero

  const mergedCount = showAsDot ? '' : numberedDisplayCount
  const isEmpty = !isReactable(mergedCount) && !isReactable(config.text)
  // antd: isHidden = (empty OR zero-suppressed) AND not a dot — where the
  // zero check is against the COUNT, not the combined isZero (a '0' text
  // beside a live count 5 never suppresses the count badge).
  const hidden = (isEmpty || (countIsZero && !config.showZero)) && !showAsDot

  const displayCount = mergedCount === '' ? undefined : (mergedCount as number | string | undefined)

  const multipleWords =
    !showAsDot && !hidden &&
    displayCount !== undefined &&
    String(displayCount).length > 1

  // antd: text===0 renders only with showZero; '' and booleans hide.
  const textVisible =
    !hidden && (config.text === 0 ? config.showZero !== false && config.showZero !== undefined
      : config.text !== undefined && config.text !== null && config.text !== '' && typeof config.text !== 'boolean')

  return { displayCount, isZero, ignoreCount, hasStatus, showAsDot, hidden, multipleWords, textVisible }
}

/**
 * Pure offset style — antd parses the x entry with parseInt (so '10px'
 * works, and a negative x MOVES the badge further out: the style is
 * insetInlineEnd: -x) and passes y through as marginTop verbatim.
 * Returns undefined for a missing offset.
 */
export const badgeOffsetStyle = (
  offset?: [number | string, number | string],
): Record<string, string> | undefined => {
  if (!offset) return undefined
  const horizontal = Number.parseInt(String(offset[0]), 10)
  const style: Record<string, string> = {}
  if (!Number.isNaN(horizontal)) style['margin-right'] = `${-horizontal}px`
  if (offset[1] !== undefined && offset[1] !== null) style['margin-top'] = String(offset[1])
  return Object.keys(style).length ? style : undefined
}

export type BadgeIns = {
  display: () => BadgeDisplayState
}

export const createBadge = (config: BadgeConfig = {}): BadgeIns => {
  const display = createMemo(() => resolveBadgeDisplay(config))
  return { display }
}

export const badgeSplits: (keyof BadgeConfig)[] = [
  'count', 'overflowCount', 'showZero', 'dot', 'status', 'color', 'text',
]
