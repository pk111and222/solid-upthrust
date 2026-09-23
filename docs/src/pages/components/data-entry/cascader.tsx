import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './cascader-api.json'
import optionApi from './cascader-option-api.json'
import basic from '../../../examples/cascader/basic.tsx?raw'
import search from '../../../examples/cascader/search.tsx?raw'
import multiple from '../../../examples/cascader/multiple.tsx?raw'
import checkable from '../../../examples/cascader/checkable.tsx?raw'
import variants from '../../../examples/cascader/variants.tsx?raw'

export const meta: PageMeta = { title: 'Cascader 级联选择', description: '按树形路径选择单个或多个节点。', group: '组件', order: 292 }
export default function CascaderPage() { return <>
  <Section id="usage" title="使用方式">
    <p>Cascader 将树形选项按路径拆成多列菜单。单选默认只提交叶节点；设置 changeOnSelect 后中间层级也可提交。多选使用 mode="multiple"，checkable 可显示父子联动复选框。</p>
    <p>点击或 hover 展开子级，搜索会将匹配节点展平为完整路径。设置 allowClear 后，选中内容时清除按钮会替代下拉箭头。受控 value 需要在 onChange 中写回；Form.Item 可注入值、禁用、尺寸和校验状态。</p>
  </Section>
  <Section id="examples" title="示例"><DemoGrid>
    <Demo id="cascader/basic" title="单选路径" source={basic} />
    <Demo id="cascader/search" title="路径搜索" source={search} />
    <Demo id="cascader/multiple" title="多选标签" source={multiple} />
    <Demo id="cascader/checkable" title="父子联动" source={checkable} />
    <Demo id="cascader/variants" title="提交规则与禁用" source={variants} />
  </DemoGrid></Section>
  <Section id="api" title="CascaderProps API"><ApiTable rows={api} /></Section>
  <Section id="option-api" title="CascaderOption API"><ApiTable rows={optionApi} /></Section>
  <Section id="limits" title="约定与边界">
    <p>value 必须使用路径数组；多选的每项是完整路径。节点 value 在整棵树中应唯一。禁用节点的祖先禁用状态会传递给所有后代。</p>
    <p>checkable 只保存叶节点路径，父节点的全选、半选状态由后代推导；异步加载需要由调用方更新 options。当前没有公开自定义菜单渲染或浮层容器属性。</p>
    <p>真实浏览器证据覆盖 Chromium 的路径选择、搜索、复选联动和静态 docs/example 产物；其他浏览器与打包消费者安装留待工程回归。</p>
  </Section>
</> }
