import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createRate } from '../../../competence/src/rate'

const step = (fn: () => void) => { fn(); flush() }

describe('createRate — value state', () => {
  // 未提供值时评分从 0 开始，展示值与提交值一致。
  it('defaults to 0 (unrated)', () => {
    createRoot(() => {
      const ins = createRate()
      expect(ins.value()).toBe(0)
      expect(ins.displayValue()).toBe(0)
    })
  })

  // defaultValue 只作为非受控实例的初始评分。
  it('seeds from defaultValue', () => {
    createRoot(() => {
      const ins = createRate({ defaultValue: 3 })
      expect(ins.value()).toBe(3)
    })
  })

  // 受控值优先，组件自身的点击不能越权改变它。
  it('controlled value wins', () => {
    createRoot(() => {
      const ins = createRate({ value: 2 })
      step(() => ins.clickAt(5))
      expect(ins.value()).toBe(2)
    })
  })

  // count 控制字符数量，默认是五颗星。
  it('count defaults to 5', () => {
    createRoot(() => {
      expect(createRate().count()).toBe(5)
      expect(createRate({ count: 10 }).count()).toBe(10)
    })
  })
})

describe('createRate — clicking', () => {
  // 点击字符提交吸附后的评分，并只通知一次 onChange。
  it('clickAt commits the value and fires onChange', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createRate({ onChange })
      step(() => ins.clickAt(4))
      expect(ins.value()).toBe(4)
      expect(onChange).toHaveBeenCalledWith(4)
    })
  })

  // 未开启清空时重复点击当前评分保持原值且不产生事件。
  it('re-clicking the current value is a no-op without allowClear', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createRate({ defaultValue: 3, onChange })
      step(() => ins.clickAt(3))
      expect(ins.value()).toBe(3)
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // 开启清空时重复点击当前评分只产生一次归零事件。
  it('allowClear: re-clicking the current value resets to 0', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createRate({ defaultValue: 3, allowClear: true, onChange })
      step(() => ins.clickAt(3))
      expect(ins.value()).toBe(0)
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(0)
    })
  })

  // allowHalf 将点击位置吸附到半星网格。
  it('allowHalf: fractional positions snap to halves', () => {
    createRoot(() => {
      const ins = createRate({ allowHalf: true })
      step(() => ins.clickAt(2.4)) // left half of star 3 → 2.5
      expect(ins.value()).toBe(2.5)
      step(() => ins.clickAt(2.8)) // right half → 3
      expect(ins.value()).toBe(3)
    })
  })

  // 整星模式将小数点击位置吸附到最近整星。
  it('whole mode snaps fractions to whole stars', () => {
    createRoot(() => {
      const ins = createRate()
      step(() => ins.clickAt(2.4))
      expect(ins.value()).toBe(2)
      step(() => ins.clickAt(2.6))
      expect(ins.value()).toBe(3)
    })
  })

  // 禁用实例拒绝点击写入。
  it('disabled blocks clicking', () => {
    createRoot(() => {
      const ins = createRate({ disabled: true })
      step(() => ins.clickAt(4))
      expect(ins.value()).toBe(0)
      expect(ins.isDisabled()).toBe(true)
    })
  })

  // 点击超出字符数量时评分被限制在 0 到 count。
  it('values clamp into 0..count', () => {
    createRoot(() => {
      const ins = createRate({ count: 5 })
      step(() => ins.clickAt(9))
      expect(ins.value()).toBe(5)
    })
  })
})

describe('createRate — hover preview', () => {
  // hover 只改变展示预览，不提交评分。
  it('hoverAt previews without committing', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createRate({ defaultValue: 1, onChange })
      step(() => ins.hoverAt(4))
      expect(ins.displayValue()).toBe(4)
      expect(ins.value()).toBe(1) // NOT committed
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // hover 进入和离开分别报告预览值与恢复后的提交值。
  it('onHoverChange fires on enter and restores on leave', () => {
    createRoot(() => {
      const onHoverChange = vi.fn()
      const ins = createRate({ defaultValue: 2, onHoverChange })
      step(() => ins.hoverAt(4))
      expect(onHoverChange).toHaveBeenLastCalledWith(4)
      step(() => ins.leaveHover())
      expect(onHoverChange).toHaveBeenLastCalledWith(2)
      expect(ins.displayValue()).toBe(2)
      expect(ins.isHovering()).toBe(false)
    })
  })

  // hover 后点击提交时展示值跟随新的评分。
  it('click commits while hovering — displayValue follows', () => {
    createRoot(() => {
      const ins = createRate()
      step(() => ins.hoverAt(3))
      step(() => ins.clickAt(3))
      expect(ins.value()).toBe(3)
      expect(ins.displayValue()).toBe(3)
      step(() => ins.leaveHover())
      expect(ins.displayValue()).toBe(3)
    })
  })

  // 半星模式的 hover 预览也遵循半星网格。
  it('half mode snaps the hover preview too', () => {
    createRoot(() => {
      const ins = createRate({ allowHalf: true })
      step(() => ins.hoverAt(2.3))
      expect(ins.displayValue()).toBe(2.5)
    })
  })

  // 禁用实例不产生 hover 预览。
  it('disabled ignores hover', () => {
    createRoot(() => {
      const ins = createRate({ disabled: true })
      step(() => ins.hoverAt(4))
      expect(ins.displayValue()).toBe(0)
    })
  })
})

describe('createRate — keyboard', () => {
  // 方向步进在整星与半星模式分别移动一个对应网格单位。
  it('stepBy moves by one star (halves by half)', () => {
    createRoot(() => {
      const whole = createRate({ defaultValue: 2 })
      step(() => whole.stepBy(1))
      expect(whole.value()).toBe(3)

      const half = createRate({ defaultValue: 2, allowHalf: true })
      step(() => half.stepBy(1))
      expect(half.value()).toBe(2.5)
    })
  })

  // reset 将当前评分清零。
  it('reset clears to 0', () => {
    createRoot(() => {
      const ins = createRate({ defaultValue: 4 })
      step(() => ins.reset())
      expect(ins.value()).toBe(0)
    })
  })

  // focus 与 blur 更新 headless 焦点状态并通知回调。
  it('focus/blur track the focused flag', () => {
    createRoot(() => {
      const onFocus = vi.fn()
      const onBlur = vi.fn()
      const ins = createRate({ onFocus, onBlur })
      step(() => ins.notifyFocus())
      expect(ins.isFocused()).toBe(true)
      expect(onFocus).toHaveBeenCalledTimes(1)
      step(() => ins.notifyBlur())
      expect(ins.isFocused()).toBe(false)
      expect(onBlur).toHaveBeenCalledTimes(1)
    })
  })

  // 动态受控值更新后，Rate 读取父层最新评分而不主动发事件。
  it('controlled value follows external updates', () => {
    createRoot(() => {
      const [current, setCurrent] = createSignal(2, { ownedWrite: true })
      const ins = createRate({ get value() { return current() } })
      expect(ins.value()).toBe(2)
      setCurrent(4)
      step(() => ins.hoverAt(5))
      expect(ins.value()).toBe(4)
      expect(ins.displayValue()).toBe(5)
    })
  })
})
