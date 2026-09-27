import Demo0 from '../../../docs/src/examples/tag/basic'
import Demo1 from '../../../docs/src/examples/tag/colorful'
import Demo2 from '../../../docs/src/examples/tag/control'
import Demo3 from '../../../docs/src/examples/tag/checkable'
import Demo4 from '../../../docs/src/examples/tag/icon'
import Demo5 from '../../../docs/src/examples/tag/status'
import Demo6 from '../../../docs/src/examples/tag/customize'
import Demo7 from '../../../docs/src/examples/tag/disabled'
import Demo8 from '../../../docs/src/examples/tag/semantic'
const demos = [
  ['basic', '基本', Demo0], ['colorful', '多彩标签', Demo1], ['control', '动态添加和删除', Demo2], ['checkable', '可选择标签', Demo3],
  ['icon', '图标按钮', Demo4], ['status', '预设状态的标签', Demo5], ['customize', '自定义关闭按钮', Demo6], ['disabled', '禁用标签', Demo7],
  ['semantic', '自定义语义结构的样式和类', Demo8],
] as const
export default function Page() {
  return <div class="p-6 max-w-5xl"><h2 class="text-2xl font-semibold mb-6">Tag 标签</h2>
    {demos.map(([id, title, Demo]) => <section data-tag-demo={id} class="mb-8"><h3 class="text-lg font-semibold mb-3">{title}</h3><Demo /></section>)}
  </div>
}
