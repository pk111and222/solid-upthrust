import { For } from 'solid-js'
import { createPagination } from 'upthrust-competence'
import Pagination from 'upthrust-ui/source/Pagination'
const rows = Array.from({ length: 23 }, (_, i) => `记录 ${i + 1}`)
export default function Slice() {
  const pager = createPagination({ total: rows.length, defaultPageSize: 5 })
  return <><ul><For each={pager.slice(rows)}>{row => <li>{row}</li>}</For></ul>
    <Pagination total={rows.length} current={pager.current()} pageSize={pager.pageSize()} onChange={page => pager.goTo(page)} />
  </>
}
