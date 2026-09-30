import { createSignal, onCleanup } from 'solid-js'
import Flex from 'upthrust-ui/source/Flex'
import Spin from 'upthrust-ui/source/Spin'
import Switch from 'upthrust-ui/source/Switch'

export default function Percent() {
  const [auto, setAuto] = createSignal(false)
  const [percent, setPercent] = createSignal(-50)
  const timer = setInterval(() => setPercent(v => v + 5 > 150 ? -50 : v + 5), 100)
  onCleanup(() => clearInterval(timer))
  const merged = () => auto() ? 'auto' as const : percent()
  return <Flex align="center" gap="middle">
    <Switch checkedChildren="Auto" unCheckedChildren="Auto" checked={auto()} onChange={() => { setAuto(!auto()); setPercent(-50) }} />
    <Spin percent={merged()} size="small" />
    <Spin percent={merged()} />
    <Spin percent={merged()} size="large" />
  </Flex>
}
