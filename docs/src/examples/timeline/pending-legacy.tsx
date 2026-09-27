import Flex from 'upthrust-ui/source/Flex'
import Timeline from 'upthrust-ui/source/Timeline'

export default function PendingLegacy() {
  return <Flex vertical gap="middle" align="flex-start">
    <Timeline pending="Recording..." items={[{ content: 'Create a services site 2015-09-01' }]} />
    <Timeline pending="Recording..." pendingDot="🔴" items={[{ content: 'Create a services site 2015-09-01' }]} />
  </Flex>
}
