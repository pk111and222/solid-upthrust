import Demo0 from '../../../docs/src/examples/badge/basic'
import Demo1 from '../../../docs/src/examples/badge/no-wrapper'
import Demo2 from '../../../docs/src/examples/badge/overflow'
import Demo3 from '../../../docs/src/examples/badge/dot'
import Demo4 from '../../../docs/src/examples/badge/change'
import Demo5 from '../../../docs/src/examples/badge/link'
import Demo6 from '../../../docs/src/examples/badge/offset'
import Demo7 from '../../../docs/src/examples/badge/size'
import Demo8 from '../../../docs/src/examples/badge/status'
import Demo9 from '../../../docs/src/examples/badge/colorful'
import Demo10 from '../../../docs/src/examples/badge/ribbon'
import Demo11 from '../../../docs/src/examples/badge/title'
import Demo12 from '../../../docs/src/examples/badge/semantic'
const demos = [
  ['basic', '基本', Demo0], ['no-wrapper', '独立使用', Demo1], ['overflow', '封顶数字', Demo2], ['dot', '讨嫌的小红点', Demo3],
  ['change', '动态', Demo4], ['link', '可点击', Demo5], ['offset', '自定义位置偏移', Demo6], ['size', '大小', Demo7],
  ['status', '状态点', Demo8], ['colorful', '多彩徽标', Demo9], ['ribbon', '缎带', Demo10], ['title', '自定义标题', Demo11],
  ['semantic', '自定义语义结构的样式和类', Demo12],
] as const
export default function Page() {
  return <div class="p-6 max-w-5xl"><h2 class="text-2xl font-semibold mb-6">Badge 徽标数</h2>
    {demos.map(([id, title, Demo]) => <section data-badge-demo={id} class="mb-8"><h3 class="text-lg font-semibold mb-3">{title}</h3><Demo /></section>)}
  </div>
}
