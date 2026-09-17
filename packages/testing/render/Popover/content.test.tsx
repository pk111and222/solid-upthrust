import { flush } from 'solid-js'
import { afterEach, expect, it } from 'vitest'
import { mount } from '../../utils/mount'
import Popover from '../../../components/lib/Popover'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {} })

function openClickPopover(props: { title?: unknown; content?: unknown }) {
  const view = mount(() => (
    <Popover title={props.title as never} content={props.content as never} trigger="click">
      <button type="button">触发器</button>
    </Popover>
  ))
  cleanup = view.dispose
  view.host.querySelector('button')!.click(); flush()
  return { view, overlay: document.querySelector<HTMLElement>('[role="dialog"]') }
}

// 有标题或内容之一即可打开；两者都渲染时标题在上、内容在下且不重复顶部留白。
it('[popover.content.title-and-content] renders both title and content blocks', () => {
  const { overlay } = openClickPopover({ title: '标题', content: '内容' })
  expect(overlay).not.toBeNull()
  expect(overlay!.textContent).toContain('标题')
  expect(overlay!.textContent).toContain('内容')
})

it('[popover.content.content-only] renders content without a title block', () => {
  const { overlay } = openClickPopover({ content: '只有内容' })
  expect(overlay!.textContent).toBe('只有内容')
})

it('[popover.content.jsx-content] renders JSX content, e.g. an interactive button', () => {
  const view = mount(() => (
    <Popover content={<button type="button">内部按钮</button>} trigger="click">
      <button type="button">触发器</button>
    </Popover>
  ))
  cleanup = view.dispose
  view.host.querySelector('button')!.click(); flush()
  const overlay = document.querySelector<HTMLElement>('[role="dialog"]')!
  expect(overlay.querySelector('button')?.textContent).toBe('内部按钮')
})

// 回归缺陷：title 和 content 都为空时，不应该打开一个完全空白的卡片——与 Tooltip 的
// 空标题语义保持一致（视为没有可展示内容，等效禁用）。
it('[popover.content.empty] never opens when both title and content are empty', () => {
  const { overlay } = openClickPopover({})
  expect(overlay).toBeNull()
})

it.each([
  ['undefined content, empty-string title', { title: '', content: undefined }],
  ['null content, null title', { title: null, content: null }],
  ['empty-string content, undefined title', { title: undefined, content: '' }],
])('[popover.content.empty] treats %s as empty too', (_label, props) => {
  const { overlay } = openClickPopover(props)
  expect(overlay).toBeNull()
})

// 打开后浮层必须有 role=dialog：Popover 允许承载任意交互元素，role=tooltip 不允许。
it('[popover.content.role] marks the overlay with role=dialog', () => {
  const { overlay } = openClickPopover({ content: '提示' })
  expect(overlay!.getAttribute('role')).toBe('dialog')
})

// 箭头元素必须渲染且携带指向样式；具体几何值由 headless/shared/Trigger 覆盖。
it('[popover.content.arrow] renders a pointing arrow element', () => {
  const { overlay } = openClickPopover({ content: '提示' })
  const arrow = overlay!.querySelector<HTMLElement>('span.rotate-45')
  expect(arrow).not.toBeNull()
  expect(arrow!.className).toContain('bg-surface')
  const hasSideClass = ['-top-[4px]', '-bottom-[4px]', '-left-[4px]', '-right-[4px]'].some(c => arrow!.className.includes(c))
  expect(hasSideClass).toBe(true)
})

// class/style 只作用于触发区域根容器，overlayClass/overlayStyle 分别合并进浮层且不破坏内置类。
it('[popover.content.style] separates root class/style from overlay overrides', () => {
  const view = mount(() => (
    <Popover
      content="样式"
      trigger="click"
      class="root-mark"
      style={{ 'font-weight': 'bold' }}
      overlayClass="overlay-mark"
      overlayStyle={{ 'letter-spacing': '2px' }}
    >
      <button type="button">触发器</button>
    </Popover>
  ))
  cleanup = view.dispose
  const root = view.host.querySelector('.root-mark') as HTMLElement
  expect(root).not.toBeNull()
  expect(root.style.fontWeight).toBe('bold')

  view.host.querySelector('button')!.click(); flush()
  const overlay = document.querySelector<HTMLElement>('[role="dialog"]')!
  expect(overlay.className).toContain('overlay-mark')
  expect(overlay.className).toContain('bg-surface')
  expect(overlay.style.letterSpacing).toBe('2px')
})

// 关闭后浮层仍可能挂载（懒销毁宽限期内），必须标 aria-hidden/inert，不留给无障碍树一个隐形但可达的节点。
it('[popover.content.closed-aria] marks the still-mounted closed layer aria-hidden and inert', () => {
  const { view, overlay } = openClickPopover({ content: '提示' })
  expect(overlay!.getAttribute('aria-hidden')).toBeNull()
  expect(overlay!.hasAttribute('inert')).toBe(false)

  view.host.querySelector('button')!.click(); flush()
  const closed = document.querySelector<HTMLElement>('[role="dialog"]')!
  expect(closed.getAttribute('aria-hidden')).toBe('true')
  expect(closed.hasAttribute('inert')).toBe(true)
})
