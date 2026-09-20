import { createSignal } from 'solid-js'
import Pagination from 'upthrust-ui/source/Pagination'
export default function PageSize() {
  const [event, setEvent] = createSignal('尚未切换')
  return <><Pagination total={85} defaultCurrent={8} defaultPageSize={10} pageSizeOptions={[10, 20, 50]} onShowSizeChange={(page, size) => setEvent(`${page}:${size}`)} />
    <output>{event()}</output></>
}
