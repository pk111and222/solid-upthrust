import Flex from 'upthrust-ui/source/Flex'
import Spin from 'upthrust-ui/source/Spin'

export default function Size() {
  return <Flex align="center" gap="middle">
    <Spin size="small" />
    <Spin />
    <Spin size="large" />
  </Flex>
}
