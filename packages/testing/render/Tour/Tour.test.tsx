import { render } from '@solidjs/web'
import { flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Tour from '../../../components/lib/Tour/index'
let dispose: (() => void) | undefined
const mount = (view: Parameters<typeof render>[0]) => { const host = document.createElement('div'); document.body.append(host); dispose = render(view, host); flush() }
const button = (text: string) => [...document.querySelectorAll('button')].find(el => el.textContent === text)!
const settle = async () => { await Promise.resolve(); flush() }
afterEach(() => { dispose?.(); dispose = undefined; document.body.innerHTML = ''; vi.restoreAllMocks(); flush() })
describe('Tour material', () => {
  it('renders accessible step content, advances and finishes', async () => {
    const finish = vi.fn()
    mount(() => <Tour defaultOpen steps={[{ title: 'First', description: 'Details' }, { title: 'Second' }]} onFinish={finish} />)
    const dialog = document.querySelector('[role="dialog"]')!
    expect(dialog.getAttribute('aria-modal')).toBe('true'); expect(dialog.textContent).toContain('1 / 2')
    expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent).toBe('First')
    button('下一步').click(); await settle(); expect(dialog.textContent).toContain('Second')
    button('完成').click(); await settle(); expect(document.querySelector('[role="dialog"]')).toBeNull(); expect(finish).toHaveBeenCalledOnce()
  })
  it('restores focus to the launcher on Escape', () => {
    const launcher = document.createElement('button'); document.body.append(launcher); launcher.focus()
    const close = vi.fn()
    mount(() => <Tour defaultOpen steps={[{ title: 'Keyboard' }]} onClose={close} />)
    expect(document.activeElement).toBe(document.querySelector('[role="dialog"]'))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); flush()
    expect(close).toHaveBeenCalledWith(0, 'escape'); expect(document.activeElement).toBe(launcher)
  })
  it('respects disabled Escape and allows explicit skipping', () => {
    const close = vi.fn()
    mount(() => <Tour defaultOpen keyboard={false} closable={false} steps={[{}]} onClose={close} />)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); flush(); expect(close).not.toHaveBeenCalled()
    expect(document.querySelector('[aria-label="关闭引导"]')).toBeNull()
    button('跳过').click(); flush(); expect(close).toHaveBeenCalledWith(0, 'skip')
  })
  it('lets interactive tours retain focus outside the panel', () => {
    const target = document.createElement('button'); document.body.append(target)
    mount(() => <Tour defaultOpen mask={false} disabledInteraction={false} steps={[{ target }]} />)
    expect(document.querySelector('svg')).toBeNull(); expect(document.querySelector('[role="dialog"]')?.getAttribute('aria-modal')).toBe('false')
    target.focus(); expect(document.activeElement).toBe(target)
  })
  it('disables navigation while an async guard is running', async () => {
    let resolve!: (v: boolean) => void
    mount(() => <Tour defaultOpen steps={[{}, {}]} beforeChange={() => new Promise<boolean>(r => { resolve = r })} />)
    button('下一步').click(); flush(); expect(button('请稍候…').disabled).toBe(true)
    resolve(false); await settle(); expect(button('下一步').disabled).toBe(false); expect(document.querySelector('[role="dialog"]')?.textContent).toContain('1 / 2')
  })
  it('closes through the mask only when enabled', () => {
    const close = vi.fn()
    mount(() => <Tour defaultOpen maskClosable steps={[{}]} onClose={close} />)
    document.querySelector('path')!.dispatchEvent(new MouseEvent('click', { bubbles: true })); flush(); expect(close).toHaveBeenCalledWith(0, 'mask')
  })
})
