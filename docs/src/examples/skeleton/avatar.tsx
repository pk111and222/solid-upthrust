import Skeleton from 'upthrust-ui/source/Skeleton'

export default function Demo() {
  return <div class="space-y-6">
    <Skeleton avatar paragraph={{ rows: 2 }} />
    <Skeleton avatar={{ size: '3rem', shape: 'square' }}
      title={{ width: '60%' }} paragraph={{ rows: 2 }} />
  </div>
}
