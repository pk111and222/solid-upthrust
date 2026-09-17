import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Space from 'upthrust-ui/source/Space'
import Tooltip from 'upthrust-ui/source/Tooltip'

export default function Demo() {
  const [dark, setDark] = createSignal(false)

  return <ConfigProvider
    class="relative min-h-[160px] rounded-lg border border-outline-variant bg-surface p-6 text-on-surface"
    theme={{ colors: {
      surface: dark() ? '#1e293b' : '#fff7ed',
      onSurface: dark() ? '#f8fafc' : '#7c2d12',
    } }}
  >
    <Space size="middle">
      <Tooltip title="继承局部主题 surface/onSurface">
        <Button>局部主题提示</Button>
      </Tooltip>
      <Tooltip title="通过 getContainer 挂载到 document.body，不再跟随局部主题" getContainer={() => document.body}>
        <Button variant="outlined">getContainer=body</Button>
      </Tooltip>
      <Button onClick={() => setDark(!dark())}>切换主题</Button>
    </Space>
  </ConfigProvider>
}
