import Demo0 from '../../../docs/src/examples/progress/line'
import Demo1 from '../../../docs/src/examples/progress/circle'
import Demo2 from '../../../docs/src/examples/progress/line-mini'
import Demo3 from '../../../docs/src/examples/progress/circle-micro'
import Demo4 from '../../../docs/src/examples/progress/circle-mini'
import Demo5 from '../../../docs/src/examples/progress/dynamic'
import Demo6 from '../../../docs/src/examples/progress/format'
import Demo7 from '../../../docs/src/examples/progress/dashboard'
import Demo8 from '../../../docs/src/examples/progress/segment'
import Demo9 from '../../../docs/src/examples/progress/linecap'
import Demo10 from '../../../docs/src/examples/progress/gradient-line'
import Demo11 from '../../../docs/src/examples/progress/steps'
import Demo12 from '../../../docs/src/examples/progress/circle-steps'
import Demo13 from '../../../docs/src/examples/progress/size'
import Demo14 from '../../../docs/src/examples/progress/info-position'
import Demo15 from '../../../docs/src/examples/progress/style-class'
const demos = [['line', '进度条', Demo0], ['circle', '进度圈', Demo1], ['line-mini', '小型进度条', Demo2], ['circle-micro', '响应式进度圈', Demo3], ['circle-mini', '小型进度圈', Demo4], ['dynamic', '动态展示', Demo5], ['format', '自定义文字格式', Demo6], ['dashboard', '仪表盘', Demo7], ['segment', '分段进度条', Demo8], ['linecap', '边缘形状', Demo9], ['gradient-line', '自定义进度条渐变色', Demo10], ['steps', '步骤进度条', Demo11], ['circle-steps', '步骤进度圈', Demo12], ['size', '尺寸', Demo13], ['info-position', '改变进度数值位置', Demo14], ['style-class', '自定义语义结构的样式和类', Demo15]] as const
export default function Page() {
  return <div class="p-6 max-w-5xl"><h2 class="text-2xl font-semibold mb-6">Progress 进度条</h2>
    {demos.map(([id, title, Demo]) => <section data-progress-demo={id} class="mb-8"><h3 class="text-lg font-semibold mb-3">{title}</h3><Demo /></section>)}
  </div>
}
