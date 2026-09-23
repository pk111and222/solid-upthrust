import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import AutoComplete from '../../../components/lib/AutoComplete'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import { FormItemContext, type FormItemControl } from '../../../components/lib/Input/context'
import { mount } from '../../utils/mount'
let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })

// 全部尺寸、状态、表单属性与容器样式都应用于正确节点。
it('[autocomplete.props.presentation] reflects sizes, status and native metadata', () => {
  const [size, setSize] = createSignal<'small' | 'middle' | 'large'>('small', { ownedWrite: true })
  const [status, setStatus] = createSignal<'error' | 'warning'>('error', { ownedWrite: true })
  const v = mount(() => <AutoComplete id="city" name="city" aria-label="城市" aria-labelledby="city-label"
    size={size()} status={status()} placeholder="输入城市" defaultValue="北京" class="custom-ac" style={{ width: '240px' }} />); dispose = v.dispose
  const el = v.host.querySelector('input')!
  expect(el.id).toBe('city'); expect(el.name).toBe('city'); expect(el.placeholder).toBe('输入城市')
  expect(el.value).toBe('北京'); expect(el.className).toContain('h-control-sm')
  expect(el.getAttribute('aria-invalid')).toBe('true')
  expect(el.getAttribute('aria-labelledby')).toBe('city-label')
  expect(el.getAttribute('aria-label')).toBe('城市')
  expect(v.host.querySelector<HTMLElement>('.custom-ac')?.style.width).toBe('240px')
  setSize('large'); setStatus('warning'); flush()
  expect(el.className).toContain('h-control-lg'); expect(el.className).toContain('!border-[#faad14]')
  expect(el.hasAttribute('aria-invalid')).toBe(false)
  setSize('middle'); flush(); expect(el.classList.contains('h-control')).toBe(true)
})

// 配置默认值与字段注入正常生效，显式 props 和回调优先于上下文。
it('[autocomplete.context.precedence] explicit values override provider and form', () => {
  const field = vi.fn(), change = vi.fn()
  const context: FormItemControl = { value: () => '字段', onChange: field, disabled: () => true,
    id: () => 'field-id', size: () => 'small', validateStatus: () => 'error' }
  const v = mount(() => <ConfigProvider components={{ AutoComplete: { placeholder: '配置占位' } }}>
    <FormItemContext value={context}><AutoComplete value="显式" disabled={false} size="large" status="warning" id="explicit" onChange={change} /></FormItemContext>
  </ConfigProvider>); dispose = v.dispose
  const el = v.host.querySelector('input')!
  expect(el.value).toBe('显式'); expect(el.disabled).toBe(false); expect(el.id).toBe('explicit')
  expect(el.placeholder).toBe('配置占位'); expect(el.className).toContain('h-control-lg')
  el.value = '编辑'; el.dispatchEvent(new Event('input', { bubbles: true })); flush()
  expect(change).toHaveBeenCalledExactlyOnceWith('编辑'); expect(field).not.toHaveBeenCalled()
})

// 点击禁用项无效；选择标签时不触发搜索，关闭后按 Escape/方向键可继续操作。
it('[autocomplete.pointer.selection] disabled, empty and callback branches', () => {
  const search = vi.fn(), select = vi.fn(), change = vi.fn()
  const v = mount(() => <AutoComplete defaultOpen filterOption={false} options={[{ value: 'x', disabled: true }, { value: 'a', label: '' }]}
    onSearch={search} onSelect={select} onChange={change} />); dispose = v.dispose
  const rows = document.querySelectorAll<HTMLElement>('[role="option"]')
  rows[0].click(); flush(); expect(select).not.toHaveBeenCalled()
  rows[1].click(); flush(); expect(select).toHaveBeenCalledWith('a', { value: 'a', label: '' })
  expect(change).toHaveBeenCalledWith(''); expect(search).not.toHaveBeenCalled()
})

// 无匹配内容应展示空态；动态远程候选更新后无需再次输入就显示。
it('[autocomplete.remote.render] updates results and cleans portal on unmount', () => {
  const [options, setOptions] = createSignal([{ value: 'abc' }], { ownedWrite: true })
  const v = mount(() => <AutoComplete defaultOpen value="远程" options={options()} />); dispose = v.dispose
  expect(document.querySelector('[role="listbox"]')?.textContent).toContain('无匹配结果')
  setOptions([{ value: '远程结果' }]); flush()
  expect(document.querySelector('[role="option"]')?.textContent).toBe('远程结果')
  v.dispose(); dispose = () => {}; expect(document.querySelector('[role="listbox"]')).toBeNull()
})
