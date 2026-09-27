import { For, createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
import Flex from 'upthrust-ui/source/Flex'
import Form, { FormItem, FormList } from 'upthrust-ui/source/Form'

export default function CustomList() {
  const [result, setResult] = createSignal('尚未提交')
  return <Form layout="vertical" initialValues={{ rows: [{ label: '颜色', value: '蓝色' }] }} onFinish={v => setResult(JSON.stringify(v))}>
    <FormList name="rows">{(fields, operations) => <>
      <div class="grid gap-3 mb-4"><For each={fields()} keyed>{field => <div class="flex flex-wrap items-start gap-3 rounded-lg border border-outline-variant p-3">
        <FormItem name={[field.name, 'label']} label="标签" class="!mb-0 min-w-0 w-full sm:w-auto sm:flex-1"><Input placeholder="例如：颜色" /></FormItem>
        <FormItem name={[field.name, 'value']} label="值" class="!mb-0 min-w-0 w-full sm:w-auto sm:flex-1"><Input placeholder="例如：蓝色" /></FormItem>
        <FormItem label={<span class="invisible" aria-hidden="true">操作</span>} class="!mb-0 shrink-0"><Button danger variant="text" onClick={() => operations.remove(field.name)}>删除</Button></FormItem>
      </div>}</For></div>
      <Flex gap={8} wrap="wrap"><Button variant="dashed" onClick={() => operations.add({ label: '', value: '' })}>新增键值行</Button><Button htmlType="submit" variant="solid">提交键值</Button></Flex>
    </>}</FormList>
    <output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output>
  </Form>
}
