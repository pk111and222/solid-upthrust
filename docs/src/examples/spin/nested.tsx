import { createSignal } from 'solid-js'
import Alert from 'upthrust-ui/source/Alert'
import Flex from 'upthrust-ui/source/Flex'
import Spin from 'upthrust-ui/source/Spin'
import Switch from 'upthrust-ui/source/Switch'

export default function Nested() {
  const [loading, setLoading] = createSignal(false)
  return <Flex gap="middle" vertical>
    <Spin spinning={loading()}>
      <Alert type="info" title="Alert message title" description="Further details about the context of this alert." />
    </Spin>
    <p class="m-0">Loading state：<Switch checked={loading()} onChange={setLoading} /></p>
  </Flex>
}
