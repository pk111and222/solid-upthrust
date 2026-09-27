import { For, createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Input from 'upthrust-ui/source/Input'
import Form, { FormItem, FormList } from 'upthrust-ui/source/Form'

export default function ListMove() {
  const [result, setResult] = createSignal('')
  return <Form initialValues={{ items: [{ value: '甲' }, { value: '乙' }] }} onFinish={v => setResult(JSON.stringify(v))}><FormList name="items">{(fields, operations) => <><For each={fields()} keyed>{field => <FormItem name={[field.name, 'value']} label={`第 ${field.name + 1} 行`}><Input /></FormItem>}</For><div class="mb-4 flex flex-wrap gap-2"><Button htmlType="button" onClick={() => operations.move(0, 1)}>下移首行</Button></div></>}</FormList><Button htmlType="submit">提交排序</Button><output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output></Form>
}
