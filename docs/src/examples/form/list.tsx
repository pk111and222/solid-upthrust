import { For, createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
import Form, { FormItem, FormList } from 'upthrust-ui/source/Form'

export default function ListDemo() {
  const [result, setResult] = createSignal('尚未提交')
  return <div class="max-w-xl">
    <Form initialValues={{ users: [{ name: '甲' }] }} onFinish={values => setResult(JSON.stringify(values))}>
      <FormList name="users">
        {(fields, operations) => <>
          <For each={fields()} keyed>{field => <FormItem name={[field.name, 'name']} label={`第 ${field.name + 1} 行`} rules={[{ required: true, message: '请输入姓名' }]}><Input /></FormItem>}</For>
          <div class="mb-4 flex flex-wrap gap-2"><Button htmlType="button" onClick={() => operations.add({ name: '' })}>新增一行</Button><Button htmlType="button" onClick={() => operations.remove(fields().length - 1)} disabled={!fields().length}>删除末行</Button></div>
        </>}
      </FormList>
      <Button htmlType="submit" variant="solid">提交列表</Button>
    </Form>
    <output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output>
  </div>
}
