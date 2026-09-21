import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, DemoGrid, Section } from '../../../components/Content'
import api from './slider-api.json'
import basic from '../../../examples/slider/basic.tsx?raw'
import controlled from '../../../examples/slider/controlled.tsx?raw'
import range from '../../../examples/slider/range.tsx?raw'
import marks from '../../../examples/slider/marks.tsx?raw'
import directions from '../../../examples/slider/directions.tsx?raw'
import native from '../../../examples/slider/native.tsx?raw'
import context from '../../../examples/slider/context.tsx?raw'
export const meta:PageMeta={title:'Slider 滑动输入条',description:'单值与范围选择、刻度吸附、键盘及拖拽。',group:'组件',order:260}
export default function Page(){return <>
 <Section id="usage" title="使用方式"><p>Slider 独立命名导出，无公开子组件。单值用 value/defaultValue，范围用 rangeValue/defaultRangeValue。值始终夹紧到边界，并按步长或刻度归一；默认属性只初始化一次。范围起点不得超过终点，两端重叠后可用 Tab 与方向键重新展开。</p><p>单值选中轨道从 min 填充至当前值，范围轨道填充两端之间。点击轨道选最近滑块；直接按住某个滑块保持该滑块身份。仅接收当前主指针，pointercancel、丢失捕获、窗口失焦、禁用和卸载会取消会话。取消不回滚已接受的值，也不触发 onAfterChange。</p><p>方向键步进，Shift 加速十倍，Home/End 到允许的端点。onChange/onRangeChange 报告意图；受控父层不接受时保持原值。正常结束拖动或抬键/失焦后，onAfterChange 报告实际接受值，不重复发 change。连续按键只在本次交互结束时报告完成。</p><p>请用 aria-label 或 aria-labelledby 设置有意义的名称。id 作用于外框，原生 label for 无法给内部 span 建立标签。两个滑块各有 slider 角色、值、允许边界、方向与禁用状态。</p></Section>
 <Section id="examples" title="示例"><DemoGrid>
<Demo id="slider/basic" title="基础与事件" source={basic}/>
<Demo id="slider/controlled" title="受控进度" source={controlled}/>
<Demo id="slider/range" title="范围选择" source={range}/>
<Demo id="slider/marks" title="刻度与步长" source={marks}/>
<Demo id="slider/directions" title="垂直与反向" source={directions}/>
<Demo id="slider/native" title="禁用、ref 与卸载" source={native}/>
<Demo id="slider/context" title="Form 与全局配置" source={context}/></DemoGrid></Section>
 <Section id="api" title="SliderProps API"><ApiTable rows={api}/></Section>
 <Section id="limits" title="边界"><p>FormItem 数字字段注入单值，二元数组字段自动启用范围。显式值和对应回调优先，接管回调后需自行同步字段。组件不渲染隐藏原生 input，不提供 name/FormData 提交，业务请使用 Form。无 tooltip、可拖动整段轨道、多于两个滑块或只读 UI prop；禁用使用 disabled。</p><p>step=null 是连续取值，方向键仍以 1 为单位；仅刻度选择需要 marksOnly。浮点数使用 JavaScript Number，不提供任意精度保证。vertical 与 reverse 显式控制方向，不自动从 dir=rtl 推断反向。marks 标签是纯字符串，无 JSX 自定义标签。</p><p>headless createSlider 提供 value/rangeValue/isRange、min/max/step、percentOf/valueAt/nearestHandle、beginDrag/dragTo/endDrag/cancelDrag、stepHandle/snapToMin/snapToMax、setValue/setRangeValue、marks/isMarkAt、isDisabled/isDragging/draggingHandle。finishInteraction 用于键盘完成通知；readonly 仅是 headless 写入门控。core() 暴露共享数字机供底层组合，直接调用不等同于 Slider 的范围、刻度和交互协议；常规调用应使用 Slider 方法。</p></Section>
 </>}
