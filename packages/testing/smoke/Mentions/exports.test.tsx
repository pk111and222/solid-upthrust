import { expect, expectTypeOf, it } from 'vitest'
import Mentions, { type MentionOption, type MentionsProps } from '../../../components/lib/Mentions'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'

// 公开入口暴露组件和类型；ref 指向可卸载的原生 textarea。
it('[mentions.exports.mount] exports props and mounts a textarea', () => {
  const option: MentionOption = { value: 'alice' }
  let ref: HTMLTextAreaElement | undefined
  const view = mount(() => <Mentions options={[option]} ref={el => { ref = el }} />)
  try {
    expectTypeOf<typeof Public.Mentions>().toEqualTypeOf<typeof Mentions>()
    expectTypeOf<Public.MentionsProps>().toEqualTypeOf<MentionsProps>()
    expectTypeOf<Public.MentionOption>().toEqualTypeOf<MentionOption>()
    expect(ref).toBe(view.host.querySelector('textarea'))
  } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
