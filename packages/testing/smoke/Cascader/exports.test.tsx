import { expect, expectTypeOf, it } from 'vitest'
import Cascader, { type CascaderOption, type CascaderProps } from '../../../components/lib/Cascader'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'

// 公开组件和选项类型可从 barrel 使用，ref 返回选择框原生容器并可卸载。
it('[cascader.exports.mount] exposes public types and ref cleanup', () => {
  const option: CascaderOption = { value: 'a', label: 'A' }
  let ref: HTMLDivElement | undefined
  const view = mount(() => <Cascader options={[option]} ref={el => { ref = el }} />)
  try {
    expectTypeOf<typeof Public.Cascader>().toEqualTypeOf<typeof Cascader>()
    expectTypeOf<Public.CascaderProps>().toEqualTypeOf<CascaderProps>()
    expect(ref).toBe(view.host.querySelector('[role="combobox"]'))
    expect(view.host.querySelector('[role="combobox"]')?.getAttribute('aria-expanded')).toBe('false')
  } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
