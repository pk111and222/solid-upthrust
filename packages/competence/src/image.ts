import { createMemo, createSignal } from "solid-js";

/**
 * Headless logic for Image — the loading state machine plus the preview
 * state, mirroring rc-image's useStatus/useMergedState pair:
 *
 *  - LOAD status: 'loading' → 'normal' on the img's load event, or 'error'
 *    when the src fails (Image() probe AND the onerror path both land there).
 *    A src change resets to loading; switching back to a previously-failed
 *    src retries (status leaves 'error').
 *  - `fallback`: when set and the primary src errors, the RENDERER renders
 *    the fallback src instead (this layer only reports status; effectiveSrc
 *    picks the src to paint).
 *  - PREVIEW: controlled-or-uncontrolled open state with the standard
 *    value/onChange surface.
 *  - PREVIEW TRANSFORM: zoom (scale) + rotate counters with clamping —
 *    antd's operations bar (zoom in / zoom out / rotate left / right /
 *    reset). Pure arithmetic, no DOM.
 */

export type ImageStatus = 'loading' | 'normal' | 'error'

export type ImageConfig = {
  src?: string
  /** Replacement src painted when the primary one errors. */
  fallback?: string
  /**
   * @deprecated Unused by the state machine (initial status is always
   * 'loading'). Kept in the config surface for splitProps compatibility;
   * placeholder UI selection is a renderer concern.
   */
  hasPlaceholder?: boolean
  /** Controlled preview open. */
  previewVisible?: boolean
  defaultPreviewVisible?: boolean
  onPreviewVisibleChange?: (open: boolean) => void
  /** Zoom bounds for the preview transform. Defaults 1..32 (antd family). */
  minScale?: number
  maxScale?: number
  /** Scale increment per zoom step. Default 0.5 (antd). */
  scaleStep?: number
  /** Rotation increment per click, degrees. Default 90 (antd). */
  rotateStep?: number
}

export type ImagePreviewTransform = {
  scale: number
  rotate: number
}

export type ImageIns = {
  /** Load lifecycle: loading → normal | error. */
  status: () => ImageStatus
  /** True while the src hasn't loaded (drives the placeholder). */
  isLoading: () => boolean
  /** True after a load error (drives the error fallback UI). */
  isError: () => boolean
  /** The src the renderer should paint (fallback on error). */
  effectiveSrc: () => string | undefined
  /** Renderer calls this from the img's load event. */
  notifyLoaded: () => void
  /** Renderer calls this from the img's error event. */
  notifyError: () => void
  /** Preview open state (controlled value wins). */
  previewOpen: () => boolean
  setPreviewOpen: (open: boolean) => void
  togglePreview: () => void
  /** Preview transform (zoom/rotate) + operations. */
  transform: () => ImagePreviewTransform
  zoomIn: () => void
  zoomOut: () => void
  rotateLeft: () => void
  rotateRight: () => void
  resetTransform: () => void
}

const DEFAULT_TRANSFORM: ImagePreviewTransform = { scale: 1, rotate: 0 }

export const createImage = (config: ImageConfig = {}): ImageIns => {
  // ownedWrite: notifyLoaded/notifyError/setPreviewOpen fire from DOM events
  // and timers — imperative entry points outside any reactive owner.
  // Initial status is ALWAYS 'loading' (rc-image semantics): the img starts
  // fetching on mount and the load/error event advances the machine. Gating
  // the initial state on hasPlaceholder made spinner-less images report
  // 'normal' during their first network flight, so the default spinner never
  // appeared for slow srcs. hasPlaceholder is a RENDERER concern (which
  // placeholder UI to paint), not a state-machine input.
  const [_status, _setStatus] = createSignal<ImageStatus>('loading', { ownedWrite: true })
  const [_previewOpen, _setPreviewOpen] = createSignal(
    config.defaultPreviewVisible ?? false, { ownedWrite: true },
  )
  const [_transform, _setTransform] = createSignal<ImagePreviewTransform>(DEFAULT_TRANSFORM, { ownedWrite: true })

  const status = createMemo(() => _status())
  const previewOpen = createMemo(() =>
    config.previewVisible !== undefined ? config.previewVisible : _previewOpen())

  // A src change resets the machine: a fresh src loads again (and a
  // previously-errored src switches back to retry). The RENDERER re-fires
  // load/error as the new request settles.
  // Subscribe-free watcher (same pattern as createDialog): evaluated on
  // every status() read so this layer keeps no effects.
  let _prevSrc = config.src
  // Once the fallback has taken over it STAYS effective until the primary
  // src changes — otherwise the fallback's successful load would flip the
  // status back to 'normal', effectiveSrc would return the (broken) primary
  // src again, the img would error, and the whole cycle would repeat as a
  // visible flicker loop.
  // _usingFallback is a SIGNAL: effectiveSrc depends on it directly. With the
  // initial status now always 'loading', a first error's _setStatus('loading')
  // is a same-value write that doesn't invalidate the status memo — a plain
  // flag would leave effectiveSrc returning the broken src.
  const [_usingFallback, _setUsingFallback] = createSignal(false, { ownedWrite: true })
  const syncSrc = () => {
    if (config.src !== _prevSrc) {
      _prevSrc = config.src
      _setUsingFallback(false)
      if (_status() !== 'loading') _setStatus('loading')
    }
  }
  const statusWithSync = createMemo(() => {
    syncSrc()
    return _status()
  })

  const notifyLoaded = () => { _setStatus('normal') }
  const notifyError = () => {
    if (config.fallback !== undefined && !_usingFallback() && config.fallback !== config.src) {
      // Switch the painted src to the fallback; the subsequent load event
      // keeps the status 'normal' and effectiveSrc LOCKED on the fallback.
      _setUsingFallback(true)
      _setStatus('loading')
      return
    }
    _setStatus('error')
  }

  const effectiveSrc = createMemo(() => {
    statusWithSync() // keep the src-watcher reactive
    if (_usingFallback() && config.fallback !== undefined) return config.fallback
    return config.src
  })

  const setPreviewOpen = (open: boolean) => {
    if (open === previewOpen()) return
    if (config.previewVisible === undefined) _setPreviewOpen(open)
    // Reset the transform when the preview closes so the next open starts
    // from identity (antd parity).
    if (!open) _setTransform(DEFAULT_TRANSFORM)
    config.onPreviewVisibleChange?.(open)
  }
  const togglePreview = () => setPreviewOpen(!previewOpen())

  const minScale = () => config.minScale ?? 1
  const maxScale = () => config.maxScale ?? 32
  const scaleStep = () => config.scaleStep ?? 0.5
  const rotateStep = () => config.rotateStep ?? 90

  const zoomIn = () => {
    _setTransform(t => ({ ...t, scale: Math.min(t.scale + scaleStep(), maxScale()) }))
  }
  const zoomOut = () => {
    _setTransform(t => ({ ...t, scale: Math.max(t.scale - scaleStep(), minScale()) }))
  }
  const rotateLeft = () => { _setTransform(t => ({ ...t, rotate: t.rotate - rotateStep() })) }
  const rotateRight = () => { _setTransform(t => ({ ...t, rotate: t.rotate + rotateStep() })) }
  const resetTransform = () => { _setTransform(DEFAULT_TRANSFORM) }

  return {
    status: statusWithSync,
    isLoading: () => statusWithSync() === 'loading',
    isError: () => statusWithSync() === 'error',
    effectiveSrc,
    notifyLoaded,
    notifyError,
    previewOpen,
    setPreviewOpen,
    togglePreview,
    transform: () => _transform(),
    zoomIn,
    zoomOut,
    rotateLeft,
    rotateRight,
    resetTransform,
  }
}

export const imageSplits: (keyof ImageConfig)[] = [
  'src', 'fallback', 'hasPlaceholder',
  'previewVisible', 'defaultPreviewVisible', 'onPreviewVisibleChange',
  'minScale', 'maxScale', 'scaleStep', 'rotateStep',
]
