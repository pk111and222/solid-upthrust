import { createSignal } from 'solid-js'
import { ColorPicker, Button, Divider, Form, FormItem, Switch, type ColorFormat, type ColorPickerPreset } from 'upthrust-ui'
import type { FormInstance } from 'upthrust-competence'
const presets: ColorPickerPreset[] = [
  { label: '品牌色', colors: ['#1677ff', '#722ed1', '#eb2f96', '#f5222d', '#fa8c16', '#fadb14', '#52c41a', '#13c2c2'] },
  { label: '中性色与透明色', colors: ['#000', '#595959', '#bfbfbf', '#fff', '#1677ff80', 'transparent'] },
]
export default function ColorPickerPage() {
  const [value, setValue] = createSignal<string | null>('#1677ff')
  const [disabled, setDisabled] = createSignal(false)
  const [format, setFormat] = createSignal<ColorFormat>('hex')
  const [open, setOpen] = createSignal(false)
  const [log, setLog] = createSignal('尚未修改颜色')
  const [result, setResult] = createSignal('')
  let form: FormInstance | undefined
  return <div class="p-6 max-w-4xl">
    <h2 class="text-2xl font-bold mb-3">ColorPicker 颜色选择器</h2>
    <p class="text-on-surface-variant mb-6">拖动面板取色，或通过滑块、颜色值和预设色精确输入。支持透明度及 HEX、RGB、HSB 格式。</p>
    <h3 class="text-lg font-semibold mb-3">受控颜色与实时预览</h3>
    <div class="flex flex-wrap gap-4 items-center">
      <ColorPicker aria-label="主题颜色" value={value()} showText allowClear presets={presets} disabled={disabled()}
        onChange={(color, css) => { setValue(color?.toHexString() ?? null); setLog(`实时变化：${css || '已清除'}`) }}
        onChangeComplete={color => setLog(`完成选择：${color?.toHexString() ?? '已清除'}`)} />
      <label class="flex items-center gap-2"><Switch checked={disabled()} onChange={setDisabled} />禁用</label>
      <Button onClick={() => setValue('#722ed1')}>外部更新为紫色</Button>
      <div class="rounded px-5 py-3 text-white" style={{ background: value() ?? '#595959' }}>颜色预览</div>
    </div>
    <p role="status" class="text-sm text-on-surface-variant mt-3">{log()}</p>
    <Divider />
    <h3 class="text-lg font-semibold mb-3">尺寸、状态与自定义文本</h3>
    <div class="flex flex-wrap items-center gap-4">
      <ColorPicker aria-label="小尺寸颜色" defaultValue="#52c41a" size="small" showText />
      <ColorPicker aria-label="默认尺寸颜色" defaultValue="#fa8c16" showText />
      <ColorPicker aria-label="大尺寸颜色" defaultValue="#722ed1" size="large" showText={color => color ? `品牌色 ${color.toHexString()}` : '选择品牌色'} />
      <ColorPicker aria-label="错误状态颜色" status="error" showText allowClear />
      <ColorPicker aria-label="警告状态颜色" status="warning" defaultValue="#fadb14" />
      <ColorPicker aria-label="禁用颜色" defaultValue="#1677ff" disabled showText />
    </div>
    <Divider />
    <h3 class="text-lg font-semibold mb-3">格式切换与透明度</h3>
    <div class="flex flex-wrap items-center gap-4">
      <ColorPicker aria-label="可切换格式颜色" defaultValue="rgba(22, 119, 255, 0.5)" format={format()} onFormatChange={setFormat} showText presets={presets} />
      <span class="text-sm text-on-surface-variant">当前格式：{format().toUpperCase()}</span>
      <ColorPicker aria-label="不透明颜色" defaultValue="#13c2c280" disabledAlpha defaultFormat="rgb" disabledFormat showText />
      <ColorPicker aria-label="HSB颜色" defaultValue="hsb(280, 60%, 90%)" defaultFormat="hsb" showText />
    </div>
    <p class="text-sm text-on-surface-variant mt-3">第二个选择器禁用透明度并锁定 RGB 格式，第三个以 HSB 格式显示。</p>
    <Divider />
    <h3 class="text-lg font-semibold mb-3">内嵌面板与预设色</h3>
    <ColorPicker inline defaultValue="#eb2f9680" presets={presets} allowClear class="border border-solid border-outline-variant rounded-lg" />
    <Divider />
    <h3 class="text-lg font-semibold mb-3">受控弹层</h3>
    <div class="flex items-center gap-3"><Button onClick={() => setOpen(!open())}>{open() ? '关闭面板' : '打开面板'}</Button>
      <ColorPicker aria-label="受控弹层颜色" defaultValue="#fa8c16" open={open()} onOpenChange={setOpen} placement="bottomRight" showText />
    </div>
    <Divider />
    <h3 class="text-lg font-semibold mb-3">表单接入</h3>
    <Form ref={instance => { form = instance }} onFinish={values => setResult(JSON.stringify(values))}>
      <FormItem name="color" initialValue="#1677ff" label="主题色" rules={[{ required: true, message: '请选择主题色' }]}>
        <ColorPicker aria-label="表单主题色" allowClear showText presets={presets} name="themeColor" />
      </FormItem>
      <Button variant="solid" onClick={() => { void form?.submit().catch(() => {}) }}>提交</Button>
    </Form>
    <p role="status" class="text-sm text-on-surface-variant mt-3">{result()}</p>
  </div>
}
