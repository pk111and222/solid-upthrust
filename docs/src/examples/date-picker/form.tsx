import { createSignal } from 'solid-js'
import DatePicker from 'upthrust-ui/source/DatePicker'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function FormDemo() {
  const [submitted, setSubmitted] = createSignal('尚未提交')
  return <div class="max-w-md flex flex-col gap-3">
    <Form initialValues={{ date: '2026-09-15', range: ['2026-09-10', '2026-09-20'] }} onFinish={values => setSubmitted(JSON.stringify(values))}>
      <FormItem name="date" label="预约日期">{() => <DatePicker />}</FormItem>
      <FormItem name="range" label="有效期限">{() => <DatePicker.RangePicker />}</FormItem>
      <div class="flex gap-2"><button type="submit">提交日期</button><button type="reset">重置日期</button></div>
    </Form>
    <output>{submitted()}</output>
  </div>
}
