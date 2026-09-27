import Demo0 from '../../../docs/src/examples/empty/basic'
import Demo1 from '../../../docs/src/examples/empty/simple'
import Demo2 from '../../../docs/src/examples/empty/customize'
import Demo3 from '../../../docs/src/examples/empty/description'
import Demo4 from '../../../docs/src/examples/empty/semantic'
const demos = [
  ['basic', '基本', Demo0], ['simple', '选择图片', Demo1], ['customize', '自定义', Demo2],
  ['description', '无描述', Demo3], ['semantic', '自定义语义结构的样式和类', Demo4],
] as const
export default function Page() {
  return <div class="p-6 max-w-5xl"><h2 class="text-2xl font-semibold mb-6">Empty 空状态</h2>
    {demos.map(([id, title, Demo]) => <section data-empty-demo={id} class="mb-8"><h3 class="text-lg font-semibold mb-3">{title}</h3><Demo /></section>)}
  </div>
}
