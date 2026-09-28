import { createSignal } from 'solid-js'
import Breadcrumb from 'upthrust-ui/source/Breadcrumb'

export default function Basic() {
  const [last, setLast] = createSignal('—')
  return (
    <div class="flex flex-col gap-3">
      <Breadcrumb
        items={[
          { title: '首页' },
          // 无 href 的项渲染为 span，onClick 仍然生效。
          { title: '应用中心', onClick: () => setLast('应用中心') },
          { title: '应用列表', href: '#basic-list', onClick: (e: MouseEvent) => { e.preventDefault(); setLast('应用列表') } },
          { title: '某应用' },
        ]}
      />
      <output class="text-[12px] text-on-surface/45">最近点击：{last()}</output>
    </div>
  )
}
