import { createSignal } from 'solid-js'
import ColorPicker from 'upthrust-ui/source/ColorPicker'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function FormDemo() {
  const [submitted, setSubmitted] = createSignal('尚未提交')
  return <div class="max-w-sm flex flex-col gap-3">
    <Form initialValues={{ theme: '#1677ff' }} onFinish={values => setSubmitted(JSON.stringify(values))}>
      <FormItem name="theme" label="主题色"><ColorPicker aria-label="表单主题色" showText allowClear
        presets={[{ label: '品牌色', colors: ['#1677ff', '#722ed1'] }]} /></FormItem>
      <div class="flex gap-2"><button type="submit">提交颜色</button><button type="reset">重置颜色</button></div>
    </Form>
    <output>{submitted()}</output>
  </div>
}
