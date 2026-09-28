import Breadcrumb from 'upthrust-ui/source/Breadcrumb'

export default function WithIcon() {
  return (
    <div class="flex flex-col gap-3">
      <Breadcrumb
        items={[
          { href: '#with-icon', title: <span aria-label="首页" class="i-mdi-home-outline" /> },
          { href: '#with-icon-user', title: <><span class="i-mdi-account-outline" /><span>用户列表</span></> },
          { title: '应用' },
        ]}
      />
      <output class="text-[12px] text-on-surface/45">图标与文字间距 4px，链接 hover 显示浅灰背景。</output>
    </div>
  )
}
