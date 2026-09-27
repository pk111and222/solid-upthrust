import { For, createSignal } from 'solid-js'
import Layout, { type SiderTheme } from 'upthrust-ui/source/Layout'
import Segmented from 'upthrust-ui/source/Segmented'

const { Sider, Content } = Layout

const nav = ['概览', '项目', '成员', '设置']

export default function Theme() {
  const [theme, setTheme] = createSignal<SiderTheme>('dark')
  return <div class="flex flex-col gap-md" data-layout-theme>
    <Segmented aria-label="Sider 主题"
      options={[{ label: '深色 dark', value: 'dark' }, { label: '浅色 light', value: 'light' }]}
      value={theme()} onChange={value => setTheme(value as SiderTheme)}
    />
    <Layout class="min-h-[240px] rounded-lg overflow-hidden border border-solid border-outline-variant">
      <Sider theme={theme()} collapsible class={theme() === 'light' ? 'border-r border-solid border-outline-variant' : ''}>
        <ul class="m-0 p-xs list-none">
          <For each={nav}>{item => <li class="h-[40px] px-md flex items-center rounded whitespace-nowrap overflow-hidden">{item}</li>}</For>
        </ul>
      </Sider>
      <Content class="p-lg">theme 控制 Sider 与触发器的配色；浅色时通常再加一条右边框与内容区分隔。</Content>
    </Layout>
  </div>
}
