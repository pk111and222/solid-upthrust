import { createSignal } from 'solid-js'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import TreeSelect from 'upthrust-ui/source/TreeSelect'

const treeData = [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]

export default function FormDemo() {
  const [submitted, setSubmitted] = createSignal('尚未提交')
  return <div class="max-w-sm">
    <Form initialValues={{ place: 'a' }} onFinish={values => setSubmitted(JSON.stringify(values))}>
      <FormItem name="place" label="地点"><TreeSelect treeData={treeData} virtual={false} /></FormItem>
      <div class="flex gap-2"><button type="submit">提交地点</button><button type="reset">重置地点</button></div>
    </Form>
    <output>{submitted()}</output>
  </div>
}
