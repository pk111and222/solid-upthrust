import Input from 'upthrust-ui/source/Input'
import Select from 'upthrust-ui/source/Select'
import Switch from 'upthrust-ui/source/Switch'
import Button from 'upthrust-ui/source/Button'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function Disabled() {
  return <Form disabled initialValues={{ name: '只读值', mode: 'a', enabled: true }}>
    <FormItem name="name" label="输入框"><Input /></FormItem>
    <FormItem name="mode" label="选择器"><Select options={[{ label: '选项 A', value: 'a' }, { label: '选项 B', value: 'b' }]} /></FormItem>
    <FormItem name="enabled" label="开关"><Switch /></FormItem>
    <Button htmlType="submit">禁用状态下提交</Button>
  </Form>
}
