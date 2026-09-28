import { expect, it } from 'vitest'
import Affix, { type AffixProps } from '../../../components/lib/Affix'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'

const exported: typeof Public.Affix = Affix

// 公开出口：Affix 从包入口导出，ref 取得 headless 实例，卸载后宿主移除。
it('[affix.exports] public types mount and clean up', () => {
  let instance: Public.AffixIns | undefined
  const props: Omit<AffixProps, 'children'> = { offsetTop: 10, ref: value => { instance = value } }
  const view = mount(() => <Affix {...props}><span>固钉</span></Affix>)
  try {
    expect(exported).toBe(Affix)
    expect(view.host.textContent).toBe('固钉')
    expect(instance?.affixed()).toBe(false)
  } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
