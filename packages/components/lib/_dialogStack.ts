import { createSignal } from 'solid-js'

/**
 * Shared OPEN-DIALOG STACK for Modal, Drawer and Tour (module-level singleton).
 *
 * Two jobs:
 *  1. ESC routing: exactly ONE document keydown listener exists; Escape
 *     closes only the TOP-MOST open dialog (highest zIndex, latest mount on
 *     ties) — antd semantics. Without this, every mounted dialog's own
 *     listener fires and one Escape closes all layers at once.
 *  2. Drawer push: `isPushed` tells a drawer whether another open DRAWER sits
 *     above it (antd nested drawers — a Modal on top does not push).
 *
 * Entries carry the dialog's requestClose intent router; the stack itself
 * owns no state beyond membership.
 */
export type DialogStackEntry = {
  id: symbol
  zIndex: number
  /** 'drawer' entries push the drawers below them. */
  kind?: 'modal' | 'drawer' | 'tour'
  /** Route an Escape intent through the dialog's close gate. */
  onEscape: () => void
}

const [version, setVersion] = createSignal(0, { ownedWrite: true })
let _stack: DialogStackEntry[] = []

const bump = () => setVersion(v => v + 1)

export const registerDialog = (entry: DialogStackEntry) => {
  _stack = [..._stack.filter(e => e.id !== entry.id), entry]
  bump()
}

export const unregisterDialog = (id: symbol) => {
  if (!_stack.some(e => e.id === id)) return
  _stack = _stack.filter(e => e.id !== id)
  bump()
}

/** Snapshot in stack order (mount order); version-read makes it reactive. */
export const dialogStack = () => {
  void version()
  return _stack
}

const topEntry = () => {
  let top = _stack[0]
  for (const entry of _stack) if (entry.zIndex >= top.zIndex) top = entry
  return top
}

/** Whether `id` is the top-most open dialog (reactive). */
export const isTopDialog = (id: symbol) => {
  void version()
  return _stack.length > 0 && topEntry().id === id
}

/** True when another open drawer sits ABOVE this one (higher zIndex, or same zIndex mounted later). */
export const isPushed = (id: symbol, zIndex: number) => {
  void version()
  const self = _stack.findIndex(e => e.id === id)
  return _stack.some((e, index) => e.id !== id && e.kind === 'drawer'
    && (e.zIndex > zIndex || (e.zIndex === zIndex && self >= 0 && index > self)))
}

// The single Escape dispatcher. Top-most = highest zIndex; ties go to the
// LATEST mounted (last in the stack array).
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape' || _stack.length === 0) return
  topEntry().onEscape()
}

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', handleKeyDown)
}
