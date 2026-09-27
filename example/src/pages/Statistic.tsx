import Demo0 from '../../../docs/src/examples/statistic/basic'
import Demo1 from '../../../docs/src/examples/statistic/unit'
import Demo2 from '../../../docs/src/examples/statistic/animated'
import Demo3 from '../../../docs/src/examples/statistic/card'
import Demo4 from '../../../docs/src/examples/statistic/timer'
import Demo5 from '../../../docs/src/examples/statistic/semantic'
const demos = [
  ['basic', '基本', Demo0], ['unit', '单位', Demo1], ['animated', '动画效果', Demo2],
  ['card', '在卡片中使用', Demo3], ['timer', '计时器', Demo4], ['semantic', '自定义语义结构的样式和类', Demo5],
] as const
export default function Page() {
  return <div class="p-6 max-w-5xl"><h2 class="text-2xl font-semibold mb-6">Statistic 统计数值</h2>
    {demos.map(([id, title, Demo]) => <section data-statistic-demo={id} class="mb-8"><h3 class="text-lg font-semibold mb-3">{title}</h3><Demo /></section>)}
  </div>
}
