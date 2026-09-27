import Flex from 'upthrust-ui/source/Flex'
import Timeline, { type TimelineItemProps } from 'upthrust-ui/source/Timeline'
import { Title } from 'upthrust-ui/source/Typography'

const items: TimelineItemProps[] = [
  { title: '05:10', content: 'Create a services' },
  { title: '09:03', content: 'Solve initial network problems' },
  { content: 'Technical testing' },
  { title: '11:28', content: 'Network problems being solved' },
]

export default function TitleSpan() {
  return <Flex vertical gap="middle">
    <Title level={5} style={{ margin: 0 }}>titleSpan = 100px</Title>
    <Timeline items={items} titleSpan="100px" />
    <Title level={5} style={{ margin: 0 }}>titleSpan = 25%</Title>
    <Timeline items={items} titleSpan="25%" />
    <Title level={5} style={{ margin: 0 }}>titleSpan = 18, mode = end</Title>
    <Timeline items={items} titleSpan={18} mode="end" />
  </Flex>
}
