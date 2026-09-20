import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import inputApi from './input-api.json'
import passwordApi from './input-password-api.json'
import textareaApi from './input-textarea-api.json'
import searchApi from './input-search-api.json'
import source0 from '../../../examples/input/basic.tsx?raw'
import source1 from '../../../examples/input/controlled.tsx?raw'
import source2 from '../../../examples/input/affix.tsx?raw'
import source3 from '../../../examples/input/size-status.tsx?raw'
import source4 from '../../../examples/input/events.tsx?raw'
import source5 from '../../../examples/input/password.tsx?raw'
import source6 from '../../../examples/input/password-controlled.tsx?raw'
import source7 from '../../../examples/input/textarea.tsx?raw'
import source8 from '../../../examples/input/autosize.tsx?raw'
import source9 from '../../../examples/input/search.tsx?raw'
import source10 from '../../../examples/input/search-loading.tsx?raw'
import source11 from '../../../examples/input/context.tsx?raw'
export const meta: PageMeta = { title: 'Input 输入框', description: '单行输入、密码、多行文本和搜索输入。', group: '组件', order: 210 }
export default function Page() { return <>
<Section id="usage" title="使用方式"><p>四个组件独立命名导出：Input、InputPassword、InputTextArea、InputSearch。当前不提供 Input.Password / Input.TextArea / Input.Search 静态属性。</p><CodeBlock code={"import { Input, InputPassword, InputTextArea, InputSearch } from 'upthrust-ui'"} /><p>显式 value/onChange 优先于 Form.Item 字段注入；只传 onChange 时由调用方负责字段联动。默认值只初始化一次。显式尺寸/禁用优先于 Form、组件默认与全局默认。</p><p>输入法期间保留草稿，组合结束通知一次；计数按 UTF-16 长度，不代表可见字符数量。请用 label 与 id 关联输入名称。外部受控值不会按 maxLength 截断。这里只透传 API 表列出的属性，不承诺任意原生属性透传。</p></Section>
<Section id="input" title="Input 单行输入"><DemoGrid><Demo id="input/basic" title="基础输入" source={source0} />
<Demo id="input/controlled" title="受控、清空与计数" source={source1} />
<Demo id="input/affix" title="动态前后缀" source={source2} />
<Demo id="input/size-status" title="尺寸与状态" source={source3} />
<Demo id="input/events" title="输入法、事件与原生 ref" source={source4} />
<Demo id="input/context" title="Form 字段注入与全局配置" source={source11} /></DemoGrid></Section>
<Section id="input-api" title="InputProps API"><ApiTable rows={inputApi} /></Section>
<Section id="password" title="InputPassword 密码框"><p>密码可见性与输入值分别控制。readonly 允许查看密码，disabled 阻止切换；悬停离开恢复进入前状态。</p><DemoGrid><Demo id="input/password" title="Password 点击与悬停" source={source5} />
<Demo id="input/password-controlled" title="Password 受控可见性" source={source6} /></DemoGrid></Section>
<Section id="password-api" title="PasswordProps API"><ApiTable rows={passwordApi} /></Section>
<Section id="textarea" title="InputTextArea 文本域"><p>rows 控制固定行数，autoSize 按内容与宽度调整并可限制行数。超过最大行数出现纵向滚动；卸载时清理测量节点。style.height 可主动覆盖自动高度。</p><DemoGrid><Demo id="input/textarea" title="TextArea 多行与计数" source={source7} />
<Demo id="input/autosize" title="TextArea 自动高度与销毁" source={source8} /></DemoGrid></Section>
<Section id="textarea-api" title="TextAreaProps API"><ApiTable rows={textareaApi} /></Section>
<Section id="search" title="InputSearch 搜索框"><p>搜索按钮与 Enter 使用当前输入值；清空同时触发 onChange 和 source=clear 的 onSearch。loading 阻止搜索，不禁止继续编辑。onSearch 不自动管理 Promise 或 loading。</p><DemoGrid><Demo id="input/search" title="Search 图标与按钮" source={source9} />
<Demo id="input/search-loading" title="Search 加载状态" source={source10} /></DemoGrid></Section>
<Section id="search-api" title="SearchProps API"><ApiTable rows={searchApi} /></Section>
</> }
