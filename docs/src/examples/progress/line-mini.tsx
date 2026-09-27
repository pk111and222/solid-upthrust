import Flex from 'upthrust-ui/source/Flex'
import Progress from 'upthrust-ui/source/Progress'

export default function LineMini() {
  return <Flex vertical gap="small" style={{ width: '180px' }}>
    <Progress percent={30} size="small" />
    <Progress percent={50} size="small" status="active" />
    <Progress percent={70} size="small" status="exception" />
    <Progress percent={100} size="small" />
  </Flex>
}
