import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import Tour from '../../../components/lib/Tour'
import { mount } from '../../utils/mount'

const step: Public.TourStep = {
  title: '标题',
  description: '描述',
  placement: 'rightTop' satisfies Public.TourPlacement,
  gap: { offset: [4, 8], radius: 8 } satisfies Public.TourGap,
  mask: { color: 'rgba(0,0,0,0.3)' } satisfies Public.TourMaskConfig,
  nextButtonProps: { children: '继续' } satisfies Public.TourButtonProps,
  closable: { 'aria-label': '退出' } satisfies Public.TourClosable,
  classNames: { title: 't' } satisfies Public.TourSemanticClassNames,
}
const props: Public.TourProps = {
  steps: [step, {}],
  defaultOpen: true,
  type: 'primary',
  onClose: (_current: number, reason: Public.TourCloseReason) => void reason,
  styles: (info: Public.TourSemanticInfo) => ({ section: { opacity: info.props.type === 'primary' ? '1' : '0.9' } }) satisfies Public.TourSemanticStyles,
  classNames: { root: 'r' } as Record<Public.TourSemanticSlot, string>,
}
// barrel 的 uno.css 副作用只能在构建环境解析，这里用类型断言确认公开组件签名与目录实现一致。
const PublicTour: typeof Public.Tour = Tour

// 公开入口：Tour 与步骤 / gap / mask / 按钮 / 语义化类型可用；最小挂载后可清理（面板与遮罩随之卸载）。
it('[tour.exports] mounts Tour from the public entry', () => {
  const view = mount(() => <PublicTour {...props} />)
  try {
    expect(document.querySelector('[data-tour-part="root"].r')).not.toBeNull()
    expect(document.querySelector('[data-tour-part="title"].t')?.textContent).toBe('标题')
    expect(document.querySelector('[data-tour-part="close"]')?.getAttribute('aria-label')).toBe('退出')
  } finally { view.dispose() }
  expect(document.querySelector('[data-tour-part="root"]')).toBeNull()
  expect(document.querySelector('[data-tour-part="mask"]')).toBeNull()
})
