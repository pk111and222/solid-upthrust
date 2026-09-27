import { createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
import Flex from 'upthrust-ui/source/Flex'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import { createForm } from 'upthrust-competence'

export default function Programmatic() {
  const [result, setResult] = createSignal('点击“读取值”查看当前表单')
  const form = createForm()
  return <Form form={form}>
    <FormItem name="name" label="名称"><Input placeholder="输入名称或使用回填" /></FormItem>
    <Flex gap={8} wrap="wrap">
      <Button onClick={() => form.setFieldValue('name', '命令式回填')}>回填</Button>
      <Button onClick={() => setResult(JSON.stringify(form.getFieldsValue(true)))}>读取值</Button>
      <Button onClick={() => form.resetFields()}>重置</Button>
    </Flex>
    <output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output>
  </Form>
}
