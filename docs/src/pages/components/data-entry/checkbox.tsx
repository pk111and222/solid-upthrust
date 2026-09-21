import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, DemoGrid, Section } from '../../../components/Content'
import checkboxApi from './checkbox-api.json'
import groupApi from './checkbox-group-api.json'
import basic from '../../../examples/checkbox/basic.tsx?raw'
import controlled from '../../../examples/checkbox/controlled.tsx?raw'
import confirmation from '../../../examples/checkbox/confirmation.tsx?raw'
import group from '../../../examples/checkbox/group.tsx?raw'
import children from '../../../examples/checkbox/children.tsx?raw'
import context from '../../../examples/checkbox/context.tsx?raw'
export const meta: PageMeta = { title: 'Checkbox 多选框', description: '布尔选择、多选组与半选展示。', group: '组件', order: 220 }
export default function Page() { return <>
 <Section id="usage" title="使用方式"><p>Checkbox 和 CheckboxGroup 独立命名导出，当前没有 Checkbox.Group 静态属性。checked/value 未提供时读取 Form.Item 字段，否则使用内部状态；默认值只用于初始化。显式 onChange 优先于字段回调，设置后需自行同步字段。</p><p>Tab 聚焦，空格切换；children 提供可访问名称，id 可关联外部 label。indeterminate 只控制半选展示与原生语义，不改变 checked 或提交值。ref 返回原生 input，可调用 focus/blur。只支持下表属性，不承诺任意原生属性透传。</p></Section>
 <Section id="checkbox" title="Checkbox"><DemoGrid><Demo id="checkbox/basic" title="基础状态" source={basic}/><Demo id="checkbox/controlled" title="受控与原生 ref" source={controlled}/><Demo id="checkbox/confirmation" title="父层确认后更新" source={confirmation}/><Demo id="checkbox/context" title="Form 与全局配置" source={context}/></DemoGrid></Section>
 <Section id="checkbox-api" title="CheckboxProps API"><ApiTable rows={checkboxApi}/></Section>
 <Section id="group" title="CheckboxGroup"><p>options 和 children 可同时使用；value 必须唯一，数字 0 与字符串 '0' 是不同选项。有 value 且未 skipGroup 的子项参与组选择，组值覆盖其 checked/defaultChecked；无 value 的子项独立工作。组禁用或选项禁用不可被子项 disabled=false 绕过。子项 onChange 接收布尔值和事件，组回调接收新数组，各触发一次。</p><p>组 name 传给参与组的 input，子项显式 name 优先。默认保留动态移除选项的已选值；全选示例仅选择可用项。独立控件遵循显式禁用、Form、组件默认、全局默认的优先级。当前未提供 UI 层 checkAll/clearAll 实例方法；headless 同名方法保留禁用选项，整组禁用时不修改。</p><DemoGrid><Demo id="checkbox/group" title="全选与半选" source={group}/><Demo id="checkbox/children" title="自定义子项与 skipGroup" source={children}/></DemoGrid></Section>
 <Section id="group-api" title="CheckboxGroupProps API"><ApiTable rows={groupApi}/></Section>
 <Section id="option-api" title="CheckboxOption API"><ApiTable rows={[
 {name:'label',type:'string',default:'必填',description:'选项文字。'}, {name:'value',type:'string | number',default:'必填',description:'唯一值。'}, {name:'disabled',type:'boolean',default:'false',description:'禁用选项；与组禁用叠加。'}]}/></Section>
 </> }
