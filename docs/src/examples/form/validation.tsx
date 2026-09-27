import { createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function Validation() {
  const [result, setResult] = createSignal('等待校验')
  return <div class="max-w-xl">
    <Form onFinish={() => setResult('校验通过')} onFinishFailed={info => setResult(info.errorFields.map(field => field.name.join('.')).join('、'))}>
      <FormItem name="email" label="邮箱" hasFeedback rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}>
        <Input placeholder="name@example.com" />
      </FormItem>
      <FormItem name="code" label="邀请码" validateDebounce={150} rules={[{ validator: async (_rule, value) => { if (value !== 'UPTHRUST') throw new Error('邀请码无效') } }]}>
        <Input placeholder="输入 UPTHRUST" />
      </FormItem>
      <FormItem name="alias" label="别名" hasFeedback rules={[{ min: 6, warningOnly: true, message: '建议至少 6 个字符，此提示不阻止提交' }]}>
        <Input placeholder="输入 1–5 个字符查看非阻断警告" />
      </FormItem>
      <Button htmlType="submit" variant="solid">校验并提交</Button>
    </Form>
    <output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output>
  </div>
}
