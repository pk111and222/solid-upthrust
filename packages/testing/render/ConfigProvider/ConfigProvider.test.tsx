import { render } from '@solidjs/web'
import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it } from 'vitest'
import ConfigProvider, { themeStyle, useComponentProps } from '../../../components/lib/ConfigProvider/index'
import { ConfigPortal } from '../../../components/lib/ConfigProvider/Portal'
import Input from '../../../components/lib/Input'
import Button from '../../../components/lib/Button'
import Form from '../../../components/lib/Form'
import { CheckboxGroup } from '../../../components/lib/Checkbox'
import { RadioGroup } from '../../../components/lib/Radio'
let dispose: (() => void) | undefined
const hosts: HTMLElement[] = []
const mount = (view: Parameters<typeof render>[0]) => { const host = document.createElement('div'); document.body.append(host); hosts.push(host); dispose = render(view, host); flush(); return host }
afterEach(() => { dispose?.(); flush(); hosts.splice(0).forEach(host => host.remove()) })
const Probe = (props: { size?: 'small' | 'middle' | 'large'; disabled?: boolean }) => {
  const config = useComponentProps('Input', props)
  return <output>{config.size ?? 'unset'}:{String(config.disabled)}</output>
}
describe('ConfigProvider defaults', () => {
  // 显式禁用高于全局默认值。
  it('[config-provider.contract.1] keeps explicit group disabling above provider defaults', () => {
    const host = mount(() => <ConfigProvider componentDisabled={false}><CheckboxGroup disabled options={[{value:'a',label:'A'}]} /><RadioGroup disabled options={[{value:'b',label:'B'}]} /></ConfigProvider>)
    expect([...host.querySelectorAll('input')].map(el => el.disabled)).toEqual([true,true])
  })

  // 嵌套继承保留显式 false。
  it('[config-provider.contract.2] merges nested defaults and preserves explicit false', () => {
    const host = mount(() => <ConfigProvider componentSize="large" componentDisabled components={{ Input: { placeholder: 'outer' } }}>
      <Probe /><ConfigProvider componentSize="small"><Probe /><Probe size="middle" disabled={false} /></ConfigProvider><Probe />
    </ConfigProvider>)
    expect([...host.querySelectorAll('output')].map(el => el.textContent)).toEqual(['large:true','small:true','middle:false','large:true'])
  })
  // 隔离配置不影响同级区域。
  it('[config-provider.contract.3] supports default isolation without leaking to siblings', () => {
    const host = mount(() => <><ConfigProvider componentSize="large" componentDisabled><ConfigProvider inherit={false}><Probe /></ConfigProvider></ConfigProvider><Probe /></>)
    expect([...host.querySelectorAll('output')].map(el => el.textContent)).toEqual(['unset:undefined','unset:undefined'])
  })
  // 更新配置保留输入节点和用户内容。
  it('[config-provider.contract.4] updates defaults reactively without replacing input DOM or value', () => {
    const [size, setSize] = createSignal<'small'|'large'>('small', { ownedWrite: true })
    const [disabled, setDisabled] = createSignal(false, { ownedWrite: true })
    const host = mount(() => <ConfigProvider componentSize={size()} componentDisabled={disabled()}><Probe /><Input defaultValue="kept" /></ConfigProvider>)
    const input = host.querySelector('input')!
    setSize('large'); setDisabled(true); flush()
    expect(host.querySelector('output')!.textContent).toBe('large:true'); expect(input.disabled).toBe(true); expect(host.querySelector('input')).toBe(input); expect(input.value).toBe('kept')
  })
  // 同物料默认值按属性浅合并。
  it('[config-provider.contract.5] merges individual component defaults with nearer properties taking priority', () => {
    const host = mount(() => <ConfigProvider components={{ Input: { size: 'large', placeholder: 'parent' } }}><ConfigProvider components={{ Input: { placeholder: 'child' } }}><Input /><Input placeholder="explicit" /></ConfigProvider></ConfigProvider>)
    expect([...host.querySelectorAll('input')].map(el => el.placeholder)).toEqual(['child','explicit'])
  })
  // 表单默认值优先于组件配置。
  it('[config-provider.contract.6] preserves Form defaults and explicit control overrides', () => {
    const host = mount(() => <ConfigProvider componentSize="large" componentDisabled><Form size="small" disabled={false}><Probe /><Input /><Input disabled /><Button>Submit</Button></Form></ConfigProvider>)
    expect(host.querySelector('output')!.textContent).toBe('small:false')
    expect([...host.querySelectorAll('input')].map(el => el.disabled)).toEqual([false,true]); expect(host.querySelector('button')!.disabled).toBe(false)
  })
})
describe('ConfigProvider theme scope', () => {
  // 颜色及透明度转换与前缀兼容。
  it('[config-provider.contract.7] converts semantic colors and alpha to existing UnoCSS variables', () => {
    expect(themeStyle({ colors: { primary: '#ff000080', onPrimary: '#fff' } })).toMatchObject({ '--upthrust-colors-primary': '255 0 0', '--upthrust-colors-on-primary': '255 255 255', '--colors-on-primary': 'rgb(255, 255, 255)' })
    expect(themeStyle({ prefix: '--brand', colors: { primary: '#00f' } })['--brand-colors-primary']).toBe('0 0 255')
    expect(themeStyle({ colors: { primary: 'invalid' } })).toEqual({})
  })
  // 主题更新删除旧变量且不污染根节点。
  it('[config-provider.contract.8] updates and removes local tokens without modifying document root', () => {
    const [colors, setColors] = createSignal<Record<string,string>>({primary:'#f00'}, {ownedWrite:true})
    const host = mount(() => <ConfigProvider theme={{colors:colors()}}><span>Theme</span></ConfigProvider>)
    const scope = host.firstElementChild as HTMLElement
    expect(scope.style.getPropertyValue('--upthrust-colors-primary')).toBe('255 0 0')
    setColors({}); flush(); expect(scope.style.getPropertyValue('--upthrust-colors-primary')).toBe('')
    expect(document.documentElement.style.getPropertyValue('--upthrust-colors-primary')).toBe('')
  })
  // 弹层跟随最近作用域并尊重显式挂载。
  it('[config-provider.contract.9] keeps portals in the nearest scope and preserves an explicit mount', () => {
    const outside = document.createElement('div'); document.body.append(outside); hosts.push(outside)
    const host = mount(() => <ConfigProvider class="outer"><ConfigProvider class="inner"><ConfigPortal><span id="local-popup">Popup</span></ConfigPortal><ConfigPortal mount={outside}><span id="external-popup">External</span></ConfigPortal></ConfigProvider></ConfigProvider>)
    expect(document.getElementById('local-popup')!.closest('[data-upthrust-config]')?.className).toBe('inner')
    expect(outside.contains(document.getElementById('external-popup'))).toBe(true)
    expect(host.querySelectorAll('[data-upthrust-config]')).toHaveLength(2)
  })
  // 无配置时弹层挂载 body。
  it('[config-provider.contract.10] uses body portals without a provider', () => {
    const host = mount(() => <ConfigPortal><span id="body-popup">Popup</span></ConfigPortal>)
    expect(document.getElementById('body-popup')).not.toBeNull(); expect(host.contains(document.getElementById('body-popup'))).toBe(false)
  })
})
// 所有 wrapper 属性与自定义前缀共同验证，style 显式覆盖 theme。
it('[config-provider.wrapper.dom] wrapper 样式与主题优先级', () => {
  const host = mount(() => <ConfigProvider class="scope" theme={{prefix:'--brand',colors:{primary:'#f00','on-primary':'#fff'}}} style={{'--brand-colors-primary':'0 0 255',padding:'12px'}}>内容</ConfigProvider>)
  const scope = host.firstElementChild as HTMLElement
  expect(scope.className).toBe('scope'); expect(scope.textContent).toBe('内容'); expect(scope.style.padding).toBe('12px')
  expect(scope.style.getPropertyValue('--brand-colors-primary')).toBe('0 0 255')
  expect(scope.style.getPropertyValue('--brand-colors-on-primary')).toBe('255 255 255')
})
// 动态 components 与 inherit 更新验证浅合并和重置后的 DOM。
it('[config-provider.defaults.reactive] 动态切换继承与物料默认值', () => {
  const [inherit, setInherit] = createSignal(true, {ownedWrite:true})
  const [placeholder,setPlaceholder] = createSignal('子层', {ownedWrite:true})
  const host = mount(() => <ConfigProvider componentDisabled components={{ Input:{placeholder:'父层',size:'large'} }}><ConfigProvider inherit={inherit()} components={{Input:{placeholder:placeholder()}}}><Input /><Probe /></ConfigProvider></ConfigProvider>)
  const input = host.querySelector('input')!
  expect(input.disabled).toBe(true); expect(input.placeholder).toBe('子层')
  setInherit(false); setPlaceholder('新提示'); flush()
  expect(input.disabled).toBe(false); expect(input.placeholder).toBe('新提示'); expect(host.querySelector('input')).toBe(input)
  expect(host.querySelector('output')?.textContent).toBe('unset:undefined')
})
// 无容器配置只提供 Context，控件成为父布局的直接子元素，响应式默认值仍生效。
it('[config-provider.wrapper.fragment] 无额外 DOM 的默认属性', () => {
  const [disabled,setDisabled] = createSignal(false,{ownedWrite:true})
  const host = mount(() => <ConfigProvider wrapper={false} componentSize="small" componentDisabled={disabled()}><Button>A</Button><Button>B</Button></ConfigProvider>)
  expect(host.querySelector('[data-upthrust-config]')).toBeNull()
  expect([...host.children].map(el => el.tagName)).toEqual(['BUTTON','BUTTON'])
  setDisabled(true); flush()
  expect([...host.querySelectorAll('button')].every(button => button.disabled)).toBe(true)
})
// fragment 继承最近主题作用域；inherit=false 仅隔离默认属性，不改变主题和弹层归属。
it('[config-provider.wrapper.portal] 无容器嵌套和弹层挂载', () => {
  const host = mount(() => <ConfigProvider class="theme" componentDisabled><ConfigProvider wrapper={false} inherit={false}><Button>可操作</Button><ConfigPortal><span id="fragment-popup">弹层</span></ConfigPortal></ConfigProvider></ConfigProvider>)
  expect(host.querySelectorAll('[data-upthrust-config]')).toHaveLength(1)
  expect(host.querySelector('button')?.disabled).toBe(false)
  expect(document.getElementById('fragment-popup')?.closest('[data-upthrust-config]')?.className).toBe('theme')
})
// 顶层 fragment 没有主题挂载点时使用 body，不能一直停留在等待容器状态。
it('[config-provider.wrapper.body] 无主题容器时弹层使用 body', () => {
  const host = mount(() => <ConfigProvider wrapper={false}><ConfigPortal><span id="fragment-body-popup">弹层</span></ConfigPortal></ConfigProvider>)
  expect(document.getElementById('fragment-body-popup')).not.toBeNull()
  expect(host.contains(document.getElementById('fragment-body-popup'))).toBe(false)
})
