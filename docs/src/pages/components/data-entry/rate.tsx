import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, DemoGrid, Section } from '../../../components/Content'
import focus from '../../../examples/rate/focus.tsx?raw'
import api from './rate-api.json'
import basic from '../../../examples/rate/basic.tsx?raw'
import half from '../../../examples/rate/half.tsx?raw'
import states from '../../../examples/rate/states.tsx?raw'
import controlled from '../../../examples/rate/controlled.tsx?raw'
import context from '../../../examples/rate/context.tsx?raw'

export const meta: PageMeta = { title: 'Rate 评分', description: '星级评分、半星预览、受控值与表单字段接入。', group: '组件', order: 270 }

export default function RatePage() {
  return <>
    <Section id="usage" title="使用方式">
      <p>Rate 用 0 到 count 的数值表示评分，默认显示 5 个星形字符。点击字符提交评分；allowHalf 开启后，字符左半侧选择半星。指针移动只产生展示预览，离开后恢复已提交值。</p>
      <p>容器使用 slider 角色，以 aria-valuenow 和 aria-valuetext 精确表达整星或半星评分并可用键盘操作：ArrowUp/ArrowRight 增加一个星或半星，ArrowDown/ArrowLeft 减少，Home 或数字 0 清零，End 选满。请通过 aria-label 或 aria-labelledby 提供评分组名称。</p>
    </Section>
    <Section id="examples" title="示例"><DemoGrid>
      <Demo id="rate/basic" title="基础与受控" source={basic} />
      <Demo id="rate/half" title="半星与 hover 预览" source={half} />
      <Demo id="rate/states" title="可清空、禁用与自定义字符" source={states} />
      <Demo id="rate/controlled" title="受控更新" source={controlled} />
      <Demo id="rate/focus" title="聚焦与事件" source={focus} />
      <Demo id="rate/context" title="Form 与全局禁用" source={context} />
    </DemoGrid></Section>
    <Section id="api" title="RateProps API"><ApiTable rows={api} /></Section>
    <Section id="limits" title="边界与差异">
      <p>allowClear 默认关闭；开启后重复点击当前非零评分会提交 0。count 应为正整数，展示和交互评分限制在 0 到 count，外部受控值不会被自动改写。defaultValue 只用于初始化，后续修改不会覆盖用户输入。character 只替换字符内容，半星效果仍通过覆盖层裁剪。</p>
      <p>Rate 不渲染隐藏 input，不提供 name 或 FormData 原生提交；在 Form.Item 中使用可获得字段值、校验和重置。显式 value/onChange/disabled/id 优先于字段上下文。</p>
      <p>headless createRate 另外提供 displayValue、hoverAt、leaveHover、clickAt、stepBy、reset、notifyFocus、notifyBlur 与 core；这些是底层组合接口，常规界面调用应优先使用 Rate。</p>
    </Section>
  </>
}
