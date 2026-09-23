import { expect, expectTypeOf, it } from 'vitest'
import AutoComplete, { type AutoCompleteOption, type AutoCompleteProps } from '../../../components/lib/AutoComplete'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'

// 公开类型与导出一致，ref 返回真实输入节点且可以命令式聚焦。
it('[autocomplete.smoke.exports] exports and native ref mount', () => {
  let ref: HTMLInputElement | undefined
  const v = mount(() => <AutoComplete ref={el => { ref = el }} />)
  try {
    expectTypeOf<typeof Public.AutoComplete>().toEqualTypeOf<typeof AutoComplete>()
    expectTypeOf<Public.AutoCompleteProps>().toEqualTypeOf<AutoCompleteProps>()
    expectTypeOf<Public.AutoCompleteOption>().toEqualTypeOf<AutoCompleteOption>()
    expect(ref).toBe(v.host.querySelector('input'))
    ref?.focus(); expect(document.activeElement).toBe(ref)
  } finally { v.dispose() }
})
