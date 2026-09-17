import Skeleton, { SkeletonNode } from 'upthrust-ui/source/Skeleton'
import Icon from 'upthrust-ui/source/Icon'

export default function Demo() {
  return <div class="flex flex-wrap items-center gap-4">
    <Skeleton.Node active><Icon name="image-outline" size={40} /></Skeleton.Node>
    <Skeleton.Node size="middle" />
    <SkeletonNode size={64}><Icon name="chart-box-outline" size={32} /></SkeletonNode>
  </div>
}
