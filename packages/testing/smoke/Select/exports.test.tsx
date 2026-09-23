import { flush } from 'solid-js'
import { expect, expectTypeOf, it } from 'vitest'
import Select, { type SelectProps, type SelectOptionEntry, type SelectChangeValue } from '../../../components/lib/Select'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'

// 公开根入口应提供同一个 Select，挂载后 ref 指向 combobox 并可卸载。
it('[select.smoke.exports] public export, ref and mount', () => {
  let ref: HTMLDivElement | undefined
  const view = mount(() => <Select aria-label="演示" options={[{ label: '甲', value: 'a' }]} ref={element => { ref = element }} />)
  try {
    expectTypeOf<typeof Public.Select>().toEqualTypeOf<typeof Select>()
    expectTypeOf<SelectProps['options']>().toEqualTypeOf<SelectOptionEntry[] | undefined>()
    expectTypeOf<Public.SelectChangeValue>().toEqualTypeOf<SelectChangeValue>()
    expect(ref).toBe(view.host.querySelector('[role="combobox"]'))
    expect(ref?.getAttribute('aria-label')).toBe('演示')
  } finally { view.dispose(); flush() }
})
