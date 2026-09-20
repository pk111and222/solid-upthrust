import Pagination from 'upthrust-ui/source/Pagination'
export default function Basic() {
  return <Pagination total={500} defaultCurrent={25} showTotal={(total, range) => `${range[0]}-${range[1]} / ${total}`} />
}
