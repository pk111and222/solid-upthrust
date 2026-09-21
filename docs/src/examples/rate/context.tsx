import { createSignal } from 'solid-js'
import Rate from 'upthrust-ui/source/Rate'
import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import Button from 'upthrust-ui/source/Button'
import type { FormInstance, Store } from 'upthrust-competence'
export default function Context() {
 const [result,setResult]=createSignal('尚未提交');let form:FormInstance|undefined
 return <ConfigProvider componentDisabled><div class="px-3 flex flex-col gap-3"><Rate aria-label="全局禁用" defaultValue={3}/><Form disabled={false} initialValues={{rating:2}} ref={instance=>{form=instance}} onFinish={(values:Store)=>setResult(JSON.stringify(values))}><FormItem name="rating" label="满意度"><Rate aria-label="表单评分" allowHalf/></FormItem><div class="flex gap-2"><Button type="primary" htmlType="submit">提交评分</Button><Button onClick={()=>{form?.resetFields();setResult('尚未提交')}}>重置评分</Button></div></Form><output>{result()}</output></div></ConfigProvider>
}
