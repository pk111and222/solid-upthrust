import Demo0 from '../../../docs/src/examples/qr-code/base'
import Demo1 from '../../../docs/src/examples/qr-code/icon'
import Demo2 from '../../../docs/src/examples/qr-code/status'
import Demo3 from '../../../docs/src/examples/qr-code/custom-status-render'
import Demo4 from '../../../docs/src/examples/qr-code/type'
import Demo5 from '../../../docs/src/examples/qr-code/custom-size'
import Demo6 from '../../../docs/src/examples/qr-code/custom-color'
import Demo7 from '../../../docs/src/examples/qr-code/download'
import Demo8 from '../../../docs/src/examples/qr-code/errorlevel'
import Demo9 from '../../../docs/src/examples/qr-code/popover'
import Demo10 from '../../../docs/src/examples/qr-code/style-class'
const demos = [['base', '基本使用', Demo0], ['icon', '带 Icon 的例子', Demo1], ['status', '不同的状态', Demo2], ['custom-status-render', '自定义状态渲染器', Demo3], ['type', '自定义渲染类型', Demo4], ['custom-size', '自定义尺寸', Demo5], ['custom-color', '自定义颜色', Demo6], ['download', '下载二维码', Demo7], ['errorlevel', '纠错比例', Demo8], ['popover', '高级用法', Demo9], ['style-class', '自定义语义结构的样式和类', Demo10]] as const
export default function Page() {
  return <div class="p-6 max-w-5xl"><h2 class="text-2xl font-semibold mb-6">QRCode 二维码</h2>
    {demos.map(([id, title, Demo]) => <section data-qrcode-demo={id} class="mb-8"><h3 class="text-lg font-semibold mb-3">{title}</h3><Demo /></section>)}
  </div>
}
