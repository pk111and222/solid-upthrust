import Demo0 from '../../../docs/src/examples/alert/basic'
import Demo1 from '../../../docs/src/examples/alert/style'
import Demo2 from '../../../docs/src/examples/alert/closable'
import Demo3 from '../../../docs/src/examples/alert/description'
import Demo4 from '../../../docs/src/examples/alert/icon'
import Demo5 from '../../../docs/src/examples/alert/banner'
import Demo6 from '../../../docs/src/examples/alert/smooth-closed'
import Demo7 from '../../../docs/src/examples/alert/error-boundary'
import Demo8 from '../../../docs/src/examples/alert/custom-icon'
import Demo9 from '../../../docs/src/examples/alert/action'
import Demo10 from '../../../docs/src/examples/alert/filled'
import Demo11 from '../../../docs/src/examples/alert/custom-title-alignment'
import Demo12 from '../../../docs/src/examples/alert/style-class'
const demos = [['basic', '基本', Demo0], ['style', '四种样式', Demo1], ['closable', '可关闭的警告提示', Demo2], ['description', '含有辅助性文字介绍', Demo3], ['icon', '图标', Demo4], ['banner', '顶部公告', Demo5], ['smooth-closed', '平滑地卸载', Demo6], ['error-boundary', 'ErrorBoundary', Demo7], ['custom-icon', '自定义图标', Demo8], ['action', '操作', Demo9], ['filled', '填充样式', Demo10], ['custom-title-alignment', '自定义标题对齐', Demo11], ['style-class', '自定义语义结构的样式和类', Demo12]] as const
export default function Page() {
  return <div class="p-6 max-w-5xl"><h2 class="text-2xl font-semibold mb-6">Alert 警告提示</h2>
    {demos.map(([id, title, Demo]) => <section data-alert-demo={id} class="mb-8"><h3 class="text-lg font-semibold mb-3">{title}</h3><Demo /></section>)}
  </div>
}
