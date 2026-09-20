import { createSignal } from 'solid-js'
import { InputSearch as Search } from 'upthrust-ui/source/Input'
import Button from 'upthrust-ui/source/Button'
export default function Demo() {
  const [loading, setLoading] = createSignal(true)
  const [count, setCount] = createSignal(0)
  return <div class="space-y-3"><Search placeholder="加载期间不搜索" loading={loading()} enterButton="搜索" onSearch={() => setCount(count() + 1)} /><Button onClick={() => setLoading(!loading())}>切换加载</Button><output>搜索次数：{count()}</output></div>
}
