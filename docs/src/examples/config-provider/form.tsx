import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import Input from 'upthrust-ui/source/Input'
export default function FormPriority() {
  return <ConfigProvider componentSize="large" componentDisabled>
    <Form size="middle" disabled={false}>
      <FormItem label="项目名称"><Input placeholder="Form 默认值优先" /></FormItem>
      <FormItem label="只读区域"><Input disabled placeholder="显式属性优先" /></FormItem>
    </Form>
  </ConfigProvider>
}
