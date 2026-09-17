import { createSignal, For, Show } from 'solid-js'
import { Tag, CheckableTag, Divider, Button, Space } from 'upthrust-ui'

export default function TagPage() {
  const [topics, setTopics] = createSignal(['设计'])
  const [message, setMessage] = createSignal('')
  const [mounted, setMounted] = createSignal(true)
  return <div class="p-6 max-w-3xl">
    <h2 class="text-2xl font-bold mb-4">Tag 标签</h2>
    <p class="text-on-surface-variant mb-6">标记内容状态、组织分类，也可用于轻量筛选。</p>
    <h3 class="text-lg font-semibold mb-3">基础与状态色</h3>
    <Space wrap>
      <Tag>默认标签</Tag><Tag color="success">已完成</Tag><Tag color="processing">处理中</Tag>
      <Tag color="warning">待确认</Tag><Tag color="error">失败</Tag><Tag color="#722ed1">自定义颜色</Tag>
    </Space>
    <Divider />
    <h3 class="text-lg font-semibold mb-3">图标与无边框</h3>
    <Space wrap>
      <Tag color="success" icon={<span class="i-mdi-check-circle-outline" />}>审核通过</Tag>
      <Tag color="processing" icon={<span class="i-mdi-loading animate-spin" />}>同步中</Tag>
      <Tag color="warning" bordered={false}>待处理</Tag><Tag bordered={false}>无边框</Tag>
    </Space>
    <Divider />
    <h3 class="text-lg font-semibold mb-3">关闭与取消关闭</h3>
    <Space wrap>
      <Show when={mounted()}><Tag closable closeLabel="关闭临时标签" onClose={() => setMessage('临时标签已关闭')}>临时标签</Tag></Show>
      <Tag closable onClose={event => { event.preventDefault(); setMessage('已取消关闭，标签保留') }}>阻止关闭</Tag>
      <Tag closable disabled>禁用标签</Tag>
      <Tag closable closeIcon={<span class="i-mdi-delete-outline" />} closeLabel="删除标签">自定义关闭图标</Tag>
      <Button size="small" onClick={() => { setMounted(false); queueMicrotask(() => setMounted(true)) }}>重置临时标签</Button>
    </Space>
    <p class="text-sm text-on-surface-variant" role="status">{message()}</p>
    <Divider />
    <h3 class="text-lg font-semibold mb-3">可选中标签（受控与非受控）</h3>
    <Space wrap>
      <For each={['设计', '研发', '产品']}>
        {topic => <CheckableTag checked={topics().includes(topic)} onChange={checked => setTopics(previous => checked ? [...previous, topic] : previous.filter(value => value !== topic))}>{topic}</CheckableTag>}
      </For>
      <Tag.CheckableTag defaultChecked>独立开关</Tag.CheckableTag>
      <CheckableTag disabled>不可选</CheckableTag>
    </Space>
    <p class="text-sm text-on-surface-variant">已选：{topics().join('、') || '无'}</p>
  </div>
}
