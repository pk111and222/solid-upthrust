import { createSignal } from 'solid-js'
import Pagination from 'upthrust-ui/source/Pagination'
export default function Jumper() {
  const [submits, setSubmits] = createSignal(0)
  return <form onSubmit={event => { event.preventDefault(); setSubmits(n => n + 1) }}>
    <Pagination total={500} showQuickJumper pageSizeOptions={[10, 20]} />
    <output>提交次数：{submits()}</output>
  </form>
}
