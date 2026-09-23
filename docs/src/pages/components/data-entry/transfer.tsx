import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, Section } from '../../../components/Content'
import api from './transfer-api.json'
import itemApi from './transfer-item-api.json'
import basic from '../../../examples/transfer/basic.tsx?raw'
import search from '../../../examples/transfer/search.tsx?raw'
import oneWay from '../../../examples/transfer/one-way.tsx?raw'
import dynamic from '../../../examples/transfer/dynamic.tsx?raw'
import form from '../../../examples/transfer/form.tsx?raw'
import variants from '../../../examples/transfer/variants.tsx?raw'

export const meta: PageMeta = {
  title: 'Transfer 穿梭框', description: '在左右列表间分配项目，并分别管理临时勾选与最终目标键。',
  group: '组件', order: 298,
}

export default function TransferPage() { return <>
  <Section id="usage" title="使用方式">
    <p>Transfer 将 dataSource 按 targetKeys 分成左右两侧。勾选仅改变临时 selectedKeys；点击中间按钮才改变最终 targetKeys。两个值都可受控，受控时应在 onSelectChange 与 onChange 中分别写回。</p>
    <p>列表头全选只操作当前搜索结果中的可选项，其他已勾选项保留。禁用行不能勾选或移动。单向模式隐藏批量移回按钮，右侧通过逐行移除返回左侧。</p>
  </Section>
  <Section id="examples" title="示例"><div class="grid grid-cols-1 gap-6">
    <Demo id="transfer/basic" title="受控双向分配" source={basic} />
    <Demo id="transfer/search" title="搜索、过滤与全选" source={search} />
    <Demo id="transfer/one-way" title="单向分配与自定义内容" source={oneWay} />
    <Demo id="transfer/dynamic" title="动态数据与数字键" source={dynamic} />
    <Demo id="transfer/form" title="Form.Item 字段" source={form} />
    <Demo id="transfer/variants" title="空态、状态与禁用" source={variants} />
  </div></Section>
  <Section id="api" title="TransferProps API"><ApiTable rows={api} /></Section>
  <Section id="item-api" title="TransferItem API"><ApiTable rows={itemApi} /></Section>
  <Section id="limits" title="约定与边界">
    <p>key 在 dataSource 中应唯一，string 与 number 是不同的键。缺失于 dataSource 的受控目标键会保留，但没有可见行；调用方负责清理失效数据。默认值只在初始化时生效，动态数据更新不会自动清除目标键。Form.Item 可注入字段值、禁用与校验状态；显式 targetKeys/disabled/status 优先。</p>
    <p>原生复选框和按钮支持 Tab、空格与 Enter；面板标题、行勾选和操作按钮都提供可访问名称。列表可滚动，但当前会渲染全部过滤结果，没有虚拟滚动、分页或异步请求协议。render/footer 的内容由调用方负责其内部交互与可访问性。</p>
    <p>该物料没有公开子组件，也不提供拖拽排序或命令式 ref。真实浏览器专项以 Chromium 为准；跨浏览器、发布与部署另行验收。</p>
  </Section>
</> }
