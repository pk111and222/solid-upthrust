import { createRoot, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createInputNumber } from '../../../competence/src/inputNumber'

const disposers: (() => void)[] = []
afterEach(() => { disposers.splice(0).forEach(dispose => dispose()) })
const owned = (fn: () => void) => createRoot(dispose => { disposers.push(dispose); fn() })

const step = (fn: () => void) => { fn(); flush() }

describe('createInputNumber — value state', () => {
  // 未提供初值时返回 null 与空显示。
  it('starts empty (null value, empty display)', () => {
    owned(() => {
      const ins = createInputNumber()
      expect(ins.value()).toBe(null)
      expect(ins.displayValue()).toBe('')
    })
  })

  // defaultValue 初始化小数状态。
  it('seeds from defaultValue', () => {
    owned(() => {
      const ins = createInputNumber({ defaultValue: 3.5 })
      expect(ins.value()).toBe(3.5)
      expect(ins.displayValue()).toBe('3.5')
    })
  })

  // 受控值保持权威，输入草稿独立存储。
  it('controlled value wins over the internal buffer', () => {
    owned(() => {
      const ins = createInputNumber({ value: 10 })
      step(() => ins.setInputText('42'))
      expect(ins.value()).toBe(10) // still the controlled prop
      expect(ins.textValue()).toBe('42') // buffer tracks the typing
    })
  })

  // 尾随小数点保留原始文本，同时提交合法数值。
  it('typing a half-number keeps the buffer but reports null-ish commits', () => {
    owned(() => {
      const onChange = vi.fn()
      const ins = createInputNumber({ onChange })
      step(() => ins.notifyFocus())
      step(() => ins.setInputText('1.'))
      expect(ins.textValue()).toBe('1.')
      expect(ins.displayValue()).toBe('1.') // focused shows the buffer
      expect(onChange).toHaveBeenLastCalledWith(1) // "1." parses to 1
    })
  })

  // 清空已经有值的输入通知 null。
  it('typing empty commits null', () => {
    owned(() => {
      const onChange = vi.fn()
      const ins = createInputNumber({ defaultValue: 5, onChange })
      step(() => ins.setInputText('7'))
      expect(onChange).toHaveBeenLastCalledWith(7)
      step(() => ins.setInputText(''))
      expect(onChange).toHaveBeenLastCalledWith(null)
      expect(ins.value()).toBe(null)
    })
  })
})

describe('createInputNumber — parser/formatter', () => {
  // parser 在数值转换前移除货币符号。
  it('parser strips currency symbols before numeric parsing', () => {
    owned(() => {
      const ins = createInputNumber({ parser: t => t.replace(/\$/g, '') })
      step(() => ins.setInputText('$12'))
      expect(ins.value()).toBe(12)
    })
  })

  // 非聚焦状态使用 formatter 显示数值。
  it('formatter renders the display text when unfocused', () => {
    owned(() => {
      const ins = createInputNumber({
        defaultValue: 1000,
        formatter: v => `$${v.toLocaleString()}`,
      })
      expect(ins.displayValue()).toBe('$1,000')
    })
  })
})

describe('createInputNumber — stepping', () => {
  // 默认单位步长支持增加和减少。
  it('steps by 1 by default', () => {
    owned(() => {
      const ins = createInputNumber({ defaultValue: 1 })
      step(() => ins.up())
      expect(ins.value()).toBe(2)
      step(() => ins.down())
      expect(ins.value()).toBe(1)
    })
  })

  // 自定义小数步长正确生效。
  it('respects a custom step', () => {
    owned(() => {
      const ins = createInputNumber({ defaultValue: 0, step: 0.1 })
      step(() => ins.up())
      expect(ins.value()).toBeCloseTo(0.1, 10)
    })
  })

  // Shift 步进默认放大十倍。
  it('multiplied stepping uses shiftMultiplier (default 10)', () => {
    owned(() => {
      const ins = createInputNumber({ defaultValue: 1 })
      step(() => ins.up(true))
      expect(ins.value()).toBe(11)
    })
  })

  // 空值步进以 min 或零为起点再应用步长。
  it('stepping from empty starts at min (or 0)', () => {
    owned(() => {
      const a = createInputNumber({ min: 5 })
      step(() => a.up())
      expect(a.value()).toBe(6)

      const b = createInputNumber()
      step(() => b.up())
      expect(b.value()).toBe(1)
    })
  })

  // 步进夹紧到范围，边界状态禁止继续增加。
  it('clamps into [min, max] and reports canUp/canDown', () => {
    owned(() => {
      const ins = createInputNumber({ defaultValue: 9, min: 0, max: 10 })
      step(() => ins.up())
      expect(ins.value()).toBe(10)
      expect(ins.canUp()).toBe(false)
      expect(ins.canDown()).toBe(true)
      step(() => ins.up()) // no-op at max
      expect(ins.value()).toBe(10)
    })
  })

  // 连续小数步进不累积常见浮点尾差。
  it('rounds to the derived step precision (0.1 step → 1 decimal)', () => {
    owned(() => {
      const ins = createInputNumber({ defaultValue: 0.1, step: 0.1, min: 0 })
      // 0.1 + 0.1 + 0.1 would be 0.30000000000000004 unrounded
      step(() => ins.up())
      step(() => ins.up())
      expect(ins.value()).toBe(0.3)
    })
  })

  // 显式 precision 在失焦时舍入程序写入值。
  it('explicit precision wins over the derived one', () => {
    owned(() => {
      const ins = createInputNumber({ defaultValue: 1, step: 1, precision: 2 })
      step(() => ins.up())
      expect(ins.value()).toBe(2)
      step(() => ins.setValue(3.456))
      expect(ins.value()).toBe(3.456) // value passes through; commit rounds
      step(() => ins.commit())
      expect(ins.value()).toBe(3.46)
    })
  })

  // onStep 报告操作前后偏移与方向。
  it('reports onStep with offset and direction', () => {
    owned(() => {
      const onStep = vi.fn()
      const ins = createInputNumber({ defaultValue: 2, onStep })
      step(() => ins.up())
      expect(onStep).toHaveBeenCalledWith(3, { offset: 1, type: 'up' })
    })
  })

  // 禁用状态禁止步进并禁用向上能力。
  it('disabled blocks stepping', () => {
    owned(() => {
      const ins = createInputNumber({ defaultValue: 1, disabled: true })
      step(() => ins.up())
      expect(ins.value()).toBe(1)
      expect(ins.canUp()).toBe(false)
    })
  })
})

describe('createInputNumber — commit (blur snap)', () => {
  // 越界草稿失焦后收敛到最大值并通知。
  it('clamps an out-of-range buffer on commit', () => {
    owned(() => {
      const onChange = vi.fn()
      const ins = createInputNumber({ min: 0, max: 10, onChange })
      step(() => ins.notifyFocus())
      step(() => ins.setInputText('55'))
      expect(ins.outOfRange()).toBe(true)
      step(() => ins.commit())
      expect(ins.value()).toBe(10)
      expect(ins.displayValue()).toBe('10')
      expect(onChange).toHaveBeenLastCalledWith(10)
    })
  })

  // 无法解析的草稿失焦后提交 null。
  it('an unparseable buffer commits null', () => {
    owned(() => {
      const ins = createInputNumber({ defaultValue: 3 })
      step(() => ins.notifyFocus())
      step(() => ins.setInputText('abc'))
      step(() => ins.commit())
      expect(ins.value()).toBe(null)
      expect(ins.displayValue()).toBe('')
    })
  })

  // 失焦完成后调用 onBlur。
  it('blur notifies onBlur after the snap', () => {
    owned(() => {
      const onBlur = vi.fn()
      const ins = createInputNumber({ onBlur })
      step(() => ins.notifyFocus())
      step(() => ins.commit())
      expect(onBlur).toHaveBeenCalledTimes(1)
    })
  })
})

describe('createInputNumber — setValue', () => {
  // 程序 setValue 更新非受控值并通知，支持清空。
  it('emits change and updates the buffer when uncontrolled', () => {
    owned(() => {
      const onChange = vi.fn()
      const ins = createInputNumber({ onChange })
      step(() => ins.setValue(7))
      expect(onChange).toHaveBeenCalledWith(7)
      expect(ins.value()).toBe(7)
      expect(ins.displayValue()).toBe('7')
      step(() => ins.setValue(null))
      expect(ins.value()).toBe(null)
    })
  })
})
