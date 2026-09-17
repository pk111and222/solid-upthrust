import Button from 'upthrust-ui/source/Button'
import Icon from 'upthrust-ui/source/Icon'
import { createSignal } from 'solid-js'

export default function Demo() {
  const [busy,setBusy]=createSignal(false)
  return <div class="flex flex-wrap gap-3"><Button loading={busy()} icon={<Icon name="download" />} onClick={() => setBusy(true)}>保存</Button><Button onClick={() => setBusy(false)}>完成请求</Button><Button loading>加载中</Button></div>
}
