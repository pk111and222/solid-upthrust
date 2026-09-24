import ColorPicker from 'upthrust-ui/source/ColorPicker'

export default function CustomText() {
  return <div class="flex flex-wrap gap-3 items-center">
    <ColorPicker defaultValue="rgba(22, 119, 255, 0.45)" showText={color => <span>{color?.toCssString() ?? '透明'}</span>} />
    <ColorPicker defaultValue="#1677ff" disabledAlpha disabledFormat defaultFormat="rgb" showText />
  </div>
}
