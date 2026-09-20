import { createSignal } from 'solid-js'
import Pagination from 'upthrust-ui/source/Pagination'
export default function Controlled() {
  const [current, setCurrent] = createSignal(3)
  const [pageSize, setPageSize] = createSignal(10)
  return <><Pagination total={85} current={current()} pageSize={pageSize()} pageSizeOptions={[10, 20, 50]} onChange={(page, size) => { setCurrent(page); setPageSize(size) }} />
    <output>当前 {current()} 页，每页 {pageSize()} 条</output></>
}
