import Input from 'upthrust-ui/source/Input'
export default function Demo() {
  return <div class="space-y-3"><Input size="small" placeholder="小号" /><Input size="middle" placeholder="中号" /><Input size="large" placeholder="大号" prefix="前" /><Input status="error" defaultValue="错误状态" /><Input status="warning" defaultValue="警告状态" showCount /><Input disabled defaultValue="禁用" allowClear /><Input readonly defaultValue="只读" allowClear /></div>
}
