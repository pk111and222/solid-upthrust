import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Input from 'upthrust-ui/source/Input'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function Trigger() {
  const [result, setResult] = createSignal('尚未校验')
  let form: import('upthrust-competence').FormInstance | undefined
  return <Form ref={v => { form = v }}><FormItem name="code" label="代码" validateTrigger={false} rules={[{ required: true, message: '请输入代码' }]}><Input /></FormItem><Button htmlType="button" onClick={() => form?.validateFields(['code']).then(() => setResult('通过')).catch(() => setResult('失败'))}>手动校验</Button><output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output></Form>
}
