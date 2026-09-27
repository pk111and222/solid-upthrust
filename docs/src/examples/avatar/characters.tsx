import { createSignal } from 'solid-js'
import Avatar from 'upthrust-ui/source/Avatar'
import Button from 'upthrust-ui/source/Button'
export default function Characters() {
  const [name, setName] = createSignal('UPTHRUST')
  return <div class="flex items-center gap-4"><Avatar color="#f56a00" textColor="white" maxCount={2}>{name()}</Avatar><Avatar size={64} maxCount={4} style={{ 'font-size': '16px' }}>{name()}</Avatar><Button onClick={() => setName(name() === 'UPTHRUST' ? '张小明' : 'UPTHRUST')}>切换姓名</Button></div>
}
