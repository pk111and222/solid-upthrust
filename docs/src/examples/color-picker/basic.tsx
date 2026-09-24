import { createSignal } from 'solid-js'
import ColorPicker from 'upthrust-ui/source/ColorPicker'

export default function Basic() {
  const [value, setValue] = createSignal<string | null>('#1677ff')
  return <div class="flex flex-col gap-3 max-w-sm">
    <ColorPicker value={value()} showText allowClear aria-label="主题颜色" onChange={color => setValue(color?.toHexString() ?? null)} />
    <output>当前颜色：{value() ?? '未选择'}</output>
    <div class="h-12 rounded border border-solid border-outline" style={{ background: value() ?? 'transparent' }} />
  </div>
}
