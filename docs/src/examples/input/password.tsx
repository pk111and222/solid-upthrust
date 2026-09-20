import { InputPassword as Password } from 'upthrust-ui/source/Input'
export default function Demo() {
  return <div class="space-y-3"><Password placeholder="点击显示密码" defaultValue="secret" allowClear /><Password placeholder="悬停显示密码" action="hover" defaultValue="hover" /><Password placeholder="关闭切换按钮" visibilityToggle={false} /><Password placeholder="禁用密码" disabled defaultValue="disabled" /></div>
}
