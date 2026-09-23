import { createEffect, createSignal, untrack } from 'solid-js'
import { createOwnerCleanup } from 'upthrust-competence'

/** Wait for the clear icon's 100 ms exit transition before showing the arrow. */
export function createDelayedArrow(showClear: () => boolean) {
  const initiallyClear = untrack(showClear)
  const [showArrow, setShowArrow] = createSignal(!initiallyClear, { ownedWrite: true })
  let wasClear = initiallyClear
  let timer: ReturnType<typeof setTimeout> | undefined

  createEffect(showClear, clear => {
    if (timer) clearTimeout(timer)
    if (clear) {
      setShowArrow(false)
    } else if (wasClear) {
      timer = setTimeout(() => setShowArrow(true), 120)
    } else {
      setShowArrow(true)
    }
    wasClear = clear
  })

  createOwnerCleanup()(() => { if (timer) clearTimeout(timer) })
  return showArrow
}
