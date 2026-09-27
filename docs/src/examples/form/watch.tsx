import { createForm } from 'upthrust-competence'
import InputNumber from 'upthrust-ui/source/InputNumber'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function Watch() {
  const form = createForm({ initialValues: { price: 12, quantity: 3 } })
  const total = form.watch(values => Number(values.price ?? 0) * Number(values.quantity ?? 0))
  return <Form form={form}><FormItem name="price" label="单价"><InputNumber min={0} /></FormItem><FormItem name="quantity" label="数量"><InputNumber min={0} /></FormItem><p>总价：{total()}</p></Form>
}
