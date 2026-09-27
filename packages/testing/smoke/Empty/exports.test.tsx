import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import Empty, { PRESENTED_IMAGE_DEFAULT, PRESENTED_IMAGE_SIMPLE, type EmptyProps } from '../../../components/lib/Empty'
import { mount } from '../../utils/mount'

const props: Public.EmptyProps = {
  description: '暂无',
  classNames: { root: 'r' } satisfies Public.EmptySemanticClassNames,
  styles: { image: { height: '40px' } } satisfies Public.EmptySemanticStyles,
  image: PRESENTED_IMAGE_SIMPLE satisfies Public.EmptyPresentedImage,
} satisfies EmptyProps
const PublicEmpty: typeof Public.Empty = Empty
const PublicSimple: typeof Public.PRESENTED_IMAGE_SIMPLE = PRESENTED_IMAGE_SIMPLE
// 公开入口：Empty、静态插画属性与具名插画导出一致，类型可用；最小挂载后可清理。
it('[empty.exports] mounts Empty from the public entry', () => {
  expect(PublicEmpty.PRESENTED_IMAGE_SIMPLE).toBe(PublicSimple)
  expect(PublicEmpty.PRESENTED_IMAGE_DEFAULT).toBe(PRESENTED_IMAGE_DEFAULT)
  const view = mount(() => <PublicEmpty {...props} />)
  try { expect(view.host.textContent).toBe('暂无数据暂无') } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
