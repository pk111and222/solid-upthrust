import { flush } from 'solid-js'
import { afterEach, expect, it } from 'vitest'
import { mount } from '../../utils/mount'
import Tooltip from '../../../components/lib/Tooltip'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {} })

function openClickTooltip(title: unknown) {
  const view = mount(() => (
    <Tooltip title={title as never} trigger="click">
      <button type="button">触发器</button>
    </Tooltip>
  ))
  cleanup = view.dispose
  view.host.querySelector('button')!.click(); flush()
  return { view, overlay: document.querySelector<HTMLElement>('[role="tooltip"]') }
}

// 字符串、JSX 与数字 0 都是有效标题，点击后应在 Portal 中挂载浮层内容。
it('[tooltip.content.text] renders a plain string title', () => {
  const { overlay } = openClickTooltip('提示文本')
  expect(overlay).not.toBeNull()
  expect(overlay!.textContent).toBe('提示文本')
})

it('[tooltip.content.jsx] renders JSX title', () => {
  const { overlay } = openClickTooltip(<strong>加粗提示</strong>)
  expect(overlay!.querySelector('strong')?.textContent).toBe('加粗提示')
})

it('[tooltip.content.zero] treats numeric 0 as a valid, non-empty title', () => {
  const { overlay } = openClickTooltip(0)
  expect(overlay).not.toBeNull()
  expect(overlay!.textContent).toBe('0')
})

// undefined/null/'' 均视为空标题：disabled 级联生效，点击不产生任何浮层。
it.each([
  ['undefined', undefined],
  ['null', null],
  ['empty string', ''],
])('[tooltip.content.empty] never opens for %s title', (_label, title) => {
  const { overlay } = openClickTooltip(title)
  expect(overlay).toBeNull()
})

// 回归缺陷：title={false} 是 `condition && text` 写法在 condition 为假时的真实产物，
// 必须和 undefined/null/'' 一样视为空标题，否则会弹出一个只有 padding 的空气泡。
it('[tooltip.content.false] treats boolean false as an empty title, not a visible bubble', () => {
  const { overlay } = openClickTooltip(false)
  expect(overlay).toBeNull()
})

// 打开后浮层必须有 role=tooltip 供无障碍工具识别。
it('[tooltip.content.role] marks the overlay with role=tooltip', () => {
  const { overlay } = openClickTooltip('提示')
  expect(overlay!.getAttribute('role')).toBe('tooltip')
})

// 关闭后浮层仍可能挂载（懒销毁宽限期内），必须标 aria-hidden/inert，不留给无障碍树一个隐形但可达的节点。
it('[tooltip.content.closed-aria] marks the still-mounted closed layer aria-hidden and inert', () => {
  const { view, overlay } = openClickTooltip('提示')
  expect(overlay!.getAttribute('aria-hidden')).toBeNull()
  expect(overlay!.hasAttribute('inert')).toBe(false)

  view.host.querySelector('button')!.click(); flush()
  const closed = document.querySelector<HTMLElement>('[role="tooltip"]')!
  expect(closed.getAttribute('aria-hidden')).toBe('true')
  expect(closed.hasAttribute('inert')).toBe(true)
})

// 箭头元素必须渲染且携带指向样式；具体几何值由 headless/shared/Trigger 覆盖。
it('[tooltip.content.arrow] renders a pointing arrow element', () => {
  const { overlay } = openClickTooltip('提示')
  const arrow = overlay!.querySelector<HTMLElement>('span.rotate-45')
  expect(arrow).not.toBeNull()
  expect(arrow!.className).toContain('bg-inverse-surface')
  const hasSideClass = ['-top-[4px]', '-bottom-[4px]', '-left-[4px]', '-right-[4px]'].some(c => arrow!.className.includes(c))
  expect(hasSideClass).toBe(true)
})

// class/style 只作用于触发区域根容器，overlayClass/overlayStyle 分别合并进浮层且不破坏内置类。
it('[tooltip.content.style] separates root class/style from overlay overrides', () => {
  const view = mount(() => (
    <Tooltip
      title="样式"
      trigger="click"
      class="root-mark"
      style={{ 'font-weight': 'bold' }}
      overlayClass="overlay-mark"
      overlayStyle={{ 'letter-spacing': '2px' }}
    >
      <button type="button">触发器</button>
    </Tooltip>
  ))
  cleanup = view.dispose
  const root = view.host.querySelector('.root-mark') as HTMLElement
  expect(root).not.toBeNull()
  expect(root.style.fontWeight).toBe('bold')

  view.host.querySelector('button')!.click(); flush()
  const overlay = document.querySelector<HTMLElement>('[role="tooltip"]')!
  expect(overlay.className).toContain('overlay-mark')
  expect(overlay.className).toContain('bg-inverse-surface')
  expect(overlay.style.letterSpacing).toBe('2px')
})

// overlayStyle 在内部定位样式之后合并，可用于追加/覆盖字段而不丢失定位属性归属权。
it('[tooltip.content.overlay-style-priority] lets overlayStyle win on key collisions', () => {
  const view = mount(() => (
    <Tooltip title="样式覆盖" trigger="click" overlayStyle={{ 'z-index': '9999' }}>
      <button type="button">触发器</button>
    </Tooltip>
  ))
  cleanup = view.dispose
  view.host.querySelector('button')!.click(); flush()
  const overlay = document.querySelector<HTMLElement>('[role="tooltip"]')!
  expect(overlay.style.zIndex).toBe('9999')
  expect(overlay.style.position).toBe('absolute')
})
