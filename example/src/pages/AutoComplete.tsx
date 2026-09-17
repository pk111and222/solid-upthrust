import { type Component, createSignal, Show } from 'solid-js'
import { AutoComplete, Space, Divider, Typography, type AutoCompleteOption } from 'upthrust-ui'

const { Text } = Typography

const AutoCompletePage: Component = () => {
  const [basic, setBasic] = createSignal('')
  const [picked, setPicked] = createSignal('')

  const options: AutoCompleteOption[] = [
    { value: 'burns', label: 'Burns Bay Bridge' },
    { value: 'sam', label: 'Sam Street' },
    { value: 'shanghai', label: 'Shanghai Tower' },
    { value: 'tokyo', label: 'Tokyo Tower' },
  ]

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">AutoComplete 自动补全</h2>
      <p class="text-on-surface-variant mb-6">
        headless createAutoComplete —— 文本 buffer（IME 门控）+ 建议过滤 + active
        键盘导航；浮层复用 createTrigger（focus 触发）。与 Select 同一套导航契约，
        但值是自由文本（无 selection store）。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础（受控）</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <AutoComplete
          options={options}
          value={basic()}
          onChange={setBasic}
          onSelect={(v, option) => setPicked(`${v}（${option.label}）`)}
          placeholder="输入试试（如 tokyo）"
        />
        <Text type="secondary">当前文本：{basic() || '（空）'}</Text>
        <Show when={picked()}>
          <Text type="secondary">最近选中：{picked()}</Text>
        </Show>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">默认值 / 自定义过滤 / 禁用</h3>
      <Space direction="vertical" size="middle" class="w-72">
        <AutoComplete options={options} defaultValue="sam" placeholder="默认值" />
        <AutoComplete
          options={options}
          filterOption={(input, option) => (option.value ?? '').startsWith(input)}
          placeholder="仅前缀匹配（输入 s 试试）"
        />
        <AutoComplete options={options} disabled placeholder="禁用" />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">键盘操作</h3>
      <div class="max-w-xs flex flex-col gap-2">
        <Text type="secondary">聚焦后：↓/↑ 移动高亮，Enter 选中，Esc 关闭。</Text>
        <AutoComplete options={options} placeholder="聚焦后按 ↓" />
      </div>
    </div>
  )
}

export default AutoCompletePage
