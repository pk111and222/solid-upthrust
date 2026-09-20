import Pagination from 'upthrust-ui/source/Pagination'
export default function Appearance() {
  return <div class="space-y-4">
    <Pagination total={50} align="start" />
    <Pagination total={50} size="small" align="center" />
    <Pagination total={50} align="end" class="custom-pagination" style={{ padding: '4px' }} />
  </div>
}
