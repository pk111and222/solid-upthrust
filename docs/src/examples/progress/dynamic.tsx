import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Flex from 'upthrust-ui/source/Flex'
import Icon from 'upthrust-ui/source/Icon'
import Progress from 'upthrust-ui/source/Progress'
import Space from 'upthrust-ui/source/Space'

export default function Dynamic() {
  const [percent, setPercent] = createSignal(0)
  const increase = () => setPercent(prev => Math.min(prev + 10, 100))
  const decline = () => setPercent(prev => Math.max(prev - 10, 0))
  return <Flex vertical gap="small">
    <Flex vertical gap="small">
      <Progress percent={percent()} type="line" />
      <Progress percent={percent()} type="circle" />
    </Flex>
    <Space.Compact>
      <Button aria-label="减少" onClick={decline} icon={<Icon name="minus" />} />
      <Button aria-label="增加" onClick={increase} icon={<Icon name="plus" />} />
    </Space.Compact>
  </Flex>
}
