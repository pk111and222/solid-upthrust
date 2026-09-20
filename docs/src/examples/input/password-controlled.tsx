import { createSignal } from 'solid-js'
import { InputPassword as Password } from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
export default function Demo() {
  const [visible, setVisible] = createSignal(false)
  return <div class="space-y-3"><Password defaultValue="controlled" visible={visible()} onVisibleChange={setVisible} /><Button onClick={() => setVisible(!visible())}>外部切换可见性</Button><output>可见：{String(visible())}</output></div>
}
