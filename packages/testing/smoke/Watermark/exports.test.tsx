import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import Watermark, { type WatermarkProps } from '../../../components/lib/Watermark'
import { mount } from '../../utils/mount'

const line: Public.WatermarkText = { text: 'b', font: { fontSize: 12 } satisfies Public.WatermarkFont }
const content: Public.WatermarkContent[] = ['a', line]
const props: Public.WatermarkProps = { content, gap: [80, 80], zIndex: 5 } satisfies WatermarkProps
const PublicWatermark: typeof Public.Watermark = Watermark
// 公开入口：Watermark 与内容 / 字体类型可用；容器固定 relative + overflow hidden；最小挂载后可清理。
it('[watermark.exports] mounts Watermark from the public entry', () => {
  const view = mount(() => <PublicWatermark {...props}><span>child</span></PublicWatermark>)
  try {
    const root = view.host.firstElementChild as HTMLElement
    expect([root.style.position, root.style.overflow, root.textContent]).toEqual(['relative', 'hidden', 'child'])
  } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
