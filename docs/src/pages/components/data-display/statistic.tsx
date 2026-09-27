import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import basic from '../../../examples/statistic/basic.tsx?raw'
import unit from '../../../examples/statistic/unit.tsx?raw'
import animated from '../../../examples/statistic/animated.tsx?raw'
import card from '../../../examples/statistic/card.tsx?raw'
import timer from '../../../examples/statistic/timer.tsx?raw'
import semantic from '../../../examples/statistic/semantic.tsx?raw'
import statisticApi from './statistic-api.json'
import timerApi from './statistic-timer-api.json'
import countdownApi from './statistic-countdown-api.json'

export const meta: PageMeta = { title: 'Statistic 统计数值', description: '展示统计数值与计时器。', group: '组件', order: 167 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>当需要突出某个或某组数字时，或需要展示带描述的统计类数据时使用。Statistic.Timer / Statistic.Countdown 同时提供具名导出 StatisticTimer / StatisticCountdown。</p><CodeBlock code={"import { Statistic, StatisticTimer } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="statistic/basic" title="基本" description="简单的展示。" source={basic} />
      <Demo id="statistic/unit" title="单位" description="通过前缀和后缀添加单位。" source={unit} />
      <Demo id="statistic/animated" title="动画效果" description="给数值添加动画进入效果；antd 配合 react-countup，这里用 requestAnimationFrame 实现同样的效果。" source={animated} />
      <Demo id="statistic/card" title="在卡片中使用" description="在卡片中展示统计数值。" source={card} />
      <Demo id="statistic/timer" title="计时器" description="计时器组件，支持倒计时与正计时。" source={timer} />
      <Demo id="statistic/semantic" title="自定义语义结构的样式和类" description="通过 classNames 和 styles 自定义 root、header、title、content、value、prefix、suffix 的样式。" source={semantic} />
    </DemoGrid></Section>
    <Section id="statistic-api" title="Statistic API"><ApiTable rows={statisticApi} /></Section>
    <Section id="timer-api" title="Statistic.Timer API"><ApiTable rows={timerApi} /></Section>
    <Section id="countdown-api" title="Statistic.Countdown API"><p>已废弃，等同于 {'<Statistic.Timer type="countdown" />'}。</p><ApiTable rows={countdownApi} /></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/statistic-cn/">Ant Design Statistic 6.6.5</a> 的全部公开示例，数值格式化逐项对照其源码：按正则 {'/^(-?)(\\d*)(\\.(\\d+))?$/'} 匹配，数字字符串同样分组；precision 截断补零而不四舍五入（1.999 精度 2 显示 1.99）；'1e21'、'abc'、'-' 等非法值原样显示。计时器每 1000/60 ms 刷新，挂载前显示 '-'；format 中最大的单位吸收溢出（HH:mm:ss 下 2 天显示 48 小时）；onFinish 只在倒计时越过目标时触发一次并停止刷新，value 或 type 变化时重启。</p><p>与 antd 的差异：classNames / styles 不支持函数形式；未接入 ConfigProvider；RTL 未处理；目标时间无法解析时显示 00:00:00（antd 显示 NaN）。</p></Section>
  </>
}
