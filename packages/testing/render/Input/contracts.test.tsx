import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Input from '../../../components/lib/Input'
import Password from '../../../components/lib/Input/Password'
import TextArea from '../../../components/lib/Input/TextArea'
import Search from '../../../components/lib/Input/Search'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import { FormItemContext, type FormItemControl } from '../../../components/lib/Input/context'
import { mount } from '../../utils/mount'
let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })
function setup(view: Parameters<typeof mount>[0]) { const v = mount(view); dispose = v.dispose; return v.host }
function input(el: HTMLInputElement | HTMLTextAreaElement, value: string) { el.value = value; el.dispatchEvent(new InputEvent('input', { bubbles: true })); flush() }
// 原生属性、ref、焦点回调、Enter 和默认值均作用于真实输入节点。
it('[input.native.props] forwards public native contracts', () => {
  const ref = vi.fn(), focus = vi.fn(), blur = vi.fn(), enter = vi.fn()
  const host = setup(() => <Input id="field" name="field-name" type="email" placeholder="email" maxLength={8} defaultValue="a" class="custom" style={{ width: '123px' }} ref={ref} onFocus={focus} onBlur={blur} onPressEnter={enter} />)
  const el = host.querySelector('input')!
  expect(ref).toHaveBeenCalledWith(el); expect(el.id).toBe('field'); expect(el.name).toBe('field-name'); expect(el.type).toBe('email'); expect(el.placeholder).toBe('email'); expect(el.maxLength).toBe(8); expect(el.value).toBe('a')
  expect(host.firstElementChild?.classList.contains('custom')).toBe(true); expect((host.firstElementChild as HTMLElement).style.width).toBe('123px')
  el.focus(); el.blur(); el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
  expect(focus).toHaveBeenCalledTimes(1); expect(blur).toHaveBeenCalledTimes(1); expect(enter).toHaveBeenCalledTimes(1)
})
// 尺寸、状态与前后缀形成不同外观分支，输入节点保持唯一。
it.each(['small','middle','large'] as const)('[input.appearance.%s] size/status/affixes', size => {
  const host = setup(() => <Input size={size} status="warning" prefix="￥" suffix="元" defaultValue="12" showCount maxLength={5} />)
  expect(host.querySelectorAll('input')).toHaveLength(1); expect(host.textContent).toContain('￥'); expect(host.textContent).toContain('元'); expect(host.textContent).toContain('2 / 5'); expect(host.firstElementChild?.className).toContain('#faad14')
})
// 动态切换前后缀、清空和计数不得重建 input 或丢失焦点。
it('[input.affix.dynamic] stable focused input', () => {
  const [shown, setShown] = createSignal(false, { ownedWrite: true })
  const host = setup(() => <Input prefix={shown() ? '前' : undefined} suffix={shown() ? '后' : undefined} allowClear={shown()} showCount={shown()} defaultValue="x" />)
  const el = host.querySelector('input')!; el.focus(); setShown(true); flush()
  expect(host.querySelector('input')).toBe(el); expect(document.activeElement).toBe(el)
  setShown(false); flush(); expect(host.querySelector('input')).toBe(el)
})
// 自定义清空图标支持键盘，清空后输入回焦；只读更新会移除可操作图标。
it('[input.clear.keyboard] custom icon and readonly', () => {
  const [readonly, setReadonly] = createSignal(false, { ownedWrite: true })
  const host = setup(() => <Input defaultValue="x" readonly={readonly()} allowClear={{ clearIcon: <b>清除</b> }} />)
  const clear = host.querySelector('[aria-label="clear"]')!; expect(clear.textContent).toBe('清除')
  clear.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); flush()
  const el = host.querySelector('input')!; expect(el.value).toBe(''); expect(document.activeElement).toBe(el)
  input(el,'x'); setReadonly(true); flush(); expect(el.readOnly).toBe(true); expect(host.querySelector('[aria-label="clear"]')).toBeNull()
})
// 计数支持格式化，关闭后移除；长度使用 JS 字符串长度，不声称字素计数。
it('[input.count.formatter] custom and disabled count', () => {
  const [count, setCount] = createSignal(true, { ownedWrite: true })
  const host = setup(() => <Input defaultValue="😀" showCount={count() ? { formatter: ({ count, value }) => `${value}:${count}` } : false} />)
  expect(host.textContent).toContain('😀:2'); setCount(false); flush(); expect(host.textContent).not.toContain('😀:2')
})
// 表单字段提供 value/id/disabled/size/status，显式 props 和回调有优先权。
it('[input.context.precedence] reactive field injection and explicit override', () => {
  const [value, setValue] = createSignal('field', { ownedWrite: true }), change = vi.fn()
  const context: FormItemControl = { value, onChange: setValue, id: () => 'field-id', disabled: () => true, size: () => 'large', validateStatus: () => 'error' }
  const host = setup(() => <FormItemContext value={context}><Input /><Input value="explicit" disabled={false} id="explicit-id" size="small" status="warning" onChange={change} /></FormItemContext>)
  const [a,b] = host.querySelectorAll('input'); expect(a.value).toBe('field'); expect(a.disabled).toBe(true); expect(a.id).toBe('field-id'); expect(a.className).toContain('h-control-lg'); expect(a.className).toContain('border-error')
  expect(b.disabled).toBe(false); expect(b.id).toBe('explicit-id'); input(b,'requested'); expect(change).toHaveBeenCalled(); expect(value()).toBe('field'); expect(b.value).toBe('explicit')
  setValue('updated'); flush(); expect(a.value).toBe('updated')
})
// 全局配置动态禁用密码切换与搜索操作，显式 disabled=false 可覆盖。
it('[input.context.global] global disabled applies to actions', () => {
  const search = vi.fn(), visible = vi.fn()
  const host = setup(() => <ConfigProvider componentDisabled><Password onVisibleChange={visible} /><Search onSearch={search} /><Input disabled={false} /></ConfigProvider>)
  const eye = host.querySelector('[aria-label="显示密码"]') as HTMLElement
  expect(eye.getAttribute('aria-disabled')).toBe('true'); eye.click(); expect(visible).not.toHaveBeenCalled()
  const button = host.querySelector('[aria-label="搜索"]') as HTMLButtonElement; expect(button.disabled).toBe(true); button.click(); expect(search).not.toHaveBeenCalled()
  expect([...host.querySelectorAll('input')].at(-1)?.disabled).toBe(false)
})
// Password 点击和键盘切换只改变 type，不重建输入节点；visibilityToggle=false 隐藏开关。
it('[input.password.toggle] click keyboard and toggle flag', () => {
  const [toggle, setToggle] = createSignal(true, { ownedWrite: true }), changed = vi.fn()
  const host = setup(() => <Password visibilityToggle={toggle()} defaultValue="secret" onVisibleChange={changed} />)
  const el = host.querySelector('input')!; const eye = host.querySelector('[role="button"]') as HTMLElement
  eye.click(); flush(); expect(el.type).toBe('text'); expect(host.querySelector('input')).toBe(el)
  eye.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })); flush(); expect(el.type).toBe('password'); expect(changed.mock.calls).toEqual([[true],[false]])
  setToggle(false); flush(); expect(host.querySelector('[role="button"]')).toBeNull()
})
// Password hover 进入显示、离开恢复；受控值由父层决定。
it('[input.password.hover-controlled] hover restore and controlled refusal', () => {
  const changed = vi.fn(); const [controlled, setControlled] = createSignal<boolean | undefined>(undefined, { ownedWrite: true })
  const host = setup(() => <Password action="hover" visible={controlled()} onVisibleChange={changed} />)
  const el = host.querySelector('input')!, eye = host.querySelector('[role="button"]')!
  eye.dispatchEvent(new MouseEvent('mouseenter')); flush(); expect(el.type).toBe('text')
  eye.dispatchEvent(new MouseEvent('mouseleave')); flush(); expect(el.type).toBe('password')
  setControlled(false); flush(); eye.dispatchEvent(new MouseEvent('mouseenter')); flush(); expect(el.type).toBe('password')
})
// 搜索两种按钮形式均报告当前值，loading 期间 Enter 和按钮都无效，class/suffix 不被覆盖。
it.each([false,true,'查找'])('[input.search.modes] enterButton=%s', enterButton => {
  const search = vi.fn(), ref = vi.fn(); const [loading,setLoading] = createSignal(false, { ownedWrite: true })
  const host = setup(() => <Search enterButton={enterButton} onSearch={search} loading={loading()} defaultValue="q" class="search-class" suffix="尾" ref={ref} />)
  const el = host.querySelector('input')!; expect(ref).toHaveBeenCalledWith(el); expect(host.querySelector('.search-class')).not.toBeNull(); expect(host.textContent).toContain('尾')
  el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); flush()
  expect(search).toHaveBeenLastCalledWith('q',expect.any(KeyboardEvent),{source:'input'})
  setLoading(true); flush(); el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); (host.querySelector('[aria-label="搜索"]') as HTMLElement).click(); flush(); expect(search).toHaveBeenCalledTimes(1)
})
// Search 不抢占表单字段值或默认 onChange，搜索读取实际字段内容。
it('[input.search.context] value and callback injection', () => {
  const [value,setValue] = createSignal('field', { ownedWrite: true }), search=vi.fn()
  const context: FormItemControl = { value, onChange: setValue, id:()=>undefined, disabled:()=>false, size:()=> 'small', validateStatus:()=>undefined }
  const host = setup(() => <FormItemContext value={context}><Search onSearch={search} /></FormItemContext>)
  const el = host.querySelector('input')!; expect(el.value).toBe('field'); input(el,'new'); expect(value()).toBe('new')
  ;(host.querySelector('[aria-label="搜索"]') as HTMLElement).click(); expect(search).toHaveBeenLastCalledWith('new',expect.any(MouseEvent),{source:'input'})
})
// 文本域原生属性、计数格式、清空及回焦采用相同输入契约。
it('[input.textarea.props] native attributes count and clear', () => {
  const ref=vi.fn(), change=vi.fn(), enter=vi.fn()
  const host=setup(()=><TextArea rows={5} id="ta" name="memo" placeholder="备注" defaultValue="abc" maxLength={8} status="error" class="ta" style={{width:'200px'}} ref={ref} showCount={{formatter:({count})=>`${count} 字`}} allowClear onChange={change} onPressEnter={enter} />)
  const el=host.querySelector('textarea')!; expect(Number(el.rows)).toBe(5); expect(el.id).toBe('ta'); expect(el.name).toBe('memo'); expect(el.maxLength).toBe(8); expect(el.placeholder).toBe('备注'); expect(ref).toHaveBeenCalledWith(el); expect(host.textContent).toContain('3 字'); expect(el.className).toContain('border-error')
  el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); expect(enter).toHaveBeenCalledTimes(1)
  ;(host.querySelector('[aria-label="clear"]') as HTMLElement).click(); flush(); expect(el.value).toBe(''); expect(document.activeElement).toBe(el); expect(change).toHaveBeenCalledTimes(1)
})
// 文本域只读/禁用隐藏清空按钮，受控更新生效；关闭自动高度移除镜像并恢复 rows。
it('[input.textarea.dynamic] readonly disabled value and autosize cleanup', () => {
  const [auto,setAuto]=createSignal(true,{ownedWrite:true}), [value,setValue]=createSignal('a',{ownedWrite:true})
  const before=document.querySelectorAll('textarea').length
  const host=setup(()=><TextArea autoSize={auto()} rows={4} value={value()} readonly disabled allowClear showCount />)
  const el=host.querySelector('textarea')!; expect(el.disabled).toBe(true); expect(el.readOnly).toBe(true); expect(host.querySelector('[aria-label="clear"]')).toBeNull()
  setValue('long'); setAuto(false); flush(); expect(el.value).toBe('long'); expect(Number(el.rows)).toBe(4); expect(document.querySelectorAll('textarea')).toHaveLength(before+1)
})
// enterButton 动态切换只改变搜索按钮布局，不替换输入节点、不重复渲染按钮。
it('[input.search.dynamic-mode] switches modes without remounting input', () => {
  const [enter,setEnter]=createSignal(false,{ownedWrite:true})
  const host=setup(()=><Search enterButton={enter()} defaultValue="keep" />)
  const el=host.querySelector('input')!
  setEnter(true);flush();expect(host.querySelector('input')).toBe(el);expect(host.querySelectorAll('[aria-label="搜索"]')).toHaveLength(1)
  setEnter(false);flush();expect(host.querySelector('input')).toBe(el);expect(host.querySelectorAll('[aria-label="搜索"]')).toHaveLength(1)
})
// 文本域自动测量通知宽高，并在卸载时断开宽度观察器。
it('[input.textarea.resize-disposal] observes width and disconnects', () => {
  const resize=vi.fn(), disconnect=vi.fn(), observe=vi.fn()
  vi.stubGlobal('ResizeObserver', class { observe=observe; disconnect=disconnect })
  try {
    setup(()=><TextArea autoSize={{minRows:2,maxRows:4}} onResize={resize} />)
    expect(observe).toHaveBeenCalledTimes(1);expect(resize).toHaveBeenCalledWith(expect.objectContaining({width:expect.any(Number),height:expect.any(Number)}))
    dispose();dispose=()=>{};expect(disconnect).toHaveBeenCalledTimes(1)
  } finally { vi.unstubAllGlobals() }
})
