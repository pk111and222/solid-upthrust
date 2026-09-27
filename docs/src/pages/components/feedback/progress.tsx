import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import line from '../../../examples/progress/line.tsx?raw'
import circle from '../../../examples/progress/circle.tsx?raw'
import lineMini from '../../../examples/progress/line-mini.tsx?raw'
import circleMicro from '../../../examples/progress/circle-micro.tsx?raw'
import circleMini from '../../../examples/progress/circle-mini.tsx?raw'
import dynamic from '../../../examples/progress/dynamic.tsx?raw'
import format from '../../../examples/progress/format.tsx?raw'
import dashboard from '../../../examples/progress/dashboard.tsx?raw'
import segment from '../../../examples/progress/segment.tsx?raw'
import linecap from '../../../examples/progress/linecap.tsx?raw'
import gradientLine from '../../../examples/progress/gradient-line.tsx?raw'
import steps from '../../../examples/progress/steps.tsx?raw'
import circleSteps from '../../../examples/progress/circle-steps.tsx?raw'
import size from '../../../examples/progress/size.tsx?raw'
import infoPosition from '../../../examples/progress/info-position.tsx?raw'
import styleClass from '../../../examples/progress/style-class.tsx?raw'
import progressApi from './progress-api.json'

export const meta: PageMeta = { title: 'Progress 进度条', description: '展示操作的当前进度。', group: '组件', order: 181 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>在操作需要较长时间才能完成时，为用户显示该操作的当前进度和状态。</p><CodeBlock code={"import { Progress } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="progress/line" title="进度条" description="标准的进度条。" source={line} />
      <Demo id="progress/circle" title="进度圈" description="圈形的进度。" source={circle} />
      <Demo id="progress/line-mini" title="小型进度条" description="适合放在较狭窄的区域内。" source={lineMini} />
      <Demo id="progress/circle-micro" title="响应式进度圈" description="响应式的圈形进度，当 width 小于等于 20 的时候，进度信息将不会显示在进度圈里面，而是以 Tooltip 的形式显示。" source={circleMicro} />
      <Demo id="progress/circle-mini" title="小型进度圈" description="小一号的圈形进度。" source={circleMini} />
      <Demo id="progress/dynamic" title="动态展示" description="会动的进度条才是好进度条。" source={dynamic} />
      <Demo id="progress/format" title="自定义文字格式" description="format 属性指定格式。" source={format} />
      <Demo id="progress/dashboard" title="仪表盘" description="通过设置 type=dashboard，可以很方便地实现仪表盘样式的进度条。" source={dashboard} />
      <Demo id="progress/segment" title="分段进度条" description="分段展示进度，可以用于细化进度语义。" source={segment} />
      <Demo id="progress/linecap" title="边缘形状" description="通过设定 strokeLinecap=&quot;butt&quot; 可以将进度条边缘的形状从闭合的圆形的圆弧调整为断口。" source={linecap} />
      <Demo id="progress/gradient-line" title="自定义进度条渐变色" description="渐变色封装，circle 与 dashboard 设置渐变时 strokeLinecap 会被忽略。" source={gradientLine} />
      <Demo id="progress/steps" title="步骤进度条" description="带步骤的进度条。" source={steps} />
      <Demo id="progress/circle-steps" title="步骤进度圈" description="步骤进度圈，支持颜色分段展示，默认间隔为 2px。" source={circleSteps} />
      <Demo id="progress/size" title="尺寸" description="进度条尺寸。" source={size} />
      <Demo id="progress/info-position" title="改变进度数值位置" description="改变进度数值位置，可使用 percentPosition 调整，使进度条数值在进度条内部、外部或底部。" source={infoPosition} />
      <Demo id="progress/style-class" title="自定义语义结构的样式和类" description="通过 classNames 和 styles 传入对象或者函数可以自定义 Progress 的语义化结构样式。" source={styleClass} />
    </DemoGrid></Section>
    <Section id="api" title="API"><ApiTable rows={progressApi} /></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/progress-cn/">Ant Design Progress 6</a> 的全部公开示例，圆形几何逐项对照 rc-progress 源码与实测 DOM：半径 50 - strokeWidth / 2，dasharray / dashoffset / rotate 与 antd 一致（圆头端点额外偏移半个线宽）；成功段为 0 时路径透明而非移除；渐变圆使用 mask + conic-gradient；直径 ≤ 20 时数值改由 Tooltip 展示。</p><p>与 antd 的差异：仪表盘传入缺口角度但缺口位置未定义时按 bottom 处理（antd 计算为 NaN）；未接入 ConfigProvider；RTL 未处理。</p></Section>
  </>
}
