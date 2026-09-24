import { render } from '@solidjs/web'
import { flush } from 'solid-js'
import { expect, it } from 'vitest'
import ColorPicker, { Color, parseColor } from '../../../components/lib/ColorPicker'

it('mounts the public picker and exposes immutable color helpers', () => {
  expect(parseColor('#f00')?.toHexString()).toBe('#ff0000')
  expect(new Color('rgba(0, 128, 255, 0.5)').toHexString()).toBe('#0080ff80')
  const host = document.createElement('div')
  document.body.append(host)
  const dispose = render(() => <ColorPicker inline defaultValue="#f00" showText />, host)
  try {
    flush()
    expect(host.querySelector<HTMLInputElement>('[aria-label="颜色值"]')?.value).toBe('#ff0000')
    expect(host.querySelector('[aria-label="颜色面板"]')).not.toBeNull()
  } finally {
    dispose()
    host.remove()
    flush()
  }
})
