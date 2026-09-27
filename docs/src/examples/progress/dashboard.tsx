import { createSignal } from 'solid-js'
import Flex from 'upthrust-ui/source/Flex'
import Progress, { type ProgressGapPlacement } from 'upthrust-ui/source/Progress'
import Segmented from 'upthrust-ui/source/Segmented'

export default function Dashboard() {
  const [gapPlacement, setGapPlacement] = createSignal<ProgressGapPlacement>('bottom')
  const [gapDegree, setGapDegree] = createSignal(50)
  return <Flex vertical gap="large">
    <div>
      gapDegree:
      <Segmented
        options={[{ label: '50', value: 50 }, { label: '100', value: 100 }]}
        defaultValue={50}
        onChange={value => setGapDegree(Number(value))}
      />
    </div>
    <div>
      gapPlacement:
      <Segmented
        options={['start', 'end', 'top', 'bottom'].map(value => ({ label: value, value }))}
        defaultValue="bottom"
        onChange={value => setGapPlacement(value as ProgressGapPlacement)}
      />
    </div>
    <Progress type="dashboard" gapDegree={gapDegree()} percent={30} gapPlacement={gapPlacement()} />
  </Flex>
}
