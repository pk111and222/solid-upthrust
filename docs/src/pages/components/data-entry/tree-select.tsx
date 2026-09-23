import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './tree-select-api.json'
import nodeApi from './tree-select-node-api.json'
import basic from '../../../examples/tree-select/basic.tsx?raw'
import multiple from '../../../examples/tree-select/multiple.tsx?raw'
import strict from '../../../examples/tree-select/strict.tsx?raw'
import search from '../../../examples/tree-select/search.tsx?raw'
import controlled from '../../../examples/tree-select/controlled.tsx?raw'
import form from '../../../examples/tree-select/form.tsx?raw'
import virtual from '../../../examples/tree-select/virtual.tsx?raw'
import variants from '../../../examples/tree-select/variants.tsx?raw'
import appearance from '../../../examples/tree-select/appearance.tsx?raw'

export const meta: PageMeta = { title: 'TreeSelect 树选择', description: '在树形层级中选择单个或多个节点。', group: '组件', order: 296 }

export default function TreeSelectPage() { return <>
  <Section id="usage" title="使用方式">
    <p>TreeSelect 通过树形弹层选择节点。单选点击节点提交其 value；多选默认显示复选框并联动父子。设置 treeCheckable=false 后，多选改为逐行点选；treeCheckStrictly 则让复选框父子独立。</p>
    <p>默认 SHOW_PARENT 在整支勾满时只上报最高层的键；SHOW_CHILD 只上报叶节点，SHOW_ALL 上报所有勾选键。value 受控时须在 onChange 中写回；Form.Item 可注入字段值、禁用、尺寸与校验状态。</p>
  </Section>
  <Section id="examples" title="示例"><DemoGrid>
    <Demo id="tree-select/basic" title="单选节点" source={basic} />
    <Demo id="tree-select/appearance" title="连接线、自定义图标与标题" source={appearance} />
    <Demo id="tree-select/multiple" title="父子联动多选" source={multiple} />
    <Demo id="tree-select/strict" title="独立复选与逐行多选" source={strict} />
    <Demo id="tree-select/search" title="搜索与键盘提交" source={search} />
    <Demo id="tree-select/controlled" title="受控值、展开与浮层" source={controlled} />
    <Demo id="tree-select/form" title="表单字段" source={form} />
    <Demo id="tree-select/virtual" title="虚拟长列表" source={virtual} />
    <Demo id="tree-select/variants" title="尺寸、状态与禁用" source={variants} />
  </DemoGrid></Section>
  <Section id="api" title="TreeSelectProps API"><ApiTable rows={api} /></Section>
  <Section id="node-api" title="TreeSelectNode API"><ApiTable rows={nodeApi} /></Section>
  <Section id="limits" title="约定与边界">
    <p>节点 value 在整棵树中必须唯一，string 与 number 是不同的键。单选清空后 onChange 的 value/nodes 均为 undefined；多选清空后均为空数组。节点 disabled 会禁用该节点及其子树；节点 checkable=false 只跳过当前复选，但仍可向可选后代传导。</p>
    <p>搜索按 label 忽略大小写包含匹配，保留命中节点的祖先路径。默认虚拟面板使用固定行高，修改节点行高时应同步 listItemHeight；virtual=false 可渲染完整小树。showLine、showIcon、icon、titleRender 和 indent 控制树的连接线、节点图标、标题与层级缩进。组件不提供异步加载、标签自定义渲染或独立公开子组件；TreeInPanel 是内部实现。</p>
    <p>键盘可用方向键在展开的树中移动，Enter 提交当前节点；Escape 关闭浮层。搜索输入保持焦点时也可使用这些按键。当前真实浏览器回归以 Chromium 为准。</p>
  </Section>
</> }
