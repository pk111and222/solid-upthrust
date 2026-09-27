import Divider from 'upthrust-ui/source/Divider'
import Flex from 'upthrust-ui/source/Flex'
import Timeline, { type TimelineItemProps } from 'upthrust-ui/source/Timeline'

const items: TimelineItemProps[] = [{ content: 'Init' }, { content: 'Start' }, { content: 'Pending' }, { content: 'Complete' }]

export default function Horizontal() {
  return <Flex vertical>
    <Timeline orientation="horizontal" items={items} mode="start" />
    <Divider />
    <Timeline orientation="horizontal" items={items} mode="end" />
    <Divider />
    <Timeline orientation="horizontal" items={items} mode="alternate" />
  </Flex>
}
