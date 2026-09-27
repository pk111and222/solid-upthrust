import { createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
import Flex from 'upthrust-ui/source/Flex'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import { createForm, type FormInstance } from 'upthrust-competence'

function CodeControl(props: { form: FormInstance }) {
  return <div class="grid gap-2">
    <Input placeholder="自定义控件仍使用 Form.Item 协议" />
    <Flex gap={8} wrap="wrap">
      <Button onClick={() => props.form.setFieldValue('code', 'CUSTOM')}>填入 CUSTOM</Button>
      <Button onClick={() => props.form.setFieldValue('note', '自定义字段')}>设置其他字段</Button>
    </Flex>
  </div>
}

export default function Custom() {
  const [result, setResult] = createSignal('尚未提交')
  const form = createForm()
  return <div class="max-w-xl">
    <Form form={form} onFinish={values => setResult(JSON.stringify(values))}>
      <FormItem name="code" label="自定义控件" rules={[{ required: true, message: '请输入代码' }]}>
        <CodeControl form={form} />
      </FormItem>
      <FormItem name="note" label="自定义补充"><Input /></FormItem>
      <p class="mb-4 text-sm text-on-surface-variant">组合控件中的 Input 自动读取 Form.Item 上下文并写入字段；按钮使用实例 API 回填。</p>
      <Button htmlType="submit" variant="solid">提交自定义值</Button>
    </Form>
    <output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output>
  </div>
}
