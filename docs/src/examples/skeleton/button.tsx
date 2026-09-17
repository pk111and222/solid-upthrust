import Skeleton, { SkeletonButton } from 'upthrust-ui/source/Skeleton'

export default function Demo() {
  return <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-4">
      <Skeleton.Button size="small" />
      <Skeleton.Button size="middle" shape="round" active />
      <Skeleton.Button size="large" shape="circle" />
    </div>
    <SkeletonButton block active />
  </div>
}
