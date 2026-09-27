import Demo0 from '../../../docs/src/examples/timeline/basic'
import Demo1 from '../../../docs/src/examples/timeline/variant'
import Demo2 from '../../../docs/src/examples/timeline/pending'
import Demo3 from '../../../docs/src/examples/timeline/pending-legacy'
import Demo4 from '../../../docs/src/examples/timeline/alternate'
import Demo5 from '../../../docs/src/examples/timeline/horizontal'
import Demo6 from '../../../docs/src/examples/timeline/custom'
import Demo7 from '../../../docs/src/examples/timeline/end'
import Demo8 from '../../../docs/src/examples/timeline/title'
import Demo9 from '../../../docs/src/examples/timeline/title-span'
import Demo10 from '../../../docs/src/examples/timeline/semantic'
import Demo11 from '../../../docs/src/examples/timeline/style-class'
const demos = [['basic', '基本用法', Demo0], ['variant', '变体样式', Demo1], ['pending', '等待中及排序', Demo2], ['pending-legacy', '等待中（废弃写法）', Demo3], ['alternate', '交替展现', Demo4], ['horizontal', '水平布局', Demo5], ['custom', '自定义时间轴点', Demo6], ['end', '另一侧时间轴点', Demo7], ['title', '标签', Demo8], ['title-span', '标题占比', Demo9], ['semantic', '语义化结构', Demo10], ['style-class', '自定义语义结构的样式和类', Demo11]] as const
export default function Page() {
  return <div class="p-6 max-w-5xl"><h2 class="text-2xl font-semibold mb-6">Timeline 时间轴</h2>
    {demos.map(([id, title, Demo]) => <section data-timeline-demo={id} class="mb-8"><h3 class="text-lg font-semibold mb-3">{title}</h3><Demo /></section>)}
  </div>
}
