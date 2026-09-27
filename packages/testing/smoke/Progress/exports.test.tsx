import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import Progress, { type ProgressProps } from '../../../components/lib/Progress'
import { mount } from '../../utils/mount'

const props: Public.ProgressProps = {
  type: 'line' satisfies Public.ProgressType,
  percent: 60,
  status: 'active' satisfies Public.ProgressStatus,
  size: 'small' satisfies Public.ProgressSize,
  strokeColor: { from: '#108ee9', to: '#87d068' } satisfies Public.ProgressStrokeColor,
  strokeLinecap: 'butt' satisfies Public.ProgressLinecap,
  success: { percent: 30 } satisfies Public.ProgressSuccess,
  percentPosition: { align: 'start' } satisfies Public.ProgressPercentPosition,
  classNames: { root: 'r' } satisfies Public.ProgressSemanticClassNames,
  styles: (info: Public.ProgressSemanticInfo): Public.ProgressSemanticStyles => ({ root: { opacity: info.props.percent! / 100 } }),
} satisfies ProgressProps
const gap: Public.ProgressGapPlacement = 'start'
const legacyGap: Public.ProgressGapPosition = 'left'
const steps: Public.ProgressSteps = { count: 3, gap: 2 }
const gradient: Public.ProgressGradient = { '0%': 'red' }
const PublicProgress: typeof Public.Progress = Progress
// 公开入口：Progress 与全部类型可用；最小挂载后可清理。
it('[progress.exports] mounts Progress from the public entry', () => {
  expect([gap, legacyGap, steps.count, gradient['0%']]).toEqual(['start', 'left', 3, 'red'])
  const view = mount(() => <PublicProgress {...props} />)
  try {
    const root = view.host.firstElementChild as HTMLElement
    expect([root.getAttribute('role'), root.getAttribute('aria-valuenow'), root.style.opacity, view.host.textContent]).toEqual(['progressbar', '30', '0.6', '60%'])
  } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
