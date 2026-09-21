import { createSignal } from 'solid-js'
import InputNumber from 'upthrust-ui/source/InputNumber'
import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import Button from 'upthrust-ui/source/Button'
import type { FormInstance, Store } from 'upthrust-competence'
export default function Context() {
 const [result,setResult]=createSignal('尚未提交')
 let form:FormInstance|undefined
 return <ConfigProvider componentDisabled componentSize="small">
  <div class="flex flex-col gap-4">
   <div class="flex items-center gap-3"><label for="number-context-1">全局禁用</label><InputNumber id="number-context-1" defaultValue={1}/></div>
   <div class="flex items-center gap-3"><label for="number-context-2">显式启用</label><InputNumber id="number-context-2" disabled={false} size="large" defaultValue={2}/></div>
   <Form disabled={false} initialValues={{quantity:2}} ref={instance=>{form=instance}} onFinish={(values:Store)=>setResult(JSON.stringify(values))}>
    <FormItem name="quantity" label="订单数量"><InputNumber min={0} max={10}/></FormItem>
    <div class="flex gap-3"><Button htmlType="submit">提交数量</Button><Button onClick={()=>{form?.resetFields();setResult('尚未提交')}}>重置数量</Button></div>
   </Form>
   <output>{result()}</output>
  </div>
 </ConfigProvider>
}
