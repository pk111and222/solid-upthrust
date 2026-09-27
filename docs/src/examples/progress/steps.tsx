import Flex from 'upthrust-ui/source/Flex'
import Progress from 'upthrust-ui/source/Progress'

// antd 示例使用 @ant-design/colors：green[6] = #52c41a、red[5] = #ff4d4f。
const green6 = '#52c41a'
const red5 = '#ff4d4f'

export default function Steps() {
  return <Flex gap="small" vertical>
    <Progress percent={50} steps={3} />
    <Progress percent={30} steps={5} />
    <Progress percent={100} steps={5} size="small" strokeColor={green6} />
    <Progress percent={60} steps={5} strokeColor={[green6, green6, red5]} />
  </Flex>
}
