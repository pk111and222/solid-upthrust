import ColorPicker from 'upthrust-ui/source/ColorPicker'

export default function States() {
  return <div class="flex flex-wrap gap-3 items-center">
    <ColorPicker aria-label="小尺寸颜色" defaultValue="#52c41a" size="small" showText />
    <ColorPicker aria-label="错误状态颜色" status="error" defaultValue="#f5222d" showText />
    <ColorPicker aria-label="禁用颜色" disabled defaultValue="#1677ff" showText />
  </div>
}
