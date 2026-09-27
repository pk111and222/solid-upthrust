import Flex from 'upthrust-ui/source/Flex'
import Progress from 'upthrust-ui/source/Progress'

export default function CircleMini() {
  return <Flex wrap gap="small">
    <Progress type="circle" percent={30} size={80} />
    <Progress type="circle" percent={70} size={80} status="exception" />
    <Progress type="circle" percent={100} size={80} />
  </Flex>
}
