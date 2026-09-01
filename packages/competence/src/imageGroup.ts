import { createMemo, createSignal } from "solid-js";
import { createCarousel, type CarouselIns } from "./carousel";

/**
 * Headless logic for Image.PreviewGroup — a COMPOSER over createCarousel, not
 * a reimplementation. The group owns three things the single-image machine
 * (createImage) doesn't:
 *
 *  - MEMBER REGISTRY: child Images register their src on mount; the registry
 *    is a signal-backed array so a dynamic <For> list keeps the carousel's
 *    count live. Members are keyed by insertion symbol (mount order), the
 *    same key the UI layer uses for its "click the Nth thumbnail" index.
 *  - GROUP-LEVEL PREVIEW OPEN STATE: controlled-or-uncontrolled, same
 *    value/onChange surface as createImage's preview so the UI layer can
 *    wire both identically.
 *  - OPEN-AT: clicking a thumbnail jumps the carousel (WITHOUT the slide
 *    animation — an opening preview shouldn't replay a track swipe) and
 *    opens the overlay in one gesture.
 *
 * The slide machine itself (current/direction/wrap/canPrev/canNext) is
 * delegated wholesale to createCarousel — switching semantics in a preview
 * group are exactly carousel semantics. antd parity: ←/→ arrows, infinite
 * wrap, count badge, transform reset on switch (the UI layer resets via
 * createImage's resetTransform when carousel.current changes — effects live
 * renderer-side per this layer's no-effects convention).
 */

export type ImageGroupConfig = {
  /** Controlled group preview open. */
  previewVisible?: boolean
  defaultPreviewVisible?: boolean
  onPreviewVisibleChange?: (open: boolean) => void
  /** Controlled current image index (passed through to createCarousel). */
  current?: number
  defaultCurrent?: number
  /** Switch callback: (current, prev) — antd's preview.onChange signature. */
  onChange?: (current: number, prev: number) => void
  /** Wrap around at the ends. Default true (antd preview group wraps). */
  infinite?: boolean
}

export type ImageGroupIns = {
  /** The underlying slide machine — next/prev/goTo/current/direction/etc. */
  carousel: CarouselIns
  /** Group preview open state (controlled value wins). */
  previewOpen: () => boolean
  setPreviewOpen: (open: boolean) => void
  /** Click a thumbnail: jump (no animation) and open. */
  openAt: (index: number) => void
  /** src of the currently-previewed member, by registry order. */
  currentSrc: () => string | undefined
  /** All member srcs in mount order (reactive). */
  sources: () => string[]
  /**
   * Register a member Image. Returns its unregister fn; the registry count
   * feeds the carousel reactively.
   */
  register: (src: string | undefined) => () => void
}

export const createImageGroup = (config: ImageGroupConfig = {}): ImageGroupIns => {
  // Registry: symbol-keyed entries so unregister is identity-safe even when
  // two members share a src. `src` is read through a getter-style refresh via
  // the version signal below — a member whose src PROP changes re-registers
  // in the UI layer (simplest contract; src flips mid-preview are rare).
  const [_entries, _setEntries] = createSignal<{ id: symbol; src: string | undefined }[]>(
    [], { ownedWrite: true },
  )
  const [_open, _setOpen] = createSignal(config.defaultPreviewVisible ?? false, { ownedWrite: true })

  const sources = createMemo(() => _entries().map(e => e.src))

  const previewOpen = createMemo(() =>
    config.previewVisible !== undefined ? config.previewVisible : _open())

  const setPreviewOpen = (open: boolean) => {
    if (open === previewOpen()) return
    if (config.previewVisible === undefined) _setOpen(open)
    config.onPreviewVisibleChange?.(open)
  }

  const carousel = createCarousel({
    get current() { return config.current },
    get defaultCurrent() { return config.defaultCurrent },
    get count() { return Math.max(1, _entries().length) },
    get infinite() { return config.infinite ?? true },
    // antd's preview.onChange fires on switch; createCarousel exposes
    // beforeChange(from, to) — same two indices, so bridge directly.
    get beforeChange() {
      return config.onChange ? (from: number, to: number) => config.onChange?.(to, from) : undefined
    },
  })

  const openAt = (index: number) => {
    // No animation: the overlay is opening fresh — a track swipe would read
    // as a glitch, not a switch. animate=false only matters when the index
    // actually moves (goTo no-ops on same-index).
    carousel.goTo(index, false)
    setPreviewOpen(true)
  }

  const currentSrc = createMemo(() => {
    const list = sources()
    const idx = carousel.current()
    return list[idx]
  })

  const register = (src: string | undefined) => {
    const id = Symbol('image-group-member')
    _setEntries(prev => [...prev, { id, src }])
    return () => _setEntries(prev => prev.filter(e => e.id !== id))
  }

  return {
    carousel,
    previewOpen,
    setPreviewOpen,
    openAt,
    currentSrc,
    sources,
    register,
  }
}

export const imageGroupSplits: (keyof ImageGroupConfig)[] = [
  'previewVisible', 'defaultPreviewVisible', 'onPreviewVisibleChange',
  'current', 'defaultCurrent', 'onChange', 'infinite',
]
