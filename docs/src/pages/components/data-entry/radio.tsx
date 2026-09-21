import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, DemoGrid, Section } from '../../../components/Content'
import radioApi from './radio-api.json'
import groupApi from './radio-group-api.json'
import buttonApi from './radio-button-api.json'
import basic from '../../../examples/radio/basic.tsx?raw'
import group from '../../../examples/radio/group.tsx?raw'
import controlled from '../../../examples/radio/controlled.tsx?raw'
import dynamic from '../../../examples/radio/dynamic.tsx?raw'
import buttons from '../../../examples/radio/buttons.tsx?raw'
import customButtons from '../../../examples/radio/custom-buttons.tsx?raw'
import context from '../../../examples/radio/context.tsx?raw'
export const meta: PageMeta = { title: 'Radio 单选框', description: '互斥选择、按钮式单选与键盘导航。', group: '组件', order: 230 }
export default function Page() { return <>
 <Section id="usage" title="使用方式"><p>Radio、RadioGroup、RadioButton 均为独立命名导出，当前没有 Radio.Group / Radio.Button 静态属性。已选中的单选框再次点击不取消，也不重复通知。多个互斥选项请使用 RadioGroup；不要仅通过相同 name 拼接多个各自管理内部状态的独立 Radio。</p><p>Tab 进入组内已选项，方向键在同名原生输入之间切换并跳过禁用项。未传 name 的组自动生成唯一名称；参与同组键盘导航的自定义子项应沿用组 name。children 提供可访问名称，独立 Radio 可用 id 关联外部 label。</p></Section>
 <Section id="radio" title="Radio"><DemoGrid><Demo id="radio/basic" title="基础状态与原生 ref" source={basic}/><Demo id="radio/dynamic" title="动态禁用、外观与 skipGroup" source={dynamic}/></DemoGrid></Section>
 <Section id="radio-api" title="RadioProps API"><ApiTable rows={radioApi}/></Section>
 <Section id="group" title="RadioGroup"><p>value 未提供时读取 Form.Item，再使用内部状态；defaultValue 仅初始化一次。组内有 value 且未 skipGroup 的 Radio 使用组值，覆盖其 checked/defaultChecked；无 value 或 skipGroup 子项独立工作且不继承组 name。组禁用和单项禁用叠加，不能用子项 disabled=false 绕过。</p><p>options 与 children 可同时渲染，optionType 只改变自动生成选项的外观。选项值应唯一，数字 0 与字符串 '0' 不同；动态移除选项不会自动清空已选值。显式 onChange 优先于 Form.Item 回调，设置后需要自行同步字段。组回调报告标量，子项回调报告 true 与原始事件。</p><DemoGrid><Demo id="radio/group" title="组选择与键盘" source={group}/><Demo id="radio/controlled" title="父层确认后更新" source={controlled}/><Demo id="radio/buttons" title="按钮外观" source={buttons}/><Demo id="radio/context" title="Form 字段与全局配置" source={context}/></DemoGrid></Section>
 <Section id="group-api" title="RadioGroupProps API"><ApiTable rows={groupApi}/></Section>
 <Section id="button" title="RadioButton"><p>按钮式子项使用同一组选择状态。自定义按钮条需设置各子项的 position；只有一个按钮时使用 single。脱离组时为非受控独立选项，只能从未选变为选中；需要受控或互斥行为请放入 RadioGroup。</p><Demo id="radio/custom-buttons" title="自定义按钮子项" source={customButtons}/></Section>
 <Section id="button-api" title="RadioButtonProps API"><ApiTable rows={buttonApi}/></Section>
 <Section id="option-api" title="RadioOption API"><ApiTable rows={[{name:'label',type:'string',default:'必填',description:'选项标签。'},{name:'value',type:'string | number',default:'必填',description:'唯一选项值。'},{name:'disabled',type:'boolean',default:'false',description:'禁用该选项。'}]}/></Section>
 <Section id="limits" title="边界与 headless"><p>仅透传 API 表列出的属性。UI 无 group 实例 ref 或 clear 方法；headless createRadioGroup 提供 value/isSelected/isDisabled/select/clear/options/store。clear 保留禁用选项，整组禁用时无操作；清空通过 onSelectionChange([]) 报告，不用 onChange(undefined) 违反标量回调类型。undefined 表示非受控，不能作为受控空值。</p></Section>
 </> }
