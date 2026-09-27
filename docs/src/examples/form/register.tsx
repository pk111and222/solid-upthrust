import { createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import { createForm } from 'upthrust-competence'

export default function Register() {
  const [result, setResult] = createSignal('')
  const form = createForm()
  return <Form form={form} onFinish={() => setResult('注册成功')}><FormItem name="email" label="邮箱" rules={[{ type: 'email', required: true }]}><Input /></FormItem><FormItem name="password" label="密码" rules={[{ min: 8, required: true }]}><Input type="password" /></FormItem><FormItem name="confirm" label="确认密码" dependencies={['password']} rules={[{ required: true, message: '请再次输入密码' }, { validator: (_rule, value, callback) => { if (value !== form.getFieldValue('password')) callback('两次输入的密码不一致'); else callback() } }]}><Input type="password" /></FormItem><Button htmlType="submit">注册</Button><output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output></Form>
}
