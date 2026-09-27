import { createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
import { createForm } from 'upthrust-competence'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function Nested() {
  const [result, setResult] = createSignal('尚未提交')
  const innerForm = createForm()
  return <div class="max-w-xl">
    <Form onFinish={values => setResult(JSON.stringify(values))}>
      <FormItem name={['profile', 'name']} label="姓名"><Input /></FormItem>
      <FormItem name={['profile', 'contact', 'email']} label="邮箱"><Input /></FormItem>
      <FormItem label="内层表单"><Form form={innerForm} component="div" initialValues={{ note: '内层独立 store' }} onFinish={values => setResult(JSON.stringify(values))}><FormItem name="note" label="备注"><Input /></FormItem><Button onClick={() => void innerForm.submit()}>提交内层</Button></Form></FormItem>
      <Button htmlType="submit" variant="solid">提交外层</Button>
    </Form>
    <output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output>
  </div>
}
