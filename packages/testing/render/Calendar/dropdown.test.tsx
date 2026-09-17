import { flush } from 'solid-js'
import dayjs from 'dayjs'
import { expect, it, vi } from 'vitest'
import Calendar from '../../../components/lib/Calendar'
import { mount } from '../../utils/mount'

// Calendar 的受控月份 Dropdown 接受关闭请求，同时保留选月与面板回调。
it('[dropdown.integration.calendar] changes month through its controlled menu', () => {
  const changed = vi.fn()
  const view = mount(() => <Calendar defaultValue={dayjs('2026-09-16')} onPanelChange={changed} />)
  try {
    const triggers = view.host.querySelectorAll<HTMLElement>('[aria-haspopup="menu"]')
    const button = triggers[1].querySelector('button')!
    expect(button.textContent).toContain('9月')
    button.click(); flush()
    const item = [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(node => node.textContent === '10月')!
    item.click(); flush()
    expect(button.textContent).toContain('10月')
    expect(changed).toHaveBeenCalledOnce()
    expect(changed.mock.calls[0][0].month()).toBe(9)
    expect(triggers[1].getAttribute('aria-expanded')).toBe('false')
  } finally { view.dispose() }
})
