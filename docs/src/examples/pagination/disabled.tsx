import { createSignal } from 'solid-js'
import Pagination from 'upthrust-ui/source/Pagination'
import Button from 'upthrust-ui/source/Button'
export default function Disabled() {
  const [disabled, setDisabled] = createSignal(true)
  return <div class="space-y-4"><Button onClick={() => setDisabled(value => !value)}>切换禁用</Button>
    <Pagination total={100} disabled={disabled()} pageSizeOptions={[10, 20]} showQuickJumper />
  </div>
}
