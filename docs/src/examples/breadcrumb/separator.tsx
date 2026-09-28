import Breadcrumb from 'upthrust-ui/source/Breadcrumb'

export default function Separator() {
  return (
    <div class="flex flex-col gap-3">
      <Breadcrumb separator=">" items={[{ title: '首页' }, { title: '应用中心', href: '#separator' }, { title: '应用列表', href: '#separator-list' }, { title: '某应用' }]} />
      <output class="text-[12px] text-on-surface/45">separator=&quot;&gt;&quot;，分隔符左右间距各 8px。</output>
    </div>
  )
}
