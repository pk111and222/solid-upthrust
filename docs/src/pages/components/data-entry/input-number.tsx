import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './input-number-api.json'
import basic from '../../../examples/input-number/basic.tsx?raw'
import controlled from '../../../examples/input-number/controlled.tsx?raw'
import precision from '../../../examples/input-number/precision.tsx?raw'
import format from '../../../examples/input-number/format.tsx?raw'
import states from '../../../examples/input-number/states.tsx?raw'
import native from '../../../examples/input-number/native.tsx?raw'
import context from '../../../examples/input-number/context.tsx?raw'
export const meta:PageMeta={title:'InputNumber 数字输入框',description:'数值编辑、精度步进与表单集成。',group:'组件',order:250}
export default function Page(){return <>
 <Section id="usage" title="使用方式"><p>InputNumber 是独立命名导出，无公开子组件。value 为 number 或 null，undefined 表示未显式受控；FormItem 可注入字段值和回调，defaultValue 只初始化一次。使用独立 label，通过 for 与 id 建立可访问名称，避免把增减按钮名称纳入输入标签。</p><p>方向键上 / 下步进，Shift 乘以 shiftMultiplier。步进先通知 onChange，再通知 onStep；受控父层未更新 value 时保持原值。输入过程中保留草稿，合法数字即时通知；空文本和单独负号表示 null，无法解析的中间文本（如 1e）保持已提交值，失焦时转为 null。1. 解析为 1，但聚焦时保留尾随小数点。</p><p>失焦时按 precision 舍入并限制到 min/max，再触发 onBlur；未指定 precision 不截断已有小数。formatter 只改变显示，不改变提交数值。新受控值可覆盖尚未接受的旧草稿。输入法组合期间不提交中间文本或响应步进。</p></Section>
 <Section id="examples" title="示例"><DemoGrid>
<Demo id="input-number/basic" title="基础输入" source={basic}/>
<Demo id="input-number/controlled" title="受控与外部更新" source={controlled}/>
<Demo id="input-number/precision" title="步长与精度" source={precision}/>
<Demo id="input-number/format" title="格式化与装饰" source={format}/>
<Demo id="input-number/states" title="尺寸与状态" source={states}/>
<Demo id="input-number/native" title="原生 ref 与事件" source={native}/>
<Demo id="input-number/context" title="表单与全局配置" source={context}/></DemoGrid></Section>
 <Section id="api" title="InputNumberProps API"><ApiTable rows={api}/></Section>
 <Section id="limits" title="边界"><p>数值使用 JavaScript Number，不支持高精度字符串/stringMode；精度超过安全数值范围需由业务处理。step 数组保留历史类型兼容，当前等同 1，不实现可选值列表。不支持长按连续步进、滚轮步进或公开命令式组件实例。Enter 保留原生表单行为，增减按钮不会提交表单。</p><p>原生 name 提交的是显示文本；业务需要 number/null 请使用 Form。显式 onChange 覆盖字段回调后，由调用方同步字段。只支持表中列出的 props，不透传任意原生属性。样式仅改变外框；过小宽度可能裁切长数值或装饰。</p><p>headless createInputNumber 提供 value/textValue/displayValue/outOfRange/isFocused、setInputText/up/down/commit/notifyFocus/setValue、isDisabled/isReadonly/canUp/canDown。commit 包含失焦通知；setValue 是程序赋值，不受禁用/只读限制，不主动裁剪，下一次 commit 才归一。InputNumberParser / InputNumberFormatter 类型从组件子路径或 competence 导出。</p></Section>
 </>}
