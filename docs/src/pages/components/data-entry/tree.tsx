import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, Section } from '../../../components/Content'
import api from './tree-api.json'
import dataSource from '../../../examples/tree/data.ts?raw'
import nodeApi from './tree-node-api.json'
import source0 from '../../../examples/tree/basic.tsx?raw'
import source1 from '../../../examples/tree/controlled.tsx?raw'
import source2 from '../../../examples/tree/check.tsx?raw'
import source3 from '../../../examples/tree/strict.tsx?raw'
import source4 from '../../../examples/tree/disabled.tsx?raw'
import source5 from '../../../examples/tree/search.tsx?raw'
import source6 from '../../../examples/tree/appearance.tsx?raw'
import source7 from '../../../examples/tree/editable.tsx?raw'
import source8 from '../../../examples/tree/drag.tsx?raw'
import source9 from '../../../examples/tree/empty.tsx?raw'
export const meta:PageMeta={title:'Tree 树形控件',description:'层级数据的展开、选择、搜索与拖拽。',group:'组件',order:162}
export default function Page(){return <>
<Section id="usage" title="使用方式"><p>从 upthrust-ui 导入 Tree、moveTreeNode 与 TreeNode 类型。节点使用 value/label，不使用 key/title；value 必须全树唯一，string 与 number 是不同的键。Tree 无公开子组件，TreeInPanel 为 TreeSelect 共用的内部渲染器。</p></Section>
<Demo id="tree/basic" title="默认展开与选中" source={source0}/>
<Demo id="tree/controlled" title="受控状态与事件" source={source1}/>
<Demo id="tree/check" title="级联复选与半选" source={source2}/>
<Demo id="tree/strict" title="多选与独立勾选" source={source3}/>
<Demo id="tree/disabled" title="整体禁用与禁用分支" source={source4}/>
<Demo id="tree/search" title="受控搜索" source={source5}/>
<Demo id="tree/appearance" title="连接线、缩进与图标" source={source6}/>
<Demo id="tree/editable" title="标题内输入控件" source={source7}/>
<Demo id="tree/drag" title="节点拖拽与数据更新" source={source8}/>
<Demo id="tree/empty" title="空数据" source={source9}/>
<Section id="data" title="示例共享数据"><CodeBlock code={dataSource}/></Section>
<Section id="api" title="TreeProps API"><ApiTable rows={api}/></Section>
<Section id="node-api" title="TreeNode API"><ApiTable rows={nodeApi}/></Section>
<Section id="state" title="状态与勾选边界"><p>展开、行选择、复选与搜索可分别受控；回调只请求变更，父级更新属性后才应用。default 属性仅决定创建时状态。再次点击已选节点取消选择。defaultExpandAll 不自动展开后续新增分支；移除节点不会主动清理调用方保存的键，应由调用方维护。</p><p>复选默认父子联动：勾选父节点覆盖可用后代，所有可用后代勾选后提升父节点，否则为半选。disabled 分支隔断传导并保留已有状态；checkable=false 的节点不显示复选框，但传导继续穿过它。checkStrictly 不联动、不计算半选。整体 disabled 阻止交互，保留已有视觉状态；节点局部 disabled 仍可鼠标展开查看，但跳过键盘导航。</p><p>搜索按 label 忽略大小写进行子串匹配，首尾空白忽略。仅保留匹配节点及祖先并强制展开匹配路径；匹配父节点不会自动保留所有未匹配后代。清空后恢复原展开状态。输入本身不会展开或清除业务选择。</p></Section>
<Section id="keyboard" title="键盘与焦点"><p>单一可用节点参与 Tab 顺序。上下箭头移动到可见且启用的节点，Home/End 到首尾；右箭头展开或进入首个可用直接子节点，左箭头收起或返回父节点；Enter 切换行选择；空格在复选模式切换勾选，否则切换行选择。内嵌输入框和按钮保留自身点击与键盘行为。树提供 tree/treeitem/group、层级与位置、选中、禁用和半选语义。</p></Section>
<Section id="drag" title="拖拽 API 与限制"><p>TreeDragInfo 包含 node 和可选原生 event。TreeDropInfo 额外包含 dragNode、dragNodesKeys（包含源节点与后代）、dropPosition 和 dropToGap。TreeDropPosition 为 -1（目标之前）、0（目标内部）、1（目标之后）；行顶部/底部四分之一区域表示前/后，中间表示内部。悬停分支内部 500ms 自动展开；离开、结束、开始新拖拽或卸载取消旧计时器。onDragEnter 在目标或位置变化时触发，onDragOver 随有效悬停触发。</p><p>onDrop 仅报告意图。moveTreeNode(nodes, source, target, position) 返回新结构，内部放置追加到子节点尾部，不修改原树。源或目标缺失、同节点或目标位于源后代时返回原数组。helper 不执行 disabled/allowDrop 业务校验；使用 Tree 的拖放事件时已先完成校验。没有键盘排序或触屏拖动实现。</p></Section>
<Section id="headless" title="Headless 与支持范围"><p>upthrust-competence 导出 createTree、TreeConfig/TreeIns、TreeCheckState、TreeIndex、flattenTree/buildTreeIndex/branchKeysOf 及拖拽类型和 helper。createTree 默认 checkable=true，独立 Tree 的默认行为则见上表。实例提供节点索引、展开/选择/复选命令、半选计算、搜索、visibleKeys/activeKey/navigate 以及拖拽状态和命令。setExpandedKeys/setCheckedKeys 为无回调的非受控 setter；clear 仅清空搜索。</p><p>独立 Tree 当前完整渲染节点，无 virtual/height/loadData 等公开属性；虚拟化仅供 TreeSelect 内部面板使用。无异步加载、懒加载或请求竞态管理。自定义标题不要超过默认 24px 行高；超长名称截断。当前文档以实际实现为准，不承诺与其他库完全兼容。</p></Section>
</>}
