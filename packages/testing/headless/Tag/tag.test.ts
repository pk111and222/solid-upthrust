import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createTag, createCheckableTag } from '../../../competence/src/tag'

describe('Tag interactions', () => {
  it('allows a consumer to cancel close and closes once otherwise', () => createRoot(() => {
    const onClose = vi.fn((event: MouseEvent) => event.preventDefault())
    const tag = createTag({ onClose })
    tag.close(new MouseEvent('click', { cancelable: true })); flush()
    expect(tag.visible()).toBe(true)
    onClose.mockImplementation(() => {})
    tag.close(new MouseEvent('click')); flush()
    expect(tag.visible()).toBe(false)
    tag.close(new MouseEvent('click')); flush()
    expect(onClose).toHaveBeenCalledTimes(2)
  }))
  it('ignores close and toggle on disabled tags', () => createRoot(() => {
    const onClose = vi.fn(), onChange = vi.fn()
    const tag = createTag({ disabled: true, onClose })
    const checkable = createCheckableTag({ disabled: true, onChange })
    tag.close(new MouseEvent('click')); checkable.toggle(); flush()
    expect(tag.visible()).toBe(true)
    expect(checkable.checked()).toBe(false)
    expect(onClose).not.toHaveBeenCalled(); expect(onChange).not.toHaveBeenCalled()
  }))
  it('toggles an uncontrolled tag and preserves a rejected controlled change', () => createRoot(() => {
    const tag = createCheckableTag({ defaultChecked: true })
    tag.toggle(); flush(); expect(tag.checked()).toBe(false)
    const onChange = vi.fn()
    const controlled = createCheckableTag({ checked: false, onChange })
    controlled.toggle(); flush()
    expect(controlled.checked()).toBe(false); expect(onChange).toHaveBeenCalledWith(true)
  }))
  it('tracks accepted and external controlled updates', () => createRoot(() => {
    const [checked, setChecked] = createSignal(false, { ownedWrite: true })
    const tag = createCheckableTag({ get checked() { return checked() }, onChange: setChecked })
    tag.toggle(); flush(); expect(tag.checked()).toBe(true)
    setChecked(false); flush(); expect(tag.checked()).toBe(false)
  }))
})
