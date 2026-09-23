import { createSignal, onCleanup } from 'solid-js'
import { AutoComplete, type AutoCompleteOption } from 'upthrust-ui'

export default function Remote() {
  const [options, setOptions] = createSignal<AutoCompleteOption[]>([])
  const [loading, setLoading] = createSignal(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  let request = 0
  const search = (text: string) => {
    const current = ++request
    clearTimeout(timer)
    setOptions([])
    setLoading(!!text)
    if (!text) return
    timer = setTimeout(() => {
      if (current !== request) return
      setOptions(['@example.com', '@mail.test'].map(suffix => ({ value: text + suffix })))
      setLoading(false)
    }, 150)
  }
  onCleanup(() => { ++request; clearTimeout(timer) })
  return <div class="flex flex-col gap-3 max-w-sm">
    <AutoComplete aria-label="邮箱建议" onSearch={search} options={options()} filterOption={false} placeholder="输入邮箱前缀" />
    <output>{loading() ? '正在查询…' : '模拟异步返回，旧请求不会覆盖新候选'}</output>
  </div>
}
