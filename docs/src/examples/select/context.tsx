import { createSignal } from 'solid-js'
import Select from 'upthrust-ui/source/Select'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import Button from 'upthrust-ui/source/Button'
import type { FormInstance, Store } from 'upthrust-competence'

export default function Context() {
  const [result, setResult] = createSignal('尚未提交')
  let form: FormInstance | undefined
  return <div class="px-3 flex flex-col gap-3">
    <Form initialValues={{ fruit: 'apple' }} ref={instance => { form = instance }} onFinish={(values: Store) => setResult(JSON.stringify(values))}>
      <FormItem name="fruit" label="水果"><Select options={[{ label: '苹果', value: 'apple' }, { label: '香蕉', value: 'banana' }]} /></FormItem>
      <div class="flex gap-2"><Button type="primary" htmlType="submit">提交选择</Button><Button onClick={() => { form?.resetFields(); setResult('尚未提交') }}>重置选择</Button></div>
    </Form>
    <output>{result()}</output>
  </div>
}
