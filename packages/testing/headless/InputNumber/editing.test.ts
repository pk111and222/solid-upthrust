import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { createInputNumber } from '../../../competence/src/inputNumber'
const disposers: (() => void)[] = []
afterEach(() => disposers.splice(0).forEach(dispose => dispose()))
function owned(fn: () => void) { createRoot(dispose => { disposers.push(dispose); fn() }) }
const act = (fn: () => void) => { fn(); flush() }

// 清空及越界失焦修正必须各通知一次，重复提交不能重发。
it('[input-number.commit.events] clear clamp and deduplicate', () => owned(() => {
  const change = vi.fn(), ins = createInputNumber({ defaultValue: 5, max: 10, onChange: change })
  act(() => ins.notifyFocus()); act(() => ins.setInputText(''))
  expect(change.mock.calls).toEqual([[null]])
  act(() => ins.setInputText('55')); act(() => ins.commit())
  expect(change.mock.calls).toEqual([[null], [55], [10]])
  act(() => ins.commit()); expect(change).toHaveBeenCalledTimes(3)
}))
// 受控步进只提出意图，父层拒绝时显示保持原值，外部更新在聚焦期间也可见。
it('[input-number.controlled] rejected step and external value', () => owned(() => {
  const [value, set] = createSignal<number | null>(2, { ownedWrite: true }), change = vi.fn()
  const ins = createInputNumber({ get value() { return value() }, onChange: change })
  act(() => ins.notifyFocus()); act(() => ins.up())
  expect(ins.value()).toBe(2); expect(ins.displayValue()).toBe('2'); expect(change).toHaveBeenCalledWith(3)
  act(() => set(8)); expect(ins.displayValue()).toBe('8')
  act(() => ins.setInputText('')); expect(ins.displayValue()).toBe('')
  act(() => ins.commit()); expect(ins.displayValue()).toBe('8')
  act(() => set(null)); expect(ins.displayValue()).toBe('')
}))
// 默认小数失焦不截断，整数步进保留已有小数，指数步长正确累计。
it('[input-number.precision] fractional values and exponent step', () => owned(() => {
  const a = createInputNumber({ defaultValue: 1.25 }); act(() => a.commit()); expect(a.value()).toBe(1.25)
  act(() => a.up()); expect(a.value()).toBe(2.25)
  const b = createInputNumber({ step: 1e-7 }); act(() => b.up()); act(() => b.up()); expect(b.value()).toBe(2e-7)
  const c = createInputNumber({ defaultValue: 0, step: 1, max: 0.25, precision: 0 }); act(() => c.up()); expect(c.value()).toBeLessThanOrEqual(0.25)
}))
// 步进偏移取操作前值，父层同步接受也不能把 offset 算成零。
it('[input-number.step.events] offset before callback', () => owned(() => {
  const [value, set] = createSignal<number | null>(2, { ownedWrite: true }), step = vi.fn()
  const ins = createInputNumber({ get value() { return value() }, step: 0.5, onChange: set, onStep: step })
  act(() => ins.up()); expect(step).toHaveBeenLastCalledWith(2.5, { offset: 0.5, type: 'up' })
  act(() => ins.down(true)); expect(step).toHaveBeenLastCalledWith(-2.5, { offset: -5, type: 'down' })
}))
// 默认值不随更新重置；禁用或只读后的失焦不得再修改已有值。
it('[input-number.dynamic] default and gates', () => owned(() => {
  const [disabled, setDisabled] = createSignal(false, { ownedWrite: true }), change = vi.fn()
  const ins = createInputNumber({ defaultValue: 4, max: 5, get disabled() { return disabled() }, onChange: change })
  act(() => ins.notifyFocus()); act(() => ins.setInputText('8')); act(() => setDisabled(true)); act(() => ins.commit())
  expect(ins.value()).toBe(8); expect(change.mock.calls).toEqual([[8]]); expect(ins.canDown()).toBe(false)
}))
// 无法解析的文本只在失焦时提交空值，格式化显示不再反向污染数值。
it('[input-number.parser] draft and display separation', () => owned(() => {
  const change = vi.fn(), ins = createInputNumber({ defaultValue: 3, formatter: v => `USD ${v}`, onChange: change })
  act(() => ins.notifyFocus()); act(() => ins.setInputText('1e')); expect(ins.displayValue()).toBe('1e'); expect(ins.value()).toBe(3)
  act(() => ins.commit()); expect(ins.value()).toBe(null); expect(change).toHaveBeenCalledWith(null)
  act(() => ins.setValue(12)); act(() => ins.commit()); expect(ins.value()).toBe(12); expect(ins.displayValue()).toBe('USD 12')
}))
// 动态范围/精度/步长和格式化生效，readonly 阻止编辑；兼容数组步长仍按 1。
it('[input-number.options.dynamic] range precision format and legacy step', () => owned(() => {
  const [max, setMax] = createSignal(10, { ownedWrite: true }), [step, setStep] = createSignal<number | number[]>(0.5, { ownedWrite: true }), [readonly, setReadonly] = createSignal(false, { ownedWrite: true }), [unit, setUnit] = createSignal('$', { ownedWrite: true })
  const change = vi.fn(), ins = createInputNumber({ defaultValue: 2, get max() { return max() }, get step() { return step() }, get readonly() { return readonly() }, formatter: value => `${unit()}${value}`, onChange: change })
  act(() => setMax(2)); expect(ins.canUp()).toBe(false); act(() => ins.up()); expect(change).not.toHaveBeenCalled()
  act(() => setMax(10)); act(() => setStep([2, 4])); act(() => ins.up()); expect(ins.value()).toBe(3)
  act(() => setUnit('¥')); expect(ins.displayValue()).toBe('¥3')
  act(() => setReadonly(true)); act(() => ins.setInputText('8')); act(() => ins.down()); expect(ins.value()).toBe(3); expect(ins.isReadonly()).toBe(true)
  act(() => setReadonly(false)); act(() => setStep(0)); act(() => ins.up()); expect(ins.value()).toBe(3)
}))
// 父层接受输入后再重置到初值，不能重新显示初值时留下的旧草稿。
it('[input-number.controlled.reset] reset while focused discards accepted draft', () => owned(() => {
  const [value, set] = createSignal<number | null>(2, { ownedWrite: true })
  const ins = createInputNumber({ get value() { return value() }, onChange: set })
  act(() => ins.notifyFocus()); act(() => ins.setInputText('9')); expect(ins.displayValue()).toBe('9')
  act(() => set(2)); expect(ins.displayValue()).toBe('2')
  act(() => ins.setInputText('7')); act(() => set(5)); act(() => set(7)); expect(ins.displayValue()).toBe('7')
  act(() => ins.commit()); expect(ins.value()).toBe(7)
}))
