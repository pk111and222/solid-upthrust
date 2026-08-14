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
}

export type StepsIns = {
  current: () => number
  next: () => void
  prev: () => void
  reset: () => void
}

export const createSteps = (config: StepsConfig) => {
  const [_current, _setCurrent] = createSignal(config.current ?? 0)

  const current = createMemo(() => config.current !== undefined ? config.current : _current())

  const getStepStatus = (index: number): StepStatus => {
    const item = config.items[index]
    if (item?.status) return item.status
    const cur = current()
    if (index < cur) return 'finish'
    if (index === cur) return config.status || 'process'
    return 'wait'
  }

  const goTo = (step: number) => {
    if (step < 0 || step >= config.items.length) return
    if (config.items[step]?.disabled) return
    _setCurrent(step)
    config.onChange?.(step)
  }

  const next = () => goTo(current() + 1)
  const prev = () => goTo(current() - 1)
  const reset = () => goTo(0)

  const refs: StepsIns = {
    current,
    next,
    prev,
    reset
  }

  return {
    current,
    getStepStatus,
    goTo,
    next,
    prev,
    reset,
    refs
  }
}

export const stepsSplits: (keyof StepsConfig)[] = ['current', 'items', 'status', 'onChange']
