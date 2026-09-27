import { createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function Normalize() {
  const [result, setResult] = createSignal('尚未提交')
  return <Form onFinish={v => setResult(JSON.stringify(v))}><FormItem name="code" label="代码" normalize={value => String(value ?? '').trim().toUpperCase()}><Input placeholder="输入会 trim + upper-case" /></FormItem><Button htmlType="submit">提交规范化值</Button><output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output></Form>
}
