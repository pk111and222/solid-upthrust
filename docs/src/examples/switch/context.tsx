import { createSignal } from 'solid-js'
import Switch from 'upthrust-ui/source/Switch'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Button from 'upthrust-ui/source/Button'
import type { Store } from 'upthrust-competence'
export default function Context() {
 const [result,setResult]=createSignal('尚未提交')
 return <ConfigProvider componentDisabled componentSize="small">
  <label for="switch-global">全局禁用</label><Switch id="switch-global"/><label for="switch-explicit">显式启用</label><Switch id="switch-explicit" disabled={false} size="middle"/>
  <Form disabled={false} initialValues={{enabled:false}} onFinish={(values:Store)=>setResult(JSON.stringify(values))}>
   <FormItem name="enabled" label="接收通知"><Switch/></FormItem>
   <Button htmlType="submit">提交开关</Button>
  </Form>
  <output>{result()}</output>
 </ConfigProvider>
}
