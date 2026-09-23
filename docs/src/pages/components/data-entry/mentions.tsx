import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './mentions-api.json'
import optionApi from './mentions-option-api.json'
import basic from '../../../examples/mentions/basic.tsx?raw'
import prefix from '../../../examples/mentions/prefix.tsx?raw'
import remote from '../../../examples/mentions/remote.tsx?raw'
import form from '../../../examples/mentions/form.tsx?raw'

export const meta: PageMeta = { title: 'Mentions 提及', description: '在多行文本中插入人员或话题提及。', group: '组件', order: 293 }
export default function MentionsPage() { return <>
  <Section id="usage" title="使用方式">
    <p>Mentions 是多行文本框。输入 @ 后按候选值或标签过滤，方向键选择候选，Enter 插入提及；鼠标也可以选择。选中后用前缀和值替换光标所在的提及词，必要时添加分隔符，光标落在提及及分隔符之后。</p>
    <p>受控 value 需要在 onChange 中写回。onSearch 给出当前光标前的查询文本和前缀，可配合 filterOption=false 提供异步候选。Form.Item 可注入字段值、禁用与校验状态。</p>
  </Section>
  <Section id="examples" title="示例"><DemoGrid>
    <Demo id="mentions/basic" title="受控输入与选择" source={basic} />
    <Demo id="mentions/prefix" title="自定义前缀与分隔符" source={prefix} />
    <Demo id="mentions/remote" title="异步候选" source={remote} />
    <Demo id="mentions/form" title="表单与禁用" source={form} />
  </DemoGrid></Section>
  <Section id="api" title="MentionsProps API"><ApiTable rows={api} /></Section>
  <Section id="option-api" title="MentionOption API"><ApiTable rows={optionApi} /></Section>
  <Section id="limits" title="约定与边界">
    <p>候选 value 是插入文本，label 只负责显示和默认过滤。onSelect 返回完整候选和实际前缀。禁用候选保留在列表中，但键盘与鼠标不能提交。</p>
    <p>提及词以空白或 split 中的任意字符分隔；只识别位于文本起始或分隔符之后的前缀。当前只支持单个字符串前缀，不提供自定义候选渲染或光标像素定位。提及建议浮层锚定在文本框下沿。</p>
  </Section>
</> }
