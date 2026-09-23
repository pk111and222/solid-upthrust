import { createSignal, onCleanup } from 'solid-js'
import Select from 'upthrust-ui/source/Select'

const all = [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }, { label: '东京', value: 'tokyo' }]
export default function Remote() {
  const [options, setOptions] = createSignal(all)
  const [loading, setLoading] = createSignal(false)
  let request = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  onCleanup(() => { if (timer) clearTimeout(timer) })
  const search = (query: string) => {
    const current = ++request
    setLoading(true)
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      if (current !== request) return
      setOptions(all.filter(option => option.label.includes(query)))
      setLoading(false)
    }, 200)
  }
  return <div class="px-3 flex flex-col gap-3">
    <Select aria-label="远端搜索" showSearch filterOption={false} options={options()} loading={loading()} onSearch={search}
      notFoundContent={loading() ? '正在查询…' : '没有结果'} placeholder="输入城市名" />
    <p>示例用延迟模拟服务端请求；实际项目请在 onSearch 中调用接口并处理请求顺序。</p>
  </div>
}
