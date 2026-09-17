import { render } from '@solidjs/web'
import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ColorPicker from '../../../components/lib/ColorPicker/index'
import { FormItemContext } from '../../../components/lib/Input/context'
let dispose: (() => void) | undefined
const mount = (view: Parameters<typeof render>[0]) => { const host = document.createElement('div'); document.body.append(host); dispose = render(view, host); flush(); return host }
const button = (host: ParentNode, text: string) => [...host.querySelectorAll('button')].find(el => el.textContent === text)!
const inputValue = (host: ParentNode, value: string) => { const input = host.querySelector<HTMLInputElement>('[aria-label="颜色值"]')!; input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); flush(); input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); flush(); return input }
afterEach(() => { dispose?.(); document.body.innerHTML = ''; flush() })
describe('ColorPicker material', () => {
  it('accepts text, shows errors and preserves the previous color on invalid input', () => {
    const onChange = vi.fn()
    const host = mount(() => <ColorPicker inline defaultValue="#f00" onChange={onChange} />)
    inputValue(host, '#00ff0080'); expect(onChange).toHaveBeenCalledTimes(1); expect(onChange.mock.calls[0][0].toHexString()).toBe('#00ff0080')
    inputValue(host, 'invalid'); expect(host.querySelector('[role=alert]')).not.toBeNull(); expect(onChange).toHaveBeenCalledTimes(1)
  })
  it('restores text after rejected controlled changes and follows accepted owner changes', () => {
    const [value, setValue] = createSignal('#f00', { ownedWrite: true })
    const host = mount(() => <ColorPicker inline value={value()} />)
    expect(inputValue(host, '#00f').value).toBe('#ff0000')
    setValue('#0f0'); flush(); expect(host.querySelector<HTMLInputElement>('[aria-label="颜色值"]')?.value).toBe('#00ff00')
  })
  it('supports presets, selected state and clear', () => {
    const onChange = vi.fn()
    const host = mount(() => <ColorPicker inline allowClear onChange={onChange} presets={[{ label: '推荐', colors: ['#f00', '#0f0'] }]} />)
    host.querySelector<HTMLButtonElement>('[aria-label="预设颜色 #ff0000"]')!.click(); flush()
    expect(host.querySelector('[aria-pressed=true]')).not.toBeNull()
    button(host, '清除').click(); flush(); expect(onChange.mock.calls.at(-1)).toEqual([null, ''])
  })
  it('completes a slider gesture only once and hides disabled alpha', () => {
    const onChangeComplete = vi.fn()
    const host = mount(() => <ColorPicker inline defaultValue="#f00" disabledAlpha onChangeComplete={onChangeComplete} />)
    expect(host.querySelector('[aria-label="透明度"]')).toBeNull()
    const slider = host.querySelector<HTMLInputElement>('[aria-label="色相"]')!
    slider.value = '120'; slider.dispatchEvent(new Event('input', { bubbles: true })); flush()
    expect(onChangeComplete).not.toHaveBeenCalled()
    slider.dispatchEvent(new Event('change', { bubbles: true })); slider.dispatchEvent(new Event('pointerup', { bubbles: true })); flush()
    expect(onChangeComplete).toHaveBeenCalledTimes(1)
  })
  it('integrates Form with a serialized value and invokes the public callback once', () => {
    const update = vi.fn(), onChange = vi.fn()
    const host = mount(() => <FormItemContext value={{ value: () => '#f00', onChange: update, validateStatus: () => undefined, id: () => 'color-field', disabled: () => false, size: () => 'middle' }}>
      <ColorPicker inline onChange={onChange} />
    </FormItemContext>)
    inputValue(host, '#00f'); expect(update).toHaveBeenCalledWith('#0000ff', undefined)
    expect(onChange).toHaveBeenCalledTimes(1); expect(onChange.mock.calls[0][0].toHexString()).toBe('#0000ff')
  })
  it('disables all interactive panel controls', () => {
    const host = mount(() => <ColorPicker inline disabled defaultValue="#f00" allowClear presets={[{ label: '推荐', colors: ['#00f'] }]} />)
    expect([...host.querySelectorAll<HTMLInputElement>('input, select, button')].every(el => el.disabled)).toBe(true)
  })
})
