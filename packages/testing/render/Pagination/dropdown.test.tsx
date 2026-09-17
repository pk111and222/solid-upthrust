import { flush } from 'solid-js'
import { expect, it, vi } from 'vitest'
import Pagination from '../../../components/lib/Pagination'
import { mount } from '../../utils/mount'

// Dropdown 变更不能让 Pagination 每页条数菜单重复回调或无法关闭。
it('[dropdown.integration.pagination] selects one page size and closes the menu', () => {
  const changed = vi.fn()
  const view = mount(() => <Pagination total={100} pageSizeOptions={[10, 20]} onShowSizeChange={changed} />)
  try {
    const button = [...view.host.querySelectorAll('button')].find(node => node.textContent?.includes('条/页'))!
    button.click(); flush()
    const item = [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(node => node.textContent === '20 条/页')!
    expect(item).toBeDefined()
    item.click(); flush()
    expect(changed).toHaveBeenCalledExactlyOnceWith(1, 20)
    expect(button.textContent).toContain('20 条/页')
    expect(document.querySelector('[role="menu"]')?.getAttribute('aria-hidden')).toBe('true')
  } finally { view.dispose() }
})
