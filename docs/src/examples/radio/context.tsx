import { createSignal } from 'solid-js'
import Radio, { RadioGroup } from 'upthrust-ui/source/Radio'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import Button from 'upthrust-ui/source/Button'
import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import type { Store } from 'upthrust-competence'
export default function Context() {
 const [result,setResult] = createSignal('尚未提交')
 return <ConfigProvider componentDisabled>
  <Radio>全局禁用</Radio><Radio disabled={false}>显式启用</Radio>
  <Form disabled={false} initialValues={{ channel:'mail', city:'bj' }} onFinish={(values:Store) => setResult(JSON.stringify(values))}>
   <FormItem name="channel" label="通知渠道"><RadioGroup options={[{label:'邮件',value:'mail'},{label:'短信',value:'sms'}]}/></FormItem>
   <FormItem name="city" label="城市"><RadioGroup optionType="button" options={[{label:'北京',value:'bj'},{label:'上海',value:'sh'}]}/></FormItem>
   <Button htmlType="submit">提交单选</Button>
  </Form>
  <output>{result()}</output>
 </ConfigProvider>
}
