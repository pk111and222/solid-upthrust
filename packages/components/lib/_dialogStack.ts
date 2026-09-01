import { createSignal } from 'solid-js'

/**
 * Shared OPEN-DIALOG STACK for Modal and Drawer (module-level singleton).
 *
 * Two jobs:
 *  1. ESC routing: exactly ONE document keydown listener exists; Escape
 *     closes only the TOP-MOST open dialog (highest zIndex, latest mount on
 *     ties) — antd semantics. Without this, every mounted dialog's own
 *     listener fires and one Escape closes all layers at once.
 *  2. Drawer push: `isPushed` tells a drawer whether some OTHER open dialog
 *     sits above its zIndex (the drawer slides aside 180px when covered).
 *
 * Entries carry the dialog's requestClose intent router; the stack itself
 * owns no state beyond membership.
 */
export type DialogStackEntry = {
  id: symbol
  zIndex: number
  /** Route an Escape intent through the dialog's close gate. */
  onEscape: () => void
}

const [version, setVersion] = createSignal(0, { ownedWrite: true })
let _stack: DialogStackEntry[] = []

const bump = () => setVersion(v => v + 1)

export const registerDialog = (entry: DialogStackEntry) => {
  _stack = [..._stack, entry]
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

/** True when another open dialog sits ABOVE this zIndex. */
export const isPushed = (id: symbol, zIndex: number) => {
  void version()
  return _stack.some(e => e.id !== id && e.zIndex > zIndex)
}

// The single Escape dispatcher. Top-most = highest zIndex; ties go to the
// LATEST mounted (last in the stack array).
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape' || _stack.length === 0) return
  let top = _stack[0]
  for (const entry of _stack) {
    if (entry.zIndex >= top.zIndex) top = entry
  }
  top.onEscape()
}

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', handleKeyDown)
}
