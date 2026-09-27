import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'
import Tag, { CheckableTag, CheckableTagGroup, type TagProps, type CheckableTagGroupProps } from '../../../components/lib/Tag'
const props: Public.TagProps = { color: 'geekblue', variant: 'outlined' satisfies Public.TagVariant } satisfies TagProps
const group: Public.CheckableTagGroupProps<string> = { options: ['A'], multiple: true, value: ['A'] } satisfies CheckableTagGroupProps<string>
const PublicTag: typeof Public.Tag = Tag
const PublicCheckable: typeof Public.CheckableTag = CheckableTag
const PublicGroup: typeof Public.CheckableTagGroup = CheckableTagGroup
// 公开入口的 Tag、静态子组件与具名导出一致，最小挂载后可清理。
it('[tag.exports] mounts Tag, CheckableTag and CheckableTagGroup from the public entry', () => {
  expect(PublicTag.CheckableTag).toBe(PublicCheckable)
  expect(PublicTag.CheckableTagGroup).toBe(PublicGroup)
  const view = mount(() => <><PublicTag {...props}>标签</PublicTag><PublicCheckable>可选</PublicCheckable><PublicGroup {...group} /></>)
  try {
    expect(view.host.textContent).toBe('标签可选A')
    expect(view.host.querySelectorAll('[role="checkbox"]')).toHaveLength(2)
  } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
