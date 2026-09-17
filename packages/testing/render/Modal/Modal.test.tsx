import { flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Modal from '../../../components/lib/Modal/index'
const tick = async () => { await Promise.resolve(); await Promise.resolve(); flush() }
afterEach(async () => { Modal.destroyAll(); flush(); await new Promise(resolve => setTimeout(resolve, 330)); flush(); await tick(); document.body.innerHTML = '' })
describe('Modal static methods', () => {
  it('renders confirm, updates and destroys after leaving', async () => {
    const closed = vi.fn()
    const instance = Modal.confirm({ title: 'confirm', content: 'before', afterClose: closed }); flush()
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('before')
    instance.update(previous => ({ content: `${previous.content} after` })); flush()
    expect(document.body.textContent).toContain('before after')
    instance.destroy(); flush(); await new Promise(resolve => setTimeout(resolve, 330)); flush(); await tick()
    expect(document.querySelector('[role="dialog"]')).toBeNull(); expect(closed).toHaveBeenCalledOnce()
  })
  it('keeps rejection open and prevents duplicate submission', async () => {
    let reject!: (reason?: unknown) => void
    const onOk = vi.fn(() => new Promise((_, no) => { reject = no }))
    Modal.confirm({ content: 'retry', onOk }); flush()
    const button = [...document.querySelectorAll('button')].find(el => el.textContent === '确定')!
    button.click(); flush(); button.click(); flush()
    expect(onOk).toHaveBeenCalledOnce()
    reject(new Error('failed')); await tick()
    expect(document.body.textContent).toContain('retry'); expect(button.disabled).toBe(false)
  })
  it('shows a single action for information methods', () => {
    for (const method of [Modal.info, Modal.success, Modal.warning, Modal.error]) method({ content: 'notice' })
    flush(); expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(4)
    expect([...document.querySelectorAll('button')].filter(el => el.textContent === '取消')).toHaveLength(0)
  })
})
