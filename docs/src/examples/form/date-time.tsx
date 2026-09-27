import { createSignal } from 'solid-js'
import DatePicker from 'upthrust-ui/source/DatePicker'
import TimePicker from 'upthrust-ui/source/TimePicker'
import Button from 'upthrust-ui/source/Button'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function DateTime() {
  const [result, setResult] = createSignal('')
  return <Form initialValues={{ date: '2026-09-24', time: '09:30' }} onFinish={v => setResult(JSON.stringify(v))}><FormItem name="date" label="日期"><DatePicker /></FormItem><FormItem name="time" label="时间"><TimePicker /></FormItem><Button htmlType="submit">提交日期时间</Button><output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output></Form>
}
