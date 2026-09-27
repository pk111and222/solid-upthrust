import Flex from 'upthrust-ui/source/Flex'
import Progress from 'upthrust-ui/source/Progress'

export default function Line() {
  return <Flex gap="small" vertical>
    <Progress percent={30} />
    <Progress percent={50} status="active" />
    <Progress percent={70} status="exception" />
    <Progress percent={100} />
    <Progress percent={50} showInfo={false} />
  </Flex>
}
