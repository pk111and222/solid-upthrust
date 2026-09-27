import Flex from 'upthrust-ui/source/Flex'
import Timeline, { type TimelineItemProps, type TimelineProps } from 'upthrust-ui/source/Timeline'

const classNames = { root: 'p-xs rounded-sm' }

const styles: TimelineProps['styles'] = { itemIcon: { 'border-color': '#1890ff' } }

// 函数形式：按合并后的 props 计算。
const stylesFn: TimelineProps['styles'] = info => info.props.orientation === 'vertical'
  ? { root: { padding: '10px 6px', border: '1px solid #A294F9' }, itemIcon: { 'border-color': '#A294F9' } }
  : {}

const items: TimelineItemProps[] = [
  { title: '2015-09-01', content: 'Create a services site' },
  { title: '2015-09-01 09:12:11', content: 'Solve initial network problems' },
  { content: 'Technical testing' },
]

export default function StyleClass() {
  return <Flex vertical gap="middle">
    <Timeline classNames={classNames} items={items} orientation="horizontal" styles={styles} />
    <Timeline classNames={classNames} items={items} orientation="vertical" styles={stylesFn} />
  </Flex>
}
