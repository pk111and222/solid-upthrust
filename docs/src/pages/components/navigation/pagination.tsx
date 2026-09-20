import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, Section } from '../../../components/Content'
import api from './pagination-api.json'
import source0 from '../../../examples/pagination/basic.tsx?raw'
import source1 from '../../../examples/pagination/controlled.tsx?raw'
import source2 from '../../../examples/pagination/page-size.tsx?raw'
import source3 from '../../../examples/pagination/jumper.tsx?raw'
import source4 from '../../../examples/pagination/appearance.tsx?raw'
import source5 from '../../../examples/pagination/disabled.tsx?raw'
import source6 from '../../../examples/pagination/dynamic.tsx?raw'
import source7 from '../../../examples/pagination/slice.tsx?raw'
export const meta: PageMeta = { title: 'Pagination 分页', description: '页码、容量选择与快速跳转。', group: '组件', order: 151 }
export default function Page() {
 return <>
 <Section id="usage" title="使用方式"><p>从 upthrust-ui 导入 Pagination。total 必填；默认第 1 页、每页 10 条。总数为 0 时显示第 1 页，区间为 [0, 0]。无公开子组件，UI 不提供 ref；命令式方法由 upthrust-competence 的 createPagination 提供。</p></Section>
<Demo id="pagination/basic" title="基本分页与总数" source={source0} />
<Demo id="pagination/controlled" title="受控页码与容量" source={source1} />
<Demo id="pagination/page-size" title="页容量事件" source={source2} />
<Demo id="pagination/jumper" title="表单内快速跳转" source={source3} />
<Demo id="pagination/appearance" title="尺寸与对齐" source={source4} />
<Demo id="pagination/disabled" title="动态禁用" source={source5} />
<Demo id="pagination/dynamic" title="总数变化与单页隐藏" source={source6} />
<Demo id="pagination/slice" title="Headless 数据切片" source={source7} />
 <Section id="api" title="PaginationProps API"><ApiTable rows={api} /></Section>
 <Section id="contracts" title="状态与边界">
 <p>current 与 pageSize 独立受控；传入时父层负责应用 onChange 请求。不传时使用内部状态，defaultCurrent/defaultPageSize 仅在创建时读取。相同页码或容量不重复回调。容量改变先调用 onShowSizeChange，再调用 onChange，即使页码没变也报告容量变化。</p>
 <p>有效页码始终夹紧到 [1, 总页数]。total 或受控 pageSize 变化不会自动发事件；保留原始请求页码，数据恢复时可回到该页。容量切换则将请求页码收敛到新范围。</p>
 <p>页码与容量应为正安全整数；非法属性分别回退到 1/10，非法容量命令被忽略。total 的负值与非有限值按 0 处理，小数向下取整。goTo 接受整数并夹紧范围；非整数命令忽略。pageSizeOptions 过滤非法值和重复项；没有有效选项时不显示容量选择器，不按 total 自动开启。</p>
 <p>快速跳转仅在 Enter 时接受完整正整数，可带首尾空格；超过总页数时定位末页，非法输入保留。组合输入期间不跳转。分页按钮和跳转 Enter 不提交外层表单。</p>
 </Section>
 <Section id="keyboard" title="键盘与可访问性"><p>分页使用有名称的 nav，当前页带 aria-current。Tab 聚焦按钮，Enter/空格激活，禁用按钮跳过焦点；焦点有可见描边。容量菜单支持方向键、Enter 和 Escape，选定后回焦触发器。省略号仅作展示，不支持点击跨页。小尺寸不改变交互规则。</p></Section>
 <Section id="headless" title="Headless API"><p>createPagination(config) 接受页码、容量、total、disabled 与两个回调，默认值和 UI 一致。返回 current()/pageSize()/totalPages()/pageRange()/hasPrev()/hasNext()；goTo(page)/prev()/next()/changePageSize(size)；offset()、rangeFor() 为零基半开区间，itemRange() 为一基展示区间，slice(items) 返回当前页数组。refs 为 PaginationIns，包含 current/pageSize/goTo/prev/next。公开类型还有 PaginationConfig 和 PageItem（数字或 prev-ellipsis/next-ellipsis）。</p><p>无内置网络请求、异步任务或定时器；请求竞态由调用方管理。分页不自动折行，窄容器可用 small 或减少辅助控件。本页描述当前实现，不承诺与其他库 API 完全兼容。</p></Section>
 </>
}
