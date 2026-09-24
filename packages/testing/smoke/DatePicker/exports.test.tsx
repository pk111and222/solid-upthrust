import { render } from '@solidjs/web'
import { flush } from 'solid-js'
import { expect, it } from 'vitest'
import DatePicker, { RangePicker } from '../../../components/lib/DatePicker'

it('exports the named range picker and mounts both public controls', () => {
  expect(DatePicker.RangePicker).toBe(RangePicker)
  const host = document.createElement('div')
  document.body.append(host)
  const dispose = render(() => <><DatePicker defaultValue="2026-09-15" /><RangePicker defaultValue={['2026-09-10', '2026-09-20']} /></>, host)
  try {
    flush()
    expect([...host.querySelectorAll('input')].map(input => input.value)).toEqual(['2026-09-15', '2026-09-10', '2026-09-20'])
  } finally {
    dispose()
    host.remove()
    flush()
  }
})
