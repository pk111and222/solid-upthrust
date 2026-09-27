import { createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function Messages() {
  const [result, setResult] = createSignal('等待提交')
  return <Form validateMessages={{ required: '${label} 是必填项' }} onFinish={() => setResult('通过')} onFinishFailed={() => setResult('使用了自定义文案')}><FormItem name="title" label="标题" messageVariables={{ label: '标题' }} rules={[{ required: true }]}><Input /></FormItem><Button htmlType="submit">提交</Button><output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output></Form>
}
