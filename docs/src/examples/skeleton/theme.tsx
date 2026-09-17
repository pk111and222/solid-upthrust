import Skeleton from 'upthrust-ui/source/Skeleton'
import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import ConfigProvider from 'upthrust-ui/source/ConfigProvider'

export default function Demo() {
  const [dark, setDark] = createSignal(false)
  return <div class="space-y-4">
    <Button onClick={() => setDark(!dark())}>切换深色</Button>
    <ConfigProvider theme={{ colors: {
      outlineVariant: dark() ? '#a0a8bc' : '#9ca3af',
    } }} class={dark() ? 'bg-slate-900 p-4 rounded' : 'bg-white p-4 rounded'}>
      <Skeleton active avatar paragraph={{ rows: 2 }} />
    </ConfigProvider>
  </div>
}
