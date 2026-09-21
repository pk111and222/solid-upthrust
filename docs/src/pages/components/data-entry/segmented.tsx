import optionApi from './segmented-option-api.json'
import instanceApi from './segmented-instance-api.json'
import dynamic from '../../../examples/segmented/dynamic.tsx?raw'
import status from '../../../examples/segmented/status.tsx?raw'
import icons from '../../../examples/segmented/icons.tsx?raw'
import sizes from '../../../examples/segmented/sizes.tsx?raw'
import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './segmented-api.json'
import basic from '../../../examples/segmented/basic.tsx?raw'
import controlled from '../../../examples/segmented/controlled.tsx?raw'
import keyboard from '../../../examples/segmented/keyboard.tsx?raw'
import context from '../../../examples/segmented/context.tsx?raw'
import states from '../../../examples/segmented/states.tsx?raw'

export const meta: PageMeta = { title: 'Segmented 分段控制器', description: '单值互斥选择、滑动 thumb、键盘遍历与表单字段接入。', group: '组件', order: 280 }

export default function SegmentedPage() { return <>
  <Section id="usage" title="使用方式">
    <p>Segmented 是单值互斥选择器，options 支持裸 string/number 和带 label、value、disabled、icon 的对象。value 未提供时读取 Form.Item 字段，再使用 defaultValue 或内部状态；点击当前项不会取消选择。</p>
    <p>组使用 radiogroup 角色，Tab 进入后方向键跳过禁用项并循环遍历，Home/End 定位边界，Enter/Space 提交候选，Esc 取消候选。没有可见标签时请通过 aria-label 或 aria-labelledby 命名。</p>
    <p>thumb 根据选项实际 offsetLeft/offsetWidth 测量并跟随选择；block 让选项等宽铺满容器。组件不渲染原生 input，不提供 name/FormData 提交，需要字段收集时请接入 Form。</p>
  </Section>
  <Section id="examples" title="示例"><DemoGrid>
    <Demo id="segmented/basic" title="基础、禁用与裸值" source={basic}/>
    <Demo id="segmented/controlled" title="受控更新" source={controlled}/>
    <Demo id="segmented/keyboard" title="键盘遍历" source={keyboard}/>
    <Demo id="segmented/context" title="Form 与全局配置" source={context}/>
    <Demo id="segmented/states" title="block 与禁用" source={states}/>
    <Demo id="segmented/sizes" title="三种尺寸" source={sizes}/>
    <Demo id="segmented/icons" title="带图标" source={icons}/>
    <Demo id="segmented/status" title="错误与警告" source={status}/>
    <Demo id="segmented/dynamic" title="动态选项与 ref" source={dynamic}/>
  </DemoGrid></Section>
  <Section id="api" title="SegmentedProps API"><ApiTable rows={api}/></Section>
  <Section id="options-api" title="SegmentedOption API"><ApiTable rows={optionApi}/></Section>
  <Section id="instance-api" title="SegmentedIns（ref）API"><ApiTable rows={instanceApi}/></Section>
  <Section id="limits" title="边界与 headless">
    <p>选项 value 应唯一；移除或禁用选项会取消相应候选，Enter 不会提交失效值。已选值由调用方决定是否重置，不会因为选项移除自动触发 onChange。数字 0 与字符串 '0' 是不同键。显式 value、onChange、disabled、id 优先于 Form.Item，显式 onChange 接管后需自行同步字段。</p>
    <p>ref 返回 createSegmented 机器，提供 value、select、isSelected、isDisabled、thumbRect、setItemRect、moveFocus 和 focusEdge 等底层接口。UI 的测量由组件自身完成，常规调用不需要手动设置矩形。</p>
  </Section>
</> }
