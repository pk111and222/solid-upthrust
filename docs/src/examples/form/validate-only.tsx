import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Input from 'upthrust-ui/source/Input'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function ValidateOnly() {
  const [result, setResult] = createSignal('尚未校验')
  let form: import('upthrust-competence').FormInstance | undefined
  return <Form ref={v => { form = v }}><FormItem name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}><Input /></FormItem><Button htmlType="button" onClick={() => form?.validateFields({ validateOnly: true }).then(() => setResult('validateOnly 通过')).catch(() => setResult('validateOnly 失败'))}>仅校验</Button><output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output></Form>
}
