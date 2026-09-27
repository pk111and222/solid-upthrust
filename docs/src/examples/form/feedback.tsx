import Input from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
import Form, { FormItem } from 'upthrust-ui/source/Form'

export default function Feedback() {
  return <Form initialValues={{ success: '已验证' }} labelWidth="80px"><FormItem name="error" label="错误" hasFeedback help="服务端返回的错误也可以放在 help 中" validateStatus="error"><Input allowClear showCount maxLength={30} placeholder="输入文字，观察清除、计数与反馈图标" /></FormItem>
    <FormItem name="warning" label="警告" hasFeedback validateStatus="warning" extra="这是持久化提示"><Input placeholder="警告状态" /></FormItem>
    <FormItem name="success" label="成功" hasFeedback validateStatus="success"><Input defaultValue="已验证" /></FormItem>
    <FormItem name="validating" label="校验中" hasFeedback validateStatus="validating"><Input placeholder="正在校验" /></FormItem>
    <FormItem name="normal" label="说明" tooltip="字段提示"><Input /></FormItem><Button>普通按钮</Button>
  </Form>
}
