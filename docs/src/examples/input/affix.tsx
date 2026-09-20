import { createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
export default function Demo() {
  const [affix, setAffix] = createSignal(false)
  return <div class="space-y-3"><Input placeholder="动态前后缀" prefix={affix() ? '￥' : undefined} suffix={affix() ? '元' : undefined} defaultValue="100" allowClear={{ clearIcon: <span class="i-mdi-close" /> }} /><Button onClick={() => setAffix(!affix())}>切换前后缀</Button></div>
}
