import { type Component, createSignal, Show } from 'solid-js'
import { Mentions, Divider, Typography, type MentionOption } from 'upthrust-ui'

const { Text } = Typography

const MentionsPage: Component = () => {
  const [text, setText] = createSignal('')
  const [lastPicked, setLastPicked] = createSignal('')

  const options: MentionOption[] = [
    { value: 'afc163', label: 'afc163' },
    { value: 'zombiej', label: 'ZombieJ' },
    { value: 'yesmeck', label: 'Yesmeck' },
    { value: 'pftann', label: 'Pftann' },
  ]

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">Mentions 提及</h2>
      <p class="texton-surface-variant mb-6 text-on-surface-variant">
        headless createMentions —— textarea 文本 buffer（IME 门控）+ 光标感知的
        '@' 触发检测（parseTrigger 纯函数）+ 查询过滤 + 选中回插（token 替换 +
        尾随空格）；浮层复用 createTrigger，开合由触发态派生。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础（受控）</h3>
      <div class="max-w-sm flex flex-col gap-3">
        <Mentions
          options={options}
          value={text()}
          onChange={setText}
          onSelect={option => setLastPicked(option.value)}
          placeholder="输入 @ 触发提及菜单（支持 ↑↓ + Enter）"
          rows={3}
        />
        <Text type="secondary">当前文本：{JSON.stringify(text())}</Text>
        <Text type="secondary">
          解析出的提及：{JSON.stringify(extract(text()))}
        </Text>
        <Show when={lastPicked()}>
          <Text type="secondary">最近选中：@{lastPicked()}</Text>
        </Show>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义前缀 / 默认值 / 禁用</h3>
      <div class="max-w-sm flex flex-col gap-3">
        <Mentions options={options} prefix="#" placeholder="输入 # 触发" rows={2} />
        <Mentions options={options} defaultValue="Hi @afc163, take a look" rows={2} />
        <Mentions options={options} disabled placeholder="禁用" rows={2} />
      </div>
    </div>
  )
}

// antd value contract: mentions are plain '@name' occurrences in the text.
const extract = (text: string): string[] => {
  const out: string[] = []
  let i = 0
  while (i <= text.length - 1) {
    const idx = text.indexOf('@', i)
    if (idx === -1) break
    const before = idx > 0 ? text[idx - 1] : undefined
    const boundaryOk = before === undefined || /\s/.test(before)
    let end = idx + 1
    while (end < text.length && !/\s/.test(text[end])) end++
    if (boundaryOk && end > idx + 1) {
      out.push(text.slice(idx + 1, end))
      i = end
    } else {
      i = idx + 1
    }
  }
  return out
}

export default MentionsPage
