import { createSignal } from 'solid-js'
import { InputSearch as Search } from 'upthrust-ui/source/Input'
export default function Demo() {
  const [result, setResult] = createSignal('未搜索')
  const report = (value: string, _event?: MouseEvent | KeyboardEvent, info?: { source: 'input' | 'clear' }) => setResult(`${info?.source}:${value}`)
  return <div class="space-y-3"><Search placeholder="图标搜索" defaultValue="query" allowClear onSearch={report} /><Search placeholder="文字按钮搜索" enterButton="查找" onSearch={report} /><Search placeholder="图标按钮搜索" enterButton onSearch={report} /><output>结果：{result()}</output></div>
}
