import Skeleton from 'upthrust-ui/source/Skeleton'
import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import type { SkeletonIns } from 'upthrust-ui/source/Skeleton'

export default function Demo() {
  const [loading, setLoading] = createSignal(true)
  let instance: SkeletonIns | undefined
  const [status, setStatus] = createSignal('未读取')
  return <div class="space-y-5">
    <div class="flex flex-wrap gap-3">
      <Button onClick={() => setLoading(!loading())}>切换加载</Button>
      <Button onClick={() => setStatus(instance?.loading() ? '加载中' : '已完成')}>读取实例</Button>
      <output>{status()}</output>
    </div>
    <section aria-label="文章" aria-busy={loading() ? 'true' : 'false'}>
      <Skeleton loading={loading()} active avatar ref={value => instance = value}>
        <article><h3 class="font-medium">内容已就绪</h3><p>这里展示实际业务内容。</p></article>
      </Skeleton>
    </section>
  </div>
}
