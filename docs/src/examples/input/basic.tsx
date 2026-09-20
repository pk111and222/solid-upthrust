import Input from 'upthrust-ui/source/Input'
export default function Demo() {
  return <div class="space-y-3"><label for="input-name">姓名</label><Input id="input-name" name="name" placeholder="请输入姓名" defaultValue="Solid" /><Input type="email" placeholder="邮箱" /></div>
}
