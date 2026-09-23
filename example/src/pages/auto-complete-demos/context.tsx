import { createSignal } from 'solid-js'
import { AutoComplete } from 'upthrust-ui'
import { Form, FormItem } from 'upthrust-ui'
import { Button } from 'upthrust-ui'
import type { FormInstance, Store } from 'upthrust-competence'

export default function Context() {
  const [result, setResult] = createSignal('尚未提交')
  let form: FormInstance | undefined
  return <div class="flex flex-col gap-3 max-w-sm">
    <Form initialValues={{ city: '北京' }} ref={instance => { form = instance }} onFinish={(values: Store) => setResult(JSON.stringify(values))}>
      <FormItem name="city" label="目的地"><AutoComplete name="city" options={[{ value: 'beijing', label: '北京' }, { value: 'shanghai', label: '上海' }]} /></FormItem>
      <div class="flex gap-2"><Button htmlType="submit">提交目的地</Button><Button onClick={() => form?.resetFields()}>重置目的地</Button></div>
    </Form>
    <output>{result()}</output>
  </div>
}
