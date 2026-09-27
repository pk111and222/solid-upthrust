import { Show } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import Select from 'upthrust-ui/source/Select'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import { createForm } from 'upthrust-competence'

export default function Conditional() {
  const form = createForm({ initialValues: { kind: 'person' } })
  const kind = form.watch('kind')
  return <Form form={form}><FormItem name="kind" label="类型"><Select options={[{ label: '个人', value: 'person' }, { label: '企业', value: 'company' }]} /></FormItem><Show when={kind() === 'person'}><FormItem name="name" label="姓名"><Input /></FormItem></Show><Show when={kind() === 'company'}><FormItem name="company" label="公司名称"><Input /></FormItem></Show><FormItem name="remark" label="备注"><Input /></FormItem></Form>
}
