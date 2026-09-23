import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './auto-complete-api.json'
import optionApi from './auto-complete-option-api.json'
import basic from '../../../examples/auto-complete/basic.tsx?raw'
import filter from '../../../examples/auto-complete/filter.tsx?raw'
import remote from '../../../examples/auto-complete/remote.tsx?raw'
import variants from '../../../examples/auto-complete/variants.tsx?raw'
import context from '../../../examples/auto-complete/context.tsx?raw'
import keyboard from '../../../examples/auto-complete/keyboard.tsx?raw'

export const meta: PageMeta = { title: 'AutoComplete 自动补全', description: '自由文本输入、候选建议与键盘补全。', group: '组件', order: 291 }
export default function AutoCompletePage() { return <>
  <Section id="usage" title="使用方式">
    <p>从 upthrust-ui 导入 AutoComplete、AutoCompleteProps 与 AutoCompleteOption。值始终是自由文本，不要求来自候选项。默认忽略大小写，在 value 和 label 中做子串匹配；选中后将 label（缺省时为 value）回填到输入框，onSelect 返回选项键和原始对象。</p>
    <p>聚焦或输入时展开候选，方向键循环跳过禁用项，Enter 选中并关闭，Escape 关闭，Tab 正常移出焦点。组合输入期间不搜索或选择，结束后提交一次。候选层默认与输入框保持相同宽度，并随输入框尺寸变化。ref 返回原生 HTMLInputElement，可调用 focus() / blur()。</p>
  </Section>
  <Section id="examples" title="示例"><DemoGrid>
    <Demo id="auto-complete/basic" title="自由文本与受控选值" source={basic} />
    <Demo id="auto-complete/filter" title="默认值与自定义过滤" source={filter} />
    <Demo id="auto-complete/remote" title="异步候选" source={remote} />
    <Demo id="auto-complete/variants" title="尺寸、状态与禁用" source={variants} />
    <Demo id="auto-complete/context" title="表单提交与重置" source={context} />
    <Demo id="auto-complete/keyboard" title="受控浮层与键盘导航" source={keyboard} />
  </DemoGrid></Section>
  <Section id="api" title="AutoCompleteProps API"><ApiTable rows={api} /></Section>
  <Section id="option-api" title="AutoCompleteOption API"><ApiTable rows={optionApi} /></Section>
  <Section id="limits" title="约定与边界">
    <p>value/open 为受控属性，父层需写回回调值。defaultValue/defaultOpen 仅初始化使用。选项 value 必须唯一；label 支持字符串（包含空字符串），不支持 JSX、分组或虚拟列表。空候选显示“无匹配结果”。没有公开子组件。</p>
    <p>onChange 在输入与选中时触发；onSearch 只由输入触发，选中不会发起搜索。异步请求由调用方管理，通过 options 写入结果；远程过滤应设置 filterOption=false，并处理过期请求和卸载。动态更新 options、value 或过滤器会重新计算候选。</p>
    <p>Form.Item 可注入值、变更回调、id、禁用、尺寸与校验状态，显式 props 优先。显式 onChange 会接管字段变更，需要调用方自行同步表单。ConfigProvider 支持组件默认属性及主题作用域。name 用于原生表单文本提交，禁用输入不参加提交。</p>
    <p>本组件没有 allowClear、loading、自定义输入节点或浮层容器属性。当前真实浏览器证据为 Chromium，其他浏览器、打包消费者与共享弹层完整验收留待工程回归。</p>
  </Section>
</> }
