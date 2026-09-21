import { createSignal } from 'solid-js'
import Segmented from 'upthrust-ui/source/Segmented'
import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import Button from 'upthrust-ui/source/Button'
import type { Store, FormInstance } from 'upthrust-competence'
export default function Context() {
 const [result,setResult]=createSignal('尚未提交'); let form: FormInstance | undefined
 return <ConfigProvider componentDisabled><div class="px-3 flex flex-col gap-3"><Segmented aria-label="全局禁用" options={['禁用']} defaultValue="禁用"/><Form ref={instance => { form = instance }} disabled={false} initialValues={{mode:'a'}} onFinish={(values:Store)=>setResult(JSON.stringify(values))}><FormItem name="mode" label="模式"><Segmented aria-label="表单模式" options={[{label:'模式 A',value:'a'},{label:'模式 B',value:'b'}]}/></FormItem><Button htmlType="submit">提交分段值</Button><Button onClick={() => { form?.resetFields(); setResult('尚未提交') }}>重置分段值</Button></Form><output>{result()}</output></div></ConfigProvider>
}
