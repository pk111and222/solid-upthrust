import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import InputNumber from '../../../components/lib/InputNumber'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import { FormItemContext, type FormItemControl } from '../../../components/lib/Input/context'
import { mount } from '../../utils/mount'
let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })
function setup(view: Parameters<typeof mount>[0]) { const result = mount(view); dispose = result.dispose; return result.host }
function type(input: HTMLInputElement, text: string) { input.value = text; input.dispatchEvent(new Event('input', { bubbles: true })); flush() }
function key(input: HTMLInputElement, name: string, shiftKey = false) { input.dispatchEvent(new KeyboardEvent('keydown', { key: name, shiftKey, bubbles: true })); flush() }

// 父层拒绝步进时原生输入与 ARIA 都保持原值，动态 props 更新也同步聚焦文本。
it('[input-number.controlled.dom] reject and update', () => {
  const [value, set] = createSignal<number | null>(2, { ownedWrite: true }), change = vi.fn()
  const host = setup(() => <InputNumber value={value()} onChange={change}/>), input = host.querySelector('input')!
  input.focus(); flush(); key(input, 'ArrowUp'); expect(input.value).toBe('2'); expect(input.getAttribute('aria-valuenow')).toBe('2')
  expect(change).toHaveBeenCalledWith(3, undefined); set(7); flush(); expect(input.value).toBe('7')
  type(input, ''); expect(input.value).toBe(''); input.blur(); flush(); expect(input.value).toBe('7')
})
// 更新默认值不能重建组件状态或导致输入失焦。
it('[input-number.default.once] preserve instance', () => {
  const [seed, set] = createSignal(2, { ownedWrite: true })
  const host = setup(() => <InputNumber defaultValue={seed()}/>), input = host.querySelector('input')!
  input.focus(); flush(); type(input, '4'); set(9); flush(); expect(input.value).toBe('4'); expect(document.activeElement).toBe(input)
})
// 格式化、步进、失焦回调顺序和原生属性透传构成一个完整输入流程。
it('[input-number.native] props events and formatting', () => {
  const focus = vi.fn(), blur = vi.fn(), enter = vi.fn(), step = vi.fn(), change = vi.fn(); let ref: HTMLInputElement | undefined
  const host = setup(() => <InputNumber id="price" name="price" placeholder="金额" min={0} max={100} defaultValue={12.5} step={0.5} shiftMultiplier={2} precision={2} formatter={v => `$${v}`} parser={t => t.replace('$', '')} prefix={<b>¥</b>} suffix={<i>元</i>} class="custom-number" style={{ width: '180px' }} ref={el => { ref = el }} onChange={change} onFocus={focus} onBlur={blur} onPressEnter={enter} onStep={step}/>), input = host.querySelector('input')!
  expect(ref).toBe(input); expect(input.id).toBe('price'); expect(input.name).toBe('price'); expect(input.placeholder).toBe('金额'); expect(input.getAttribute('role')).toBe('spinbutton'); expect(input.getAttribute('aria-valuemin')).toBe('0'); expect(input.getAttribute('aria-valuemax')).toBe('100'); expect(input.value).toBe('$12.5'); expect(host.querySelector('b')?.textContent).toBe('¥'); expect(host.querySelector('i')?.textContent).toBe('元'); expect(input.parentElement?.style.width).toBe('180px'); expect(input.parentElement?.classList.contains('custom-number')).toBe(true)
  input.focus(); flush(); expect(focus).toHaveBeenCalledWith(expect.any(FocusEvent)); key(input, 'ArrowUp', true); expect(step).toHaveBeenCalledWith(13.5, { offset: 1, type: 'up' }); key(input, 'Enter'); expect(enter).toHaveBeenCalledWith(expect.any(KeyboardEvent))
  type(input, '$22.456'); input.blur(); flush(); expect(input.value).toBe('$22.46'); expect(change).toHaveBeenLastCalledWith(22.46, undefined); expect(blur).toHaveBeenCalledWith(expect.any(FocusEvent))
})
// 无按钮仍可键盘步进，动态禁用和只读阻止输入/步进并移除按钮。
it('[input-number.gates.dom] controls disabled readonly', () => {
  const [disabled, setDisabled] = createSignal(false, { ownedWrite: true }), [readonly, setReadonly] = createSignal(false, { ownedWrite: true }), [controls, setControls] = createSignal(false, { ownedWrite: true }), change = vi.fn()
  const host = setup(() => <InputNumber defaultValue={2} disabled={disabled()} readonly={readonly()} controls={controls()} onChange={change}/>), input = host.querySelector('input')!
  expect(host.querySelectorAll('[role=button]')).toHaveLength(0); key(input, 'ArrowUp'); expect(input.value).toBe('3'); setControls(true); flush(); expect(host.querySelectorAll('[role=button]')).toHaveLength(2)
  setReadonly(true); flush(); expect(input.readOnly).toBe(true); key(input, 'ArrowUp'); expect(change).toHaveBeenCalledTimes(1); expect(host.querySelectorAll('[role=button]')).toHaveLength(0)
  setReadonly(false); setDisabled(true); flush(); expect(input.disabled).toBe(true); key(input, 'ArrowDown'); expect(change).toHaveBeenCalledTimes(1)
})
// 边界按钮具有禁用语义，越界文本用 aria-invalid 提示，失焦修正后移除。
it('[input-number.bounds.dom] action and invalid semantics', () => {
  const host = setup(() => <InputNumber defaultValue={10} min={0} max={10}/>), input = host.querySelector('input')!, up = host.querySelector('[aria-label=increase]')!
  expect(up.getAttribute('aria-disabled')).toBe('true'); input.focus(); flush(); type(input, '99'); expect(input.getAttribute('aria-invalid')).toBe('true'); input.blur(); flush(); expect(input.value).toBe('10'); expect(input.getAttribute('aria-invalid')).not.toBe('true')
})
// 字段注入支持数字和 null，显式 props 覆盖字段与全局配置。
it('[input-number.form] field injection and priority', () => {
  const [value, set] = createSignal<number | null>(2, { ownedWrite: true }), field = vi.fn((v: number | null) => set(v)), explicit = vi.fn()
  const ctx: FormItemControl = { value, onChange: field, id: () => 'quantity', disabled: () => false, size: () => 'small', validateStatus: () => 'error' }
  const host = setup(() => <ConfigProvider componentDisabled><FormItemContext value={ctx}><InputNumber/><InputNumber id="explicit" value={0} disabled={false} size="large" status="warning" onChange={explicit}/></FormItemContext></ConfigProvider>), inputs = host.querySelectorAll('input')
  expect(inputs[0].id).toBe('quantity'); expect(inputs[0].disabled).toBe(false); expect(inputs[0].parentElement?.className).toContain('h-control-sm'); expect(inputs[0].getAttribute('aria-invalid')).toBe('true'); inputs[0].focus(); flush(); type(inputs[0], ''); expect(value()).toBe(null); expect(field).toHaveBeenCalledWith(null, undefined)
  key(inputs[1], 'ArrowUp'); expect(explicit).toHaveBeenCalledWith(1, undefined); expect(field).toHaveBeenCalledTimes(1); expect(inputs[1].value).toBe('0'); expect(inputs[1].parentElement?.className).toContain('h-control-lg')
})
// 输入法组合过程不提交中间文本、不响应方向键；组合结束才解析并通知。
it('[input-number.composition] defer editing during IME', () => {
  const change = vi.fn(), host = setup(() => <InputNumber defaultValue={2} onChange={change}/>), input = host.querySelector('input')!
  input.focus(); flush(); input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true })); type(input, '3'); key(input, 'ArrowUp'); expect(change).not.toHaveBeenCalled()
  input.value = '33'; input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })); flush(); expect(change).toHaveBeenCalledWith(33, undefined); expect(input.value).toBe('33')
})
