import Flex from 'upthrust-ui/source/Flex'
import Progress from 'upthrust-ui/source/Progress'

export default function CircleMicro() {
  return <Flex align="center" gap="small">
    <Progress
      type="circle"
      railColor="#e6f4ff"
      percent={60}
      strokeWidth={20}
      size={14}
      format={number => `In progress, ${number}% complete`}
    />
    <span>Code release</span>
  </Flex>
}
