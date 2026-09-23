import Transfer from 'upthrust-ui/source/Transfer'

const members = [{ key: 'a', title: '甲' }]

export default function Variants() {
  return <div class="space-y-4">
    <Transfer dataSource={[]} showSelectAll={false} notFoundContent="暂无可分配成员"
      status="warning" listStyle={{ height: '135px' }} />
    <Transfer dataSource={members} disabled status="error" listStyle={{ height: '135px' }} />
  </div>
}
