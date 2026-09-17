import { flush } from 'solid-js'
import { expect, it, vi } from 'vitest'
import Breadcrumb from '../../../components/lib/Breadcrumb'
import { mount } from '../../utils/mount'

// 面包屑沿用 hover Dropdown，菜单激活只分发一次字符串 key。
it('[dropdown.integration.breadcrumb] preserves hover menu selection', () => {
  const clicked = vi.fn()
  const view = mount(() => <Breadcrumb items={[{ title: '项目', menu: { items: [{ key: 'detail', label: '项目详情' }], onClick: clicked } }, { title: '当前页' }]} />)
  try {
    const trigger = view.host.querySelector('[aria-haspopup="menu"]')!
    trigger.dispatchEvent(new MouseEvent('mouseenter')); flush()
    const item = document.querySelector<HTMLElement>('[role="menuitem"]')!
    expect(item.textContent).toBe('项目详情')
    item.click(); flush()
    expect(clicked).toHaveBeenCalledExactlyOnceWith('detail')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  } finally { view.dispose() }
})
