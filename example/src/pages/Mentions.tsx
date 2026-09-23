import { type Component, createSignal, Show } from 'solid-js'
import { Mentions, Divider, Typography, type MentionOption } from 'upthrust-ui'
import { extractMentions } from 'upthrust-competence'

const { Text } = Typography

const MentionsPage: Component = () => {
  const [text, setText] = createSignal('')
  const [lastPicked, setLastPicked] = createSignal('')
  const [search, setSearch] = createSignal('')
  const [opened, setOpened] = createSignal(false)

  const options: MentionOption[] = [
    { value: 'afc163', label: 'afc163' },
    { value: 'zombiej', label: 'ZombieJ' },
    { value: 'yesmeck', label: 'Yesmeck' },
    { value: 'pftann', label: 'Pftann' },
    { value: 'alice', label: 'Alice' },
    { value: 'bob', label: 'Bob' },
  ]

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">Mentions 提及</h2>
      <p class="mb-6 text-on-surface-variant">
        在多行文本中输入 @ 搜索同事，使用方向键和 Enter 或鼠标插入提及。
        离开提及词、按 Escape 或点击外部可关闭建议。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础（受控）</h3>
      <div class="max-w-sm flex flex-col gap-3">
        <Mentions
          options={options}
          value={text()}
          onChange={setText}
          onSelect={option => setLastPicked(option.value)}
          onSearch={query => setSearch(query)}
          onOpenChange={setOpened}
          aria-label="提及同事"
          placeholder="输入 @ 触发提及菜单（支持 ↑↓ + Enter）"
          rows={3}
        />
        <Text type="secondary">当前文本：{JSON.stringify(text())}</Text>
        <Text type="secondary">
          解析出的提及：{JSON.stringify(extractMentions(text()))}
        </Text>
        <Text type="secondary">查询：{search() || '空'}；建议：{opened() ? '已打开' : '已关闭'}</Text>
        <Show when={lastPicked()}>
          <Text type="secondary">最近选中：@{lastPicked()}</Text>
        </Show>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义前缀 / 默认值 / 禁用</h3>
      <div class="max-w-sm flex flex-col gap-3">
        <Mentions options={options} prefix="#" aria-label="话题提及" placeholder="输入 # 触发" rows={2} />
        <Mentions options={options} defaultValue="Hi @afc163, take a look" rows={2} />
        <Mentions options={options} disabled placeholder="禁用" rows={2} />
        <Mentions options={options} status="error" placeholder="错误状态" rows={2} />
      </div>
    </div>
  )
}

export default MentionsPage
