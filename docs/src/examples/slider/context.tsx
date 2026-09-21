import { createSignal } from 'solid-js'
import Slider from 'upthrust-ui/source/Slider'
import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import Button from 'upthrust-ui/source/Button'
import type { FormInstance, Store } from 'upthrust-competence'
export default function Context() {
 const [result,setResult]=createSignal('尚未提交')
 let form:FormInstance|undefined
 return <ConfigProvider componentDisabled><div class="px-3 flex flex-col gap-3">
  <p>全局禁用</p><Slider aria-label="全局禁用" defaultValue={30}/>
  <p>显式启用</p><Slider aria-label="显式启用" disabled={false} defaultValue={40}/>
  <Form disabled={false} initialValues={{volume:20,budget:[20,60]}} ref={instance=>{form=instance}} onFinish={(values:Store)=>setResult(JSON.stringify(values))}>
   <FormItem name="volume" label="音量"><Slider aria-label="表单音量"/></FormItem>
   <FormItem name="budget" label="预算"><Slider aria-label="表单预算"/></FormItem>
   <div class="flex gap-2"><Button htmlType="submit">提交滑块</Button><Button onClick={()=>{form?.resetFields();setResult('尚未提交')}}>重置滑块</Button></div>
  </Form><output>{result()}</output>
 </div></ConfigProvider>
}
