import { createSignal } from 'solid-js'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import Transfer from 'upthrust-ui/source/Transfer'

const members = [{ key: 'a', title: '甲' }, { key: 'b', title: '乙' }]

export default function FormDemo() {
  const [submitted, setSubmitted] = createSignal('尚未提交')
  return <div class="space-y-2">
    <Form initialValues={{ members: ['a'] }} onFinish={values => setSubmitted(JSON.stringify(values))}>
      <FormItem name="members" label="项目成员"
        rules={[{ type: 'array', required: true, min: 1, message: '请至少选择一位成员' }]}>
        <Transfer dataSource={members} />
      </FormItem>
      <div class="flex gap-2"><button type="submit">提交成员</button><button type="reset">重置成员</button></div>
    </Form>
    <output class="block">{submitted()}</output>
  </div>
}
