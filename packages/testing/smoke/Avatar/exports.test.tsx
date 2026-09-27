import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'
import Avatar, { AvatarGroup, type AvatarProps, type AvatarGroupProps, type AvatarSize } from '../../../components/lib/Avatar'
const size: Public.AvatarSize = 48 satisfies AvatarSize
const props: Public.AvatarProps = { size, alt: '用户' } satisfies AvatarProps
const group: Public.AvatarGroupProps = { size: 'small' } satisfies AvatarGroupProps
const PublicAvatar: typeof Public.Avatar = Avatar
const PublicGroup: typeof Public.AvatarGroup = AvatarGroup
// 公开头像与头像组类型可用，组上下文下真实挂载并清理。
it('[avatar.exports] mounts both public components', () => {
  const view = mount(() => <PublicGroup {...group}><PublicAvatar {...props}>U</PublicAvatar></PublicGroup>)
  try { expect(view.host.querySelector('[title="用户"]')?.textContent).toBe('U') } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
