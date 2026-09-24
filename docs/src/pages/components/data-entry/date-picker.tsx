import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, DemoGrid, Section } from '../../../components/Content'
import basic from '../../../examples/date-picker/basic.tsx?raw'
import range from '../../../examples/date-picker/range.tsx?raw'
import modes from '../../../examples/date-picker/modes.tsx?raw'
import timePresets from '../../../examples/date-picker/time-presets.tsx?raw'
import constraints from '../../../examples/date-picker/constraints.tsx?raw'
import form from '../../../examples/date-picker/form.tsx?raw'
import filter from '../../../examples/date-picker/filter.tsx?raw'
import open from '../../../examples/date-picker/open.tsx?raw'
import presets from '../../../examples/date-picker/presets.tsx?raw'
import disabled from '../../../examples/date-picker/disabled.tsx?raw'
import api from './date-picker-api.json'
import rangeApi from './date-range-picker-api.json'

export const meta: PageMeta = { title: 'DatePicker 日期选择器', description: '选择日期、周期、日期时间和起止范围。', group: '组件', order: 286 }

export default function DatePickerPage() {
  return <>
    <Section id="usage" title="使用方式">
      <p>DatePicker 使用 YYYY-MM-DD 字符串；showTime 启用 YYYY-MM-DD HH:mm:ss。week、month、quarter、year 模式返回所选周期的起始日期。value 受控时应在 onChange 中回写，defaultValue 仅用于初始状态。</p>
      <p>RangePicker 使用 [开始日期, 结束日期] 或 null，两端共享 min、max、disabledDate 和 showTime。选择面板中的日期、输入文本失焦提交或清空时通知 onChange。焦点事件只由原生输入转发。</p>
    </Section>
    <Section id="examples" title="示例"><DemoGrid>
      <Demo id="date-picker/basic" title="受控日期与周起始日" source={basic} />
      <Demo id="date-picker/range" title="双面板日期范围" source={range} />
      <Demo id="date-picker/modes" title="周、月、季度与年" source={modes} />
      <Demo id="date-picker/time-presets" title="日期时间与快捷选择" source={timePresets} />
      <Demo id="date-picker/constraints" title="边界、禁用与校验状态" source={constraints} />
      <Demo id="date-picker/form" title="表单提交与重置" source={form} />
      <Demo id="date-picker/filter" title="周期筛选器" source={filter} />
      <Demo id="date-picker/open" title="受控日期面板" source={open} />
      <Demo id="date-picker/presets" title="范围快捷预设" source={presets} />
      <Demo id="date-picker/disabled" title="业务日禁用规则" source={disabled} />
    </DemoGrid></Section>
    <Section id="api" title="DatePickerProps API"><ApiTable rows={api} /></Section>
    <Section id="range-api" title="DatePicker.RangePicker API"><ApiTable rows={rangeApi} /></Section>
    <Section id="limits" title="约定与边界">
      <p>无效日期无法提交；min/max 包含边界，disabledDate 按单日判断。showTime 的 defaultValue 用于没有时间部分的新选择。presets 的函数值在点击时求值，不在页面挂载时运行。范围选择按日期递增，当前不支持两端独立的禁用规则或开放式半区间。</p>
      <p>方向键移动面板高亮日期，PageUp/PageDown 翻月，Enter 选择，Escape 关闭。Form.Item 可提供字段值、禁用与校验状态；显式 value/onChange 优先。当前浏览器专项只覆盖 Chromium，不代表跨浏览器或发布验收。</p>
    </Section>
  </>
}
