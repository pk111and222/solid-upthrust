import Timeline from 'upthrust-ui/source/Timeline'

export default function Custom() {
  return <Timeline
    items={[
      { content: 'Create a services site 2015-09-01' },
      { content: 'Solve initial network problems 2015-09-01' },
      {
        // 图标字号大于圆点时补背景色遮住穿过的导轨；底色放外层，mask 图标本身不能加 bg（会覆盖 currentColor 变成隐形）。
        icon: <span class="inline-flex rounded-full bg-surface"><span class="i-mdi-clock-outline inline-block text-[20px]" /></span>,
        color: 'red',
        content: 'Technical testing 2015-09-01',
      },
      { content: 'Network problems being solved 2015-09-01' },
    ]}
  />
}
