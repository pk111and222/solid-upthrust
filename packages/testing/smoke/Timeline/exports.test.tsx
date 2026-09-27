import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import Timeline, { type TimelineProps } from '../../../components/lib/Timeline'
import { mount } from '../../utils/mount'

const props: Public.TimelineProps = {
  mode: 'alternate' satisfies Public.TimelineMode,
  orientation: 'vertical' satisfies Public.TimelineOrientation,
  variant: 'filled' satisfies Public.TimelineVariant,
  items: [{ title: 'T', content: 'A', color: 'green' satisfies Public.TimelineColor, placement: 'end' satisfies Public.TimelinePlacement }] satisfies Public.TimelineItemProps[],
  classNames: { root: 'r' } satisfies Public.TimelineSemanticClassNames,
  styles: (info: Public.TimelineSemanticInfo): Public.TimelineSemanticStyles => ({ root: { 'max-width': `${info.props.items.length * 100}px` } }),
} satisfies TimelineProps
const PublicTimeline: typeof Public.Timeline = Timeline
// 公开入口：Timeline 与 Timeline.Item 可用，类型齐全；最小挂载后可清理。
it('[timeline.exports] mounts Timeline from the public entry', () => {
  expect(typeof PublicTimeline.Item).toBe('function')
  const view = mount(() => <PublicTimeline {...props} />)
  try {
    expect(view.host.textContent).toBe('TA')
    expect((view.host.firstElementChild as HTMLElement).style.maxWidth).toBe('100px')
  } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
