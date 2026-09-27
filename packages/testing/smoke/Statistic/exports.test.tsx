import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import Statistic, { StatisticCountdown, StatisticTimer, type StatisticProps } from '../../../components/lib/Statistic'
import { mount } from '../../utils/mount'

const props: Public.StatisticProps = {
  title: '活跃用户', value: 112893 satisfies Public.StatisticValue,
  classNames: { value: 'v' } satisfies Public.StatisticSemanticClassNames,
  styles: { content: { color: 'red' } } satisfies Public.StatisticSemanticStyles,
} satisfies StatisticProps
const timer: Public.StatisticTimerProps = { type: 'countup' satisfies Public.StatisticTimerType, value: Date.now() + 500 satisfies Public.StatisticTimerValue, format: 'ss' }
const countdown: Public.CountdownProps = { value: 0, onFinish: () => {} }
const PublicStatistic: typeof Public.Statistic = Statistic
const PublicTimer: typeof Public.StatisticTimer = StatisticTimer
const PublicCountdown: typeof Public.StatisticCountdown = StatisticCountdown
// 公开入口：Statistic 与静态 Timer / Countdown 指向具名导出，类型可用；最小挂载后可清理。
it('[statistic.exports] mounts Statistic, Timer and Countdown from the public entry', () => {
  expect(PublicStatistic.Timer).toBe(PublicTimer)
  expect(PublicStatistic.Countdown).toBe(PublicCountdown)
  const view = mount(() => <><PublicStatistic {...props} /><PublicTimer {...timer} /><PublicCountdown {...countdown} /></>)
  try { expect(view.host.textContent).toBe('活跃用户112,8930000:00:00') } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
