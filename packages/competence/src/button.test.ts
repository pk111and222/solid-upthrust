import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createButton } from './button'

type ClickListener = (event: MouseEvent) => void

function createButtonElement() {
  let clickListener: ClickListener | undefined

  const element = {
    addEventListener: (type: string, listener: EventListener) => {
      if (type === 'click') clickListener = listener as ClickListener
    },
    removeEventListener: () => undefined,
  } as unknown as HTMLButtonElement

  return {
    element,
    click: () => clickListener?.({} as MouseEvent),
  }
}

describe('createButton', () => {
  it('reflects static loading state', () => {
    createRoot((dispose) => {
      expect(createButton({ loading: true }).loading()).toBe(true)
      expect(createButton({ loading: false }).loading()).toBe(false)
      dispose()
    })
  })

  it('delays loading and forwards click events', () => {
    vi.useFakeTimers()

    createRoot((dispose) => {
      const onClick = vi.fn()
      const button = createButton({ loading: { delay: 120 }, onClick })
      const buttonElement = createButtonElement()

      button.button(buttonElement.element)
      buttonElement.click()
      flush()

      expect(button.loading()).toBe(true)
      expect(onClick).toHaveBeenCalledOnce()

      vi.advanceTimersByTime(120)
      flush()
      expect(button.loading()).toBe(false)
      dispose()
    })

    vi.useRealTimers()
  })

  it('prevents callbacks when disabled', () => {
    createRoot((dispose) => {
      const onClick = vi.fn()
      const button = createButton({ disabled: true, onClick })
      const buttonElement = createButtonElement()

      button.button(buttonElement.element)
      buttonElement.click()

      expect(onClick).not.toHaveBeenCalled()
      dispose()
    })
  })
})
