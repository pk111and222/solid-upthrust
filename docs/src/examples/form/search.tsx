import { createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import Select from 'upthrust-ui/source/Select'
import Button from 'upthrust-ui/source/Button'
import Flex from 'upthrust-ui/source/Flex'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function Search() {
  const [result, setResult] = createSignal('填写条件后查询')
  return <div>
    <Form layout="inline" initialValues={{ status: 'all' }} onFinish={v => setResult(JSON.stringify(v))}>
      <FormItem name="keyword" label="关键词" class="w-full sm:w-60"><Input placeholder="名称或编号" allowClear /></FormItem>
      <FormItem name="status" label="状态" class="w-full sm:w-48"><Select options={[{ label: '全部', value: 'all' }, { label: '启用', value: 'enabled' }]} /></FormItem>
      <Flex gap={8} wrap="wrap"><Button htmlType="submit" variant="solid">查询</Button><Button htmlType="reset">重置</Button></Flex>
    </Form>
    <output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output>
  </div>
}
