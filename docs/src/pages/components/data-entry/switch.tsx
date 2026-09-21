import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './switch-api.json'
import basic from '../../../examples/switch/basic.tsx?raw'
import controlled from '../../../examples/switch/controlled.tsx?raw'
import sizes from '../../../examples/switch/sizes.tsx?raw'
import states from '../../../examples/switch/states.tsx?raw'
import aliases from '../../../examples/switch/aliases-ref.tsx?raw'
import context from '../../../examples/switch/context.tsx?raw'
export const meta:PageMeta={title:'Switch 开关',description:'布尔切换、加载门禁与表单字段。',group:'组件',order:240}
export default function Page(){return <>
 <Section id="usage" title="使用方式"><p>Switch 独立命名导出，无公开子组件。checked 优先于 value，defaultChecked 优先于 defaultValue；false 是有效值。未提供受控值时读取 Form.Item 字段，再使用内部状态。默认值仅初始化一次，父层更新 props 不触发事件。</p><p>鼠标、Enter 和空格都通过原生 button 点击切换。先 onClick(next, event)，再 onChange(next, event)；受控父层不更新时保持原状态。loading 保留聚焦和 onClick 尝试反馈，阻止 onChange；disabled 使用原生禁用，不触发 UI 点击回调。</p><p>无文字的开关应通过 label 的 for 与 id 建立名称。ref 返回原生 HTMLButtonElement；autofocus 是原生属性，自动聚焦受浏览器策略影响。name 仅设置按钮字段名，Switch 为 type=button，不会自动向原生 FormData 提交布尔值；需要字段收集请接入 Form。</p></Section>
 <Section id="examples" title="示例"><DemoGrid>
  <Demo id="switch/basic" title="基础状态与文字" source={basic}/><Demo id="switch/controlled" title="受控与事件" source={controlled}/>
  <Demo id="switch/sizes" title="尺寸与方向" source={sizes}/><Demo id="switch/states" title="禁用与加载" source={states}/>
  <Demo id="switch/aliases-ref" title="别名与原生 ref" source={aliases}/><Demo id="switch/context" title="Form 与全局配置" source={context}/>
 </DemoGrid></Section>
 <Section id="api" title="SwitchProps API"><ApiTable rows={api}/></Section>
 <Section id="limits" title="边界"><p>small 为 16px 轨道与 12px 滑块；middle、large 均使用 22px 轨道与 16px 滑块，large 当前没有独立尺寸。文字会撑开宽度；style 由调用方覆盖，过小宽度可能使文字与滑块重叠。只支持表中属性，不承诺任意原生属性透传。</p><p>显式 onChange 优先于 Form.Item 回调，设置后由调用方负责同步字段。loading 由父层管理，组件不会自动等待 Promise。headless createSwitch 提供 checked/toggle/setChecked/isDisabled/isLoading/isBlocked；setChecked 同值不通知，toggle 即使受阻仍报告 headless onClick 尝试。</p></Section>
 </>}
