import Skeleton, { SkeletonInput } from 'upthrust-ui/source/Skeleton'

export default function Demo() {
  return <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-4">
      <Skeleton.Input size="small" />
      <Skeleton.Input size="large" active />
    </div>
    <SkeletonInput block size="middle" active />
  </div>
}
