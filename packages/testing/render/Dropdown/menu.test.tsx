import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { mount } from '../../utils/mount'
import Button from '../../../components/lib/Button'
import Dropdown from '../../../components/lib/Dropdown'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {}; vi.useRealTimers() })

function openClickDropdown(menu: Parameters<typeof Dropdown>[0]['menu']) {
  const view = mount(() => <Dropdown trigger="click" menu={menu}><Button>触发菜单</Button></Dropdown>)
  cleanup = view.dispose
  view.host.querySelector('button')!.click(); flush()
  const overlay = document.querySelector<HTMLElement>('[role="menu"]')!
  return { view, overlay }
}

// 菜单内容、图标、分隔线和菜单项角色必须以可观察 DOM 呈现。
it('[dropdown.menu.items] renders labels, icons and menu roles', () => {
  const { overlay } = openClickDropdown({
    items: [
      { key: 'edit', label: '编辑', icon: 'i-mdi-pencil' },
      { key: 'split', label: '', type: 'divider' },
      { key: 'copy', label: '复制' },
    ],
  })

  expect(overlay.getAttribute('role')).toBe('menu')
  expect(overlay.querySelectorAll('[role="menuitem"]')).toHaveLength(2)
  expect(overlay.textContent).toContain('编辑')
  expect(overlay.textContent).toContain('复制')
  expect(overlay.querySelector('.i-mdi-pencil')).not.toBeNull()
  expect(overlay.querySelectorAll('[role="separator"]')).toHaveLength(1)
  expect(overlay.querySelector('.i-mdi-pencil')?.getAttribute('aria-hidden')).toBe('true')
})

// disabled 项只能展示状态，danger 项保留危险样式且两者都不改变键盘候选项。
it('[dropdown.menu.disabled-danger] marks disabled and danger branches', () => {
  const { overlay } = openClickDropdown({
    items: [
      { key: 'disabled', label: '禁用', disabled: true },
      { key: 'danger', label: '删除', danger: true },
    ],
  })
  const disabled = [...overlay.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(item => item.textContent === '禁用')!
  const danger = [...overlay.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(item => item.textContent === '删除')!
  expect(disabled.getAttribute('aria-disabled')).toBe('true')
  expect(disabled.className).toContain('cursor-not-allowed')
  expect(danger.className).toContain('text-error')
})

// 单项回调先于菜单级回调执行，选中后关闭；disabled 项不触发任何回调。
it('[dropdown.menu.callbacks] calls item then menu callbacks once', () => {
  const order: string[] = []
  const itemClick = vi.fn(() => order.push('item'))
  const menuClick = vi.fn((key: string) => order.push(`menu:${key}`))
  const { overlay } = openClickDropdown({
    items: [
      { key: 'disabled', label: '禁用', disabled: true, onClick: itemClick },
      { key: 'save', label: '保存', onClick: itemClick },
    ],
    onClick: menuClick,
  })
  const items = overlay.querySelectorAll<HTMLElement>('[role="menuitem"]')
  items[0].click(); flush()
  expect(itemClick).not.toHaveBeenCalled()
  expect(menuClick).not.toHaveBeenCalled()
  items[1].click(); flush()
  expect(itemClick).toHaveBeenCalledOnce()
  expect(menuClick).toHaveBeenCalledOnce()
  expect(menuClick).toHaveBeenCalledWith('save')
  expect(order).toEqual(['item', 'menu:save'])
})

// 根节点和浮层都保留用户提供的 class/style，同时不丢失定位所需内联样式。
it('[dropdown.style.overrides] forwards root and overlay style overrides', () => {
  const view = mount(() => (
    <Dropdown
      trigger="click"
      class="dropdown-root-test"
      style={{ color: 'red' }}
      overlayClass="dropdown-overlay-test"
      overlayStyle={{ background: 'rgb(1, 2, 3)' }}
      menu={{ items: [{ key: 'one', label: '一项' }] }}
    >
      <Button>样式菜单</Button>
    </Dropdown>
  ))
  cleanup = view.dispose
  expect(view.host.querySelector('.dropdown-root-test')).not.toBeNull()
  expect((view.host.firstElementChild as HTMLElement).style.color).toBe('red')
  view.host.querySelector('button')!.click(); flush()
  const overlay = document.querySelector<HTMLElement>('[role="menu"]')!
  expect(overlay.className).toContain('dropdown-overlay-test')
  expect(overlay.style.background).toBe('rgb(1, 2, 3)')
  expect(overlay.style.position).toBe('absolute')
})

// label 支持 JSX、数值零、空字符串与空内容；children 原样保留，不复制触发节点。
it('[dropdown.menu.content] renders JSX and zero values without extra trigger controls', () => {
  const view = mount(() => <Dropdown defaultOpen menu={{ items: [
    { key: 'jsx', label: <strong>富文本</strong> },
    { key: 'zero', label: 0 },
    { key: 'empty', label: '' },
    { key: 'null', label: null },
  ] }}><span>自定义触发内容</span></Dropdown>)
  cleanup = view.dispose
  const items = document.querySelectorAll('[role="menuitem"]')
  expect(items).toHaveLength(4)
  expect(items[0].querySelector('strong')?.textContent).toBe('富文本')
  expect(items[1].textContent).toBe('0')
  expect(items[2].textContent).toBe('')
  expect(items[3].textContent).toBe('')
  expect(view.host.querySelector('span')?.textContent).toBe('自定义触发内容')
  expect(view.host.querySelector('button')).toBeNull()
})

// 空 children 不伪造交互控件，数字零仍作为可见文本保留。
it.each([{ children: 0, text: '0' }, { children: '', text: '' }, { children: null, text: '' }])('[dropdown.menu.children] preserves child $children', ({ children, text }) => {
  const view = mount(() => <Dropdown menu={{ items: [] }}>{children}</Dropdown>)
  cleanup = view.dispose
  expect(view.host.textContent).toBe(text)
  expect(document.querySelector('[role="menu"]')).toBeNull()
})

// 两个 Dropdown 的菜单关联 ID 相互独立，在懒挂载与动态更新中保持稳定。
it('[dropdown.menu.aria] associates each trigger with its own stable menu', () => {
  const view = mount(() => <>
    <Dropdown trigger="click" menu={{ items: [] }}><button type="button">甲</button></Dropdown>
    <Dropdown trigger="click" menu={{ items: [] }}><button type="button">乙</button></Dropdown>
  </>)
  cleanup = view.dispose
  const wrappers = view.host.querySelectorAll('[aria-haspopup="menu"]')
  const buttons = view.host.querySelectorAll('button')
  expect(wrappers[0].getAttribute('aria-expanded')).toBe('false')
  buttons[0].click(); flush(); buttons[1].click(); flush()
  const ids = [...wrappers].map(wrapper => wrapper.getAttribute('aria-controls'))
  expect(ids[0]).toBeTruthy(); expect(ids[1]).toBeTruthy(); expect(ids[0]).not.toBe(ids[1])
  for (const id of ids) expect(document.getElementById(id!)?.getAttribute('role')).toBe('menu')
  buttons[0].click(); flush(); buttons[0].click(); flush()
  expect(wrappers[0].getAttribute('aria-controls')).toBe(ids[0])
  expect(view.host.querySelector('[role="button"]')).toBeNull()
})

// danger 和 disabled 的四种组合各自保留语义，只有非禁用项能激活。
it.each([false, true].flatMap(disabled => [false, true].map(danger => ({ disabled, danger }))))('[dropdown.menu.state-matrix] disabled=$disabled danger=$danger', ({ disabled, danger }) => {
  const clicked = vi.fn()
  const { overlay } = openClickDropdown({ items: [{ key: 'x', label: '操作', disabled, danger }], onClick: clicked })
  const item = overlay.querySelector<HTMLElement>('[role="menuitem"]')!
  expect(item.getAttribute('aria-disabled')).toBe(disabled ? 'true' : null)
  expect(item.classList.contains('text-error')).toBe(danger)
  item.click(); flush()
  expect(clicked).toHaveBeenCalledTimes(disabled ? 0 : 1)
})

// 样式对象与类名动态更新后，只改变对应容器；overlayStyle 保留既有最终覆盖优先级。
it('[dropdown.style.dynamic] updates root and layer overrides reactively', () => {
  const [custom, setCustom] = createSignal(false, { ownedWrite: true })
  const view = mount(() => <Dropdown defaultOpen class={custom() ? 'w-full' : 'w-20'} style={{ color: custom() ? 'blue' : 'red' }}
    overlayClass={custom() ? 'min-w-[200px]' : 'min-w-[180px]'} overlayStyle={{ width: custom() ? '240px' : '180px', 'z-index': '1200' }} menu={{ items: [] }}>
    <button type="button">覆盖</button>
  </Dropdown>)
  cleanup = view.dispose
  const root = view.host.firstElementChild as HTMLElement
  const overlay = document.querySelector<HTMLElement>('[role="menu"]')!
  expect(root.style.color).toBe('red'); expect(overlay.style.width).toBe('180px')
  setCustom(true); flush()
  expect(root.classList.contains('w-full')).toBe(true); expect(root.style.color).toBe('blue')
  expect(overlay.style.width).toBe('240px'); expect(overlay.style.zIndex).toBe('1200')
  expect(overlay.classList.contains('min-w-[200px]')).toBe(true)
  expect(overlay.classList.contains('min-w-[120px]')).toBe(false)
})

// click/contextMenu/disabled 触发方式均由用户可观察的开关和回调驱动。
it('[dropdown.trigger.modes] supports click, contextMenu and disabled trigger', () => {
  const changes: boolean[] = []
  const clickView = mount(() => <Dropdown trigger="click" onOpenChange={value => changes.push(value)} menu={{ items: [{ key: 'x', label: 'x' }] }}><Button>点击</Button></Dropdown>)
  cleanup = clickView.dispose
  const clickButton = clickView.host.querySelector('button')!
  clickButton.click(); flush(); expect(document.querySelector('[role="menu"]')).not.toBeNull()
  expect(changes).toEqual([true])
  clickButton.click(); flush(); expect(changes).toEqual([true, false])
  clickView.dispose(); cleanup = () => {}

  const contextView = mount(() => <Dropdown trigger="contextMenu" menu={{ items: [{ key: 'x', label: '右键项' }] }}><span>右键目标</span></Dropdown>)
  cleanup = contextView.dispose
  const target = contextView.host.querySelector('[aria-haspopup="menu"]')!
  const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
  target.dispatchEvent(event)
  flush()
  expect(event.defaultPrevented).toBe(true)
  expect(document.querySelector('[role="menu"]')).not.toBeNull()
  contextView.dispose(); cleanup = () => {}

  const disabledView = mount(() => <Dropdown disabled trigger="click" menu={{ items: [{ key: 'x', label: '不应打开' }] }}><Button>禁用</Button></Dropdown>)
  cleanup = disabledView.dispose
  disabledView.host.querySelector('button')!.click(); flush()
  expect(document.querySelector('[role="menu"]')).toBeNull()
})
