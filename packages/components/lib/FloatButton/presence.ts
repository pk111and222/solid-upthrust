import { createEffect, createSignal, untrack } from 'solid-js'

/**
 * rc-motion 的最小子集：`visible` 翻真时先挂载（离场态）再在第二帧切到入场态，
 * 让过渡有已提交的起点；翻假时先切离场态，`leaveMs` 后卸载（removeOnLeave）。
 * 初始可见直接落在入场态（不播 appear）。清理函数由 effect 返回（Solid 2 rc）。
 */
export const createPresence = (visible: () => boolean, leaveMs: number) => {
  const initial = untrack(visible)
  const [mounted, setMounted] = createSignal(initial, { ownedWrite: true })
  const [entered, setEntered] = createSignal(initial, { ownedWrite: true })
  createEffect(visible, (v: boolean) => {
    if (v) {
      setMounted(true)
      if (typeof requestAnimationFrame === 'undefined') { setEntered(true); return }
      let inner = 0
      const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setEntered(true)) })
      return () => { cancelAnimationFrame(outer); if (inner) cancelAnimationFrame(inner) }
    }
    setEntered(false)
    const timer = setTimeout(() => setMounted(false), leaveMs)
    return () => clearTimeout(timer)
  })
  return { mounted, entered }
}
