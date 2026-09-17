import { render } from '@solidjs/web'
import { flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { Paragraph, Text } from '../../../components/lib/Typography/index'
let dispose: (() => void) | undefined
const mount = (view: Parameters<typeof render>[0]) => { const host = document.createElement('div'); document.body.append(host); dispose = render(view, host); flush(); return host }
afterEach(() => { dispose?.(); document.body.innerHTML = ''; vi.restoreAllMocks() })
it('copies plain nested text and reports success', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(writeText)
  const host = mount(() => <Text copyable><strong>Hello</strong> world</Text>)
  host.querySelector('button')!.click(); await Promise.resolve(); await Promise.resolve(); flush()
  expect(writeText).toHaveBeenCalledWith('Hello world'); expect(host.querySelector('[aria-label="已复制"]')).not.toBeNull()
})
it('edits, saves and cancels without committing cancellation', () => {
  const host = mount(() => <Paragraph editable>before</Paragraph>)
  host.querySelector('button')!.click(); flush()
  const field = host.querySelector('textarea')!; field.value = 'after'; field.dispatchEvent(new Event('input', { bubbles: true }))
  field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); flush()
  expect(host.textContent).toContain('after'); expect(host.querySelector('textarea')).toBeNull()
  host.querySelector('button')!.click(); flush()
  const next = host.querySelector('textarea')!; next.value = 'cancelled'; next.dispatchEvent(new Event('input', { bubbles: true }))
  next.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); flush()
  expect(host.textContent).toContain('after'); expect(host.textContent).not.toContain('cancelled')
})
