import Breadcrumb from 'upthrust-ui/source/Breadcrumb'

export default function SeparatorComponent() {
  return (
    <div class="flex flex-col gap-3">
      {/* separator="" 关闭自动分隔，改由 type: 'separator' 项逐个指定。 */}
      <Breadcrumb
        separator=""
        items={[
          { title: '位置' },
          { type: 'separator', separator: ':' },
          { href: '#separator-component', title: '应用中心' },
          { type: 'separator' },
          { href: '#separator-component-list', title: '应用列表' },
          { type: 'separator' },
          { title: '某应用' },
        ]}
      />
      <output class="text-[12px] text-on-surface/45">type: 'separator' 的项只渲染分隔符，默认 '/'。</output>
    </div>
  )
}
