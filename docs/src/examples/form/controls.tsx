import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Checkbox, { CheckboxGroup } from 'upthrust-ui/source/Checkbox'
import InputNumber from 'upthrust-ui/source/InputNumber'
import Radio, { RadioGroup } from 'upthrust-ui/source/Radio'
import Select from 'upthrust-ui/source/Select'
import Switch from 'upthrust-ui/source/Switch'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function Controls() {
  const [result, setResult] = createSignal('尚未提交')
  return <div class="max-w-xl"><Form initialValues={{ fruit: 'apple', agree: false, roles: ['user'], gender: 'other', enabled: true, count: 2 }} onFinish={v => setResult(JSON.stringify(v))}>
    <FormItem name="fruit" label="选择"><Select options={[{ label: '苹果', value: 'apple' }, { label: '香蕉', value: 'banana' }]} /></FormItem>
    <FormItem name="roles" label="复选"><CheckboxGroup options={[{ label: '管理员', value: 'admin' }, { label: '用户', value: 'user' }]} /></FormItem>
    <FormItem name="gender" label="单选"><RadioGroup options={[{ label: '先生', value: 'male' }, { label: '女士', value: 'female' }, { label: '其他', value: 'other' }]} /></FormItem>
    <FormItem name="agree" label="确认"><Checkbox>同意协议</Checkbox></FormItem>
    <FormItem name="enabled" label="开关"><Switch /></FormItem>
    <FormItem name="count" label="数量"><InputNumber min={0} max={10} /></FormItem>
    <Button htmlType="submit" variant="solid">提交控件值</Button>
  </Form><output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output></div>
}
