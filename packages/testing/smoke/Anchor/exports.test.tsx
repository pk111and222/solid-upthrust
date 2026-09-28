import { expect, it } from 'vitest'
import Anchor, { type AnchorLinkItemProps, type AnchorProps } from '../../../components/lib/Anchor'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'

const exported: typeof Public.Anchor = Anchor

// 公开出口：Anchor 从包入口导出，公开类型可用于挂载，卸载后宿主移除。
it('[anchor.exports] public types mount and clean up', () => {
  const items: AnchorLinkItemProps[] = [{ key: 'a', href: '#a', title: 'A' }]
  const props: AnchorProps = { items, affix: false, direction: 'horizontal' }
  const view = mount(() => <Anchor {...props} />)
  try {
    expect(exported).toBe(Anchor)
    expect(view.host.querySelector('a[href="#a"]')?.textContent).toBe('A')
  } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
