import { createSignal } from 'solid-js'
import Mentions from 'upthrust-ui/source/Mentions'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import Button from 'upthrust-ui/source/Button'
import type { FormInstance, Store } from 'upthrust-competence'

export default function FormExample() {
  const [result, setResult] = createSignal('尚未提交')
  let form: FormInstance | undefined
  return <div class="flex flex-col gap-3 max-w-sm">
    <Form initialValues={{ message: '你好' }} ref={instance => { form = instance }}
      onFinish={(values: Store) => setResult(JSON.stringify(values))}>
      <FormItem name="message" label="消息">
        <Mentions options={[{ value: 'alice' }, { value: 'bob' }]} />
      </FormItem>
      <div class="flex gap-2"><Button htmlType="submit">提交消息</Button><Button onClick={() => form?.resetFields()}>重置消息</Button></div>
    </Form>
    <Mentions aria-label="禁用提及" disabled placeholder="禁用状态" />
    <output>{result()}</output>
  </div>
}
