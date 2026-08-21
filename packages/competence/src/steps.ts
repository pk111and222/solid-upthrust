import { createMemo, createSignal } from "solid-js";

export type StepStatus = 'wait' | 'process' | 'finish' | 'error'

export type StepItem = {
  title: string
  subTitle?: string
  description?: string
  icon?: string
  status?: StepStatus
  disabled?: boolean
}

export type StepsConfig = {
  current?: number
  items: StepItem[]
  status?: StepStatus
  onChange?: (current: number) => void
  /**
   * Navigation guard for clicks: clicks may only move
   * BACKWARD to a finished step or stay on/step to the current one — never
   * jump forward past an unfinished step. Set false to allow free jumping.
   */
  clickNavigable?: boolean
  /** 0-100 progress of the current step; enables the dot progress mode. */
  percent?: number
}

export type StepsIns = {
  current: () => number
  next: () => void
  prev: () => void
  reset: () => void
}

export const createSteps = (config: StepsConfig) => {
  // ownedWrite: next/prev/goTo are imperative APIs fired from event handlers.
  const [_current, _setCurrent] = createSignal(config.current ?? 0, { ownedWrite: true })

  // The controlled memo is for RENDERING. Control flow (guards, next/prev)
  // must read the raw signal: in Solid 2 rc the ownedWrite memo commits
  // asynchronously, so back-to-back imperative calls (next(); prev()) would
  // otherwise see a stale current and mis-guard.
  const effectiveCurrent = () => config.current !== undefined ? config.current : _current()
  const current = createMemo(effectiveCurrent)
  const total = createMemo(() => config.items.length)

  /** Status of a step by index, considering per-item overrides. */
  const getStepStatus = (index: number): StepStatus => {
    const item = config.items[index]
    if (item?.status) return item.status
    const cur = effectiveCurrent()
    if (index < cur) return 'finish'
    if (index === cur) return config.status || 'process'
    return 'wait'
  }

  const isFinish = (index: number) => getStepStatus(index) === 'finish'
  const isProcess = (index: number) => getStepStatus(index) === 'process'
  const isError = (index: number) => getStepStatus(index) === 'error'

  /**
   * Click-navigation guard: allow moving to finished steps (backward),
   * the current step, or ONE step past the last finished step (the natural
   * next); block jumping forward over unfinished steps.
   */
  const canGoTo = (step: number): boolean => {
    if (step < 0 || step >= total()) return false
    if (config.items[step]?.disabled) return false
    if (config.clickNavigable === false) return true // free navigation
    const cur = effectiveCurrent()
    if (step <= cur) return true
    // forward: only a single step onto the first unfinished one
    return step === cur + 1
  }

  const goTo = (step: number) => {
    if (step < 0 || step >= total()) return
    if (config.items[step]?.disabled) return
    if (step === effectiveCurrent()) return
    _setCurrent(step)
    config.onChange?.(step)
  }

  /** Imperative move honoring the same guard as clicks. */
  const navigateTo = (step: number) => {
    if (!canGoTo(step)) return
    goTo(step)
  }

  const next = () => { if (effectiveCurrent() < total() - 1) navigateTo(effectiveCurrent() + 1) }
  const prev = () => { if (effectiveCurrent() > 0) navigateTo(effectiveCurrent() - 1) }
  const reset = () => { if (effectiveCurrent() !== 0) { _setCurrent(0); config.onChange?.(0) } }

  /**
   * Overall progress 0-100 across all steps, optionally blending the current
   * step's `percent`. (n-1 + percent/100) / n — the finished steps count
   * fully, the current one fractionally.
   */
  const percentOf = createMemo(() => {
    const n = total()
    if (n <= 0) return 0
    const cur = Math.min(current(), n - 1)
    const stepPercent = config.percent !== undefined ? Math.max(0, Math.min(100, config.percent)) : 0
    return Math.round(((cur + stepPercent / 100) / n) * 100)
  })

  const refs: StepsIns = {
    current,
    next,
    prev,
    reset
  }

  return {
    current,
    total,
    getStepStatus,
    isFinish,
    isProcess,
    isError,
    canGoTo,
    goTo,
    navigateTo,
    next,
    prev,
    reset,
    percentOf,
    refs
  }
}

export const stepsSplits: (keyof StepsConfig)[] = ['current', 'items', 'status', 'onChange', 'clickNavigable', 'percent']
