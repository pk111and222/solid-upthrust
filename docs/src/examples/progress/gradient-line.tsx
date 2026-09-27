import Flex from 'upthrust-ui/source/Flex'
import Progress, { type ProgressStrokeColor } from 'upthrust-ui/source/Progress'

const twoColors: ProgressStrokeColor = { '0%': '#108ee9', '100%': '#87d068' }
const conicColors: ProgressStrokeColor = { '0%': '#87d068', '50%': '#ffe58f', '100%': '#ffccc7' }

export default function GradientLine() {
  return <Flex vertical gap="middle">
    <Progress percent={99.9} strokeColor={twoColors} />
    <Progress percent={50} status="active" strokeColor={{ from: '#108ee9', to: '#87d068' }} />
    <Flex gap="small" wrap>
      <Progress type="circle" percent={90} strokeColor={twoColors} />
      <Progress type="circle" percent={100} strokeColor={twoColors} />
      <Progress type="circle" percent={93} strokeColor={conicColors} />
    </Flex>
    <Flex gap="small" wrap>
      <Progress type="dashboard" percent={90} strokeColor={twoColors} />
      <Progress type="dashboard" percent={100} strokeColor={twoColors} />
      <Progress type="dashboard" percent={93} strokeColor={conicColors} />
    </Flex>
  </Flex>
}
