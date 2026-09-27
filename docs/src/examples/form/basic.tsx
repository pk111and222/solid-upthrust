import { createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function Basic() {
  const [result, setResult] = createSignal('尚未提交')
  return <div class="max-w-xl">
    <Form initialValues={{ nickname: '水滴' }} onFinish={values => setResult(JSON.stringify(values))}>
      <FormItem name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
        <Input placeholder="请输入用户名" allowClear />
      </FormItem>
      <FormItem name="nickname" label="昵称"><Input /></FormItem>
      <div class="flex flex-wrap gap-2"><Button htmlType="submit" variant="solid">提交</Button><Button htmlType="reset">重置</Button></div>
    </Form>
    <output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output>
  </div>
}
