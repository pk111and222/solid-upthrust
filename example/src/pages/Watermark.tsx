import Demo0 from '../../../docs/src/examples/watermark/basic'
import Demo1 from '../../../docs/src/examples/watermark/multi-line'
import Demo2 from '../../../docs/src/examples/watermark/image'
import Demo3 from '../../../docs/src/examples/watermark/custom'
import Demo4 from '../../../docs/src/examples/watermark/portal'
const demos = [['basic', '基本', Demo0], ['multi-line', '多行水印', Demo1], ['image', '图片水印', Demo2], ['custom', '自定义配置', Demo3], ['portal', 'Modal 与 Drawer', Demo4]] as const
export default function Page() {
  return <div class="p-6 max-w-5xl"><h2 class="text-2xl font-semibold mb-6">Watermark 水印</h2>
    {demos.map(([id, title, Demo]) => <section data-watermark-demo={id} class="mb-8"><h3 class="text-lg font-semibold mb-3">{title}</h3><Demo /></section>)}
  </div>
}
