import { createSignal } from 'solid-js'
import Checkbox, { CheckboxGroup } from 'upthrust-ui/source/Checkbox'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import Button from 'upthrust-ui/source/Button'
import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import type { Store } from 'upthrust-competence'
export default function Context() {
 const [result,setResult] = createSignal('尚未提交')
 return <ConfigProvider componentDisabled>
  <Checkbox>全局禁用</Checkbox><Checkbox disabled={false}>显式启用</Checkbox>
  <Form disabled={false} initialValues={{ agree: true, tools: ['code'] }} onFinish={(values: Store) => setResult(JSON.stringify(values))}>
   <FormItem name="agree" label="协议"><Checkbox>接受条款</Checkbox></FormItem>
   <FormItem name="tools" label="工具"><CheckboxGroup options={[{label:'代码',value:'code'},{label:'设计',value:'design'}]} /></FormItem>
   <Button htmlType="submit">提交选项</Button>
  </Form>
  <output>{result()}</output>
 </ConfigProvider>
}
