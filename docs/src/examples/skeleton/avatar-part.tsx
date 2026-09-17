import Skeleton, { SkeletonAvatar } from 'upthrust-ui/source/Skeleton'

export default function Demo() {
  return <div class="flex flex-wrap items-center gap-4">
    <Skeleton.Avatar size="small" />
    <Skeleton.Avatar size="middle" shape="square" />
    <Skeleton.Avatar size="large" active />
    <SkeletonAvatar size={56} shape="square" active />
  </div>
}
