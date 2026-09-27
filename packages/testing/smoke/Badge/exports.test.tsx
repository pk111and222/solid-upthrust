import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'
import Badge, { BadgeRibbon, type BadgeProps, type BadgeRibbonProps } from '../../../components/lib/Badge'
const props: Public.BadgeProps = { count: 5, size: 'medium', status: 'success' satisfies Public.BadgeStatus } satisfies BadgeProps
const ribbon: Public.BadgeRibbonProps = { text: '推荐', color: 'volcano' satisfies Public.BadgeColor, placement: 'start' } satisfies BadgeRibbonProps
const PublicBadge: typeof Public.Badge = Badge
const PublicRibbon: typeof Public.BadgeRibbon = BadgeRibbon
// 公开入口的 Badge 与 BadgeRibbon 类型可用，最小挂载后可清理。
it('[badge.exports] mounts Badge and BadgeRibbon from the public entry', () => {
  const view = mount(() => <><PublicBadge {...props}><span>消息</span></PublicBadge><PublicRibbon {...ribbon}><div>卡片</div></PublicRibbon></>)
  try { expect(view.host.textContent).toBe('消息5卡片推荐') } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
