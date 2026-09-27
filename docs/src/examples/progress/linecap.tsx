import Flex from 'upthrust-ui/source/Flex'
import Progress from 'upthrust-ui/source/Progress'

export default function Linecap() {
  return <Flex vertical gap="small">
    <Progress strokeLinecap="butt" percent={75} />
    <Flex wrap gap="small">
      <Progress strokeLinecap="butt" type="circle" percent={75} />
      <Progress strokeLinecap="butt" type="dashboard" percent={75} />
    </Flex>
  </Flex>
}
