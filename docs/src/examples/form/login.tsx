import { createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function Login() {
  const [result, setResult] = createSignal('')
  return <Form layout="vertical" onFinish={v => setResult(`登录：${JSON.stringify(v)}`)}><FormItem name="user" label="用户名" rules={[{ required: true }]}><Input /></FormItem><FormItem name="password" label="密码" rules={[{ required: true }]}><Input type="password" /></FormItem><Button htmlType="submit" variant="solid" block>登录</Button><output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output></Form>
}
