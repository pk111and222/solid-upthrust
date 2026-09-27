import Demo0 from '../../../docs/src/examples/result/success'
import Demo1 from '../../../docs/src/examples/result/info'
import Demo2 from '../../../docs/src/examples/result/warning'
import Demo3 from '../../../docs/src/examples/result/403'
import Demo4 from '../../../docs/src/examples/result/404'
import Demo5 from '../../../docs/src/examples/result/500'
import Demo6 from '../../../docs/src/examples/result/error'
import Demo7 from '../../../docs/src/examples/result/custom-icon'
import Demo8 from '../../../docs/src/examples/result/style-class'
const demos = [['success', 'Success', Demo0], ['info', 'Info', Demo1], ['warning', 'Warning', Demo2], ['403', '403', Demo3], ['404', '404', Demo4], ['500', '500', Demo5], ['error', 'Error', Demo6], ['custom-icon', '自定义 icon', Demo7], ['style-class', '自定义语义结构的样式和类', Demo8]] as const
export default function Page() {
  return <div class="p-6 max-w-5xl"><h2 class="text-2xl font-semibold mb-6">Result 结果</h2>
    {demos.map(([id, title, Demo]) => <section data-result-demo={id} class="mb-8"><h3 class="text-lg font-semibold mb-3">{title}</h3><Demo /></section>)}
  </div>
}
