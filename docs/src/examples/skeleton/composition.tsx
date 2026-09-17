import Skeleton from 'upthrust-ui/source/Skeleton'

export default function Demo() {
  return <div class="space-y-6">
    <Skeleton title={false} paragraph={{ rows: 2 }} />
    <Skeleton paragraph={false} title={{ width: '60%' }} />
    <Skeleton title={false} paragraph={false} avatar />
  </div>
}
