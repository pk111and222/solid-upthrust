import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, DemoGrid, Section } from '../../../components/Content'
import basic from '../../../examples/time-picker/basic.tsx?raw'
import range from '../../../examples/time-picker/range.tsx?raw'
import constraints from '../../../examples/time-picker/constraints.tsx?raw'
import clear from '../../../examples/time-picker/clear.tsx?raw'
import open from '../../../examples/time-picker/open.tsx?raw'
import shift from '../../../examples/time-picker/shift.tsx?raw'
import form from '../../../examples/time-picker/form.tsx?raw'
import api from './time-picker-api.json'
import rangeApi from './time-range-picker-api.json'

export const meta: PageMeta = { title: 'TimePicker 时间选择器', description: '选择时间、设置范围与步长，并支持时间区间。', group: '组件', order: 285 }

export default function TimePickerPage() {
  return <>
    <Section id="usage" title="使用方式">
      <p>TimePicker 默认选择到分钟；将 format 设为 HH:mm:ss 可启用秒列。min/max 为包含边界，hourStep、minuteStep、secondStep 控制可选格点。键盘方向键调整当前时间段，Escape 关闭面板，Enter 确认面板高亮选项。</p>
      <p>TimePicker.RangePicker 使用 [开始时间, 结束时间] 值；选择导致顺序反转时组件会调整两端顺序。范围两端共享 format、边界与步长配置。</p>
    </Section>
    <Section id="examples" title="示例"><DemoGrid>
      <Demo id="time-picker/basic" title="分钟与秒精度" source={basic} />
      <Demo id="time-picker/range" title="时间范围" source={range} />
      <Demo id="time-picker/constraints" title="边界、步长与状态" source={constraints} />
      <Demo id="time-picker/clear" title="占位符与清空" source={clear} />
      <Demo id="time-picker/open" title="受控时间面板" source={open} />
      <Demo id="time-picker/shift" title="班次范围与外部回写" source={shift} />
      <Demo id="time-picker/form" title="Form.Item 提交与重置" source={form} />
    </DemoGrid></Section>
    <Section id="api" title="TimePickerProps API"><ApiTable rows={api} /></Section>
    <Section id="range-api" title="TimePicker.RangePicker API"><ApiTable rows={rangeApi} /></Section>
    <Section id="limits" title="边界与说明">
      <p>value、defaultValue 使用字符串，不是 Date 对象。无效输入不会成为有效时间；时间区间发生倒置时会交换两端。当前范围选择器共享相同 min/max，不能为起止端分别配置不同边界。</p>
    </Section>
  </>
}
