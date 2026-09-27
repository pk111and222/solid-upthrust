import Space from 'upthrust-ui/source/Space'

const Card = (props: { title: string }) => (
  <div class="w-[300px] max-w-full rounded-lg border border-solid border-outline-variant p-md bg-surface">
    <div class="mb-xs font-medium">{props.title}</div>
    <div class="text-on-surface-variant">纵向排列时子项默认 stretch，宽度由自身决定。</div>
  </div>
)

export default function Vertical() {
  return <Space orientation="vertical" size="middle" data-space-vertical>
    <Card title="卡片 1" />
    <Card title="卡片 2" />
    <Card title="卡片 3" />
  </Space>
}
