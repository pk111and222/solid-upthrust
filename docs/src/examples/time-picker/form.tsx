import { createSignal } from 'solid-js'
import TimePicker from 'upthrust-ui/source/TimePicker'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function TimeForm() {
  const [submitted, setSubmitted] = createSignal('尚未提交')
  return <div class="max-w-md flex flex-col gap-3">
    <Form initialValues={{ reminder: '09:30', shift: ['09:00', '18:00'] }} onFinish={values => setSubmitted(JSON.stringify(values))}>
      <FormItem name="reminder" label="提醒时间">{() => <TimePicker />}</FormItem>
      <FormItem name="shift" label="工作时段">{() => <TimePicker.RangePicker />}</FormItem>
      <div class="flex gap-2"><button type="submit">提交时间</button><button type="reset">重置时间</button></div>
    </Form>
    <output>{submitted()}</output>
  </div>
}
