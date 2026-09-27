import { createSignal } from 'solid-js'
import Flex from 'upthrust-ui/source/Flex'
import Progress from 'upthrust-ui/source/Progress'
import Slider from 'upthrust-ui/source/Slider'
import { Title } from 'upthrust-ui/source/Typography'

export default function CircleSteps() {
  const [stepsCount, setStepsCount] = createSignal(5)
  const [stepsGap, setStepsGap] = createSignal(7)
  return <>
    <Title level={5}>Custom count:</Title>
    <Slider aria-label="步骤数" min={2} max={10} value={stepsCount()} onChange={setStepsCount} />
    <Title level={5}>Custom gap:</Title>
    <Slider aria-label="步骤间隔" step={4} min={0} max={40} value={stepsGap()} onChange={setStepsGap} />
    <Flex wrap gap="middle" style={{ 'margin-top': '16px' }}>
      <Progress type="dashboard" steps={8} percent={50} railColor="rgba(0, 0, 0, 0.06)" strokeWidth={20} />
      <Progress type="circle" percent={100} steps={{ count: stepsCount(), gap: stepsGap() }} railColor="rgba(0, 0, 0, 0.06)" strokeWidth={20} />
    </Flex>
  </>
}
