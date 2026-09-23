import { createSignal, onCleanup } from 'solid-js'
import Mentions, { type MentionOption } from 'upthrust-ui/source/Mentions'

export default function Remote() {
  const [options, setOptions] = createSignal<MentionOption[]>([])
  let timer: ReturnType<typeof setTimeout> | undefined
  let request = 0
  const search = (query: string) => {
    const current = ++request
    clearTimeout(timer)
    setOptions([])
    if (!query) return
    timer = setTimeout(() => {
      if (current !== request) return
      setOptions([{ value: `${query}-team` }, { value: `${query}-project` }])
    }, 150)
  }
  onCleanup(() => { ++request; clearTimeout(timer) })
  return <div class="flex flex-col gap-3 max-w-sm">
    <Mentions aria-label="异步提及" options={options()} filterOption={false}
      onSearch={search} placeholder="输入 @ 后输入名字" />
    <output>模拟异步候选；新查询会替换旧结果。</output>
  </div>
}
