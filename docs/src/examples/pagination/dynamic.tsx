import { createSignal } from 'solid-js'
import Pagination from 'upthrust-ui/source/Pagination'
import Button from 'upthrust-ui/source/Button'
export default function Dynamic() {
  const [total, setTotal] = createSignal(85)
  return <div class="space-y-4"><Button onClick={() => setTotal(value => value === 85 ? 5 : 85)}>切换总数</Button>
    <Pagination total={total()} defaultCurrent={8} showTotal={(n, r) => `${r[0]}-${r[1]} / ${n}`} />
    <Pagination total={total()} hideOnSinglePage />
  </div>
}
