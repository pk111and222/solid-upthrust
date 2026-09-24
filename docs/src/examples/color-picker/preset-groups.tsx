import { createSignal } from 'solid-js'
import ColorPicker from 'upthrust-ui/source/ColorPicker'

export default function PresetGroups() {
  const [value, setValue] = createSignal('#1677ff')
  return <div class="flex flex-col gap-3 max-w-sm">
    <ColorPicker value={value()} onChange={color => setValue(color?.toHexString() ?? '')} showText
      presets={[{ label: '品牌色', colors: ['#1677ff', '#722ed1', '#eb2f96'] }, { label: '状态色', colors: ['#52c41a', '#faad14', '#f5222d'] }]} />
    <output>当前主题色：{value() || '未选择'}</output>
  </div>
}
