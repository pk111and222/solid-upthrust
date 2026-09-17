import Tabs from 'upthrust-ui/source/Tabs'

export default function Demo() {
  return <Tabs items={[
    { key: '1', label: '首页', icon: 'i-mdi-home', children: <div class="pt-4 text-on-surface-variant">首页内容</div> },
    { key: '2', label: '设置', icon: 'i-mdi-cog', children: <div class="pt-4 text-on-surface-variant">设置内容</div> },
    { key: '3', label: '用户', icon: 'i-mdi-account', children: <div class="pt-4 text-on-surface-variant">用户内容</div> },
  ]} />
}
