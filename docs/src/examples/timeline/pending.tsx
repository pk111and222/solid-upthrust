import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Flex from 'upthrust-ui/source/Flex'
import Timeline from 'upthrust-ui/source/Timeline'

export default function Pending() {
  const [reverse, setReverse] = createSignal(false)
  return <Flex vertical gap="middle" align="flex-start">
    <Timeline
      reverse={reverse()}
      items={[
        { content: 'Create a services site 2015-09-01' },
        { content: 'Solve initial network problems 2015-09-01' },
        { content: 'Technical testing 2015-09-01' },
        { loading: true, content: 'Recording...' },
      ]}
    />
    <Button type="primary" onClick={() => setReverse(!reverse())}>Toggle Reverse</Button>
  </Flex>
}
