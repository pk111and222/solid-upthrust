import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './select-api.json'
import optionApi from './select-option-api.json'
import basic from '../../../examples/select/basic.tsx?raw'
import multiple from '../../../examples/select/multiple.tsx?raw'
import search from '../../../examples/select/search.tsx?raw'
import tags from '../../../examples/select/tags.tsx?raw'
import virtual from '../../../examples/select/virtual.tsx?raw'
import context from '../../../examples/select/context.tsx?raw'
import variants from '../../../examples/select/variants.tsx?raw'
import advanced from '../../../examples/select/advanced.tsx?raw'
import grouped from '../../../examples/select/grouped.tsx?raw'
import dependent from '../../../examples/select/dependent.tsx?raw'
import remote from '../../../examples/select/remote.tsx?raw'
import labelValue from '../../../examples/select/label-value.tsx?raw'

export const meta: PageMeta = {
  title: 'Select 选择器', description: '单选、多选、分组、搜索、自由标签与虚拟列表。',
  group: '组件', order: 290,
}

export default function SelectPage() { return <>
  <Section id="usage" title="使用方式">
    <p>从 upthrust-ui 导入 Select 与 SelectOption。选项使用 label、value；value 应唯一，数字 0 与字符串 '0' 是不同键。单选默认返回键，多选和 tags 返回键数组；labelInValue 将变更回调改为完整选项对象或对象数组。</p>
    <p>点击或按 Enter/空格打开，方向键跳过禁用项，Enter 选择，Escape 关闭。下拉层默认与选择框等宽，并随其宽度变化。有选值且开启 allowClear 时，右侧清除叉替换下拉箭头；清空后箭头恢复。下拉、加载与清除共用右侧尺寸区域，小/中/大分别为 20/24/28px。showSearch 开启输入过滤；tags 模式默认开启搜索，空值时打开选择器，输入光标位于左侧，输入后按 Enter 可新增自由标签。默认使用固定行高虚拟列表，listItemHeight 应与自定义行高一致。</p>
  </Section>
  <Section id="examples" title="示例"><DemoGrid>
    <Demo id="select/basic" title="受控单选与清空" source={basic} />
    <Demo id="select/multiple" title="多选、折叠标签与事件" source={multiple} />
    <Demo id="select/search" title="搜索与自定义过滤" source={search} />
    <Demo id="select/grouped" title="选项分组与组内搜索" source={grouped} />
    <Demo id="select/dependent" title="联动选择" source={dependent} />
    <Demo id="select/remote" title="异步搜索" source={remote} />
    <Demo id="select/label-value" title="labelInValue 返回对象" source={labelValue} />
    <Demo id="select/tags" title="自由标签" source={tags} />
    <Demo id="select/virtual" title="虚拟滚动" source={virtual} />
    <Demo id="select/context" title="Form.Item 字段" source={context} />
    <Demo id="select/variants" title="尺寸、状态与禁用" source={variants} />
    <Demo id="select/advanced" title="受控浮层与自定义菜单" source={advanced} />
  </DemoGrid></Section>
  <Section id="api" title="SelectProps API"><ApiTable rows={api} /></Section>
  <Section id="option-api" title="SelectOption API"><ApiTable rows={optionApi} /></Section>
  <Section id="group-api" title="SelectOptionGroup API">
    <p>options 可以混用普通选项与 {'{ label: string, options: SelectOption[] }'} 分组。普通选项也可设置 group 字段。搜索后只显示仍有可见选项的分组；启用虚拟列表时，listItemHeight 同时应用于标题和选项。</p>
  </Section>
  <Section id="limits" title="边界与表单">
    <p>value 与 open 为受控属性，回调只提出变更；父层需写回新值。省略 value/open 时，defaultValue/defaultOpen 只用于初始化。Form.Item 的字段值、禁用、尺寸、状态和 id 可注入；显式属性优先，显式 onChange 接管字段回调后需自行同步字段。</p>
    <p>name 会为当前键生成隐藏输入，供原生 FormData 收集；多选生成同名的多个值。动态移除已选选项不会自动清除值，调用方负责重置。loading 仅显示状态图标，不会自动禁止选择或请求数据；异步搜索由调用方通过 onSearch 与 options 管理，filterOption=false 可关闭本地过滤。</p>
    <p>组件无公开子组件，也不提供命令式 ref；ref 回调仅返回外层选择框 DOM。自定义 dropdownRender 会替换选项区内容，请保留传入的 menu 才能继续选择。当前只验证 Chromium，跨浏览器与全局弹层组合留待后续阶段。</p>
    <p>示例范围参考 <a href="https://ant.design/components/select/">Ant Design 6 Select</a> 的基础选择、分组、联动、搜索与自定义下拉内容。当前库没有公开的 Option/OptGroup 子组件，也没有 popupMatchSelectWidth、optionRender 或 tokenSeparators 等对应属性；请以本页 API 表为准。</p>
  </Section>
</> }
