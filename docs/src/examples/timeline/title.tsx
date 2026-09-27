import { createSignal } from 'solid-js'
import { RadioGroup } from 'upthrust-ui/source/Radio'
import Timeline, { type TimelineMode } from 'upthrust-ui/source/Timeline'

export default function Title() {
  const [mode, setMode] = createSignal<TimelineMode>('start')
  return <>
    <RadioGroup
      value={mode()}
      onChange={value => setMode(value as TimelineMode)}
      style={{ 'margin-bottom': '20px' }}
      options={[{ label: 'Start', value: 'start' }, { label: 'End', value: 'end' }, { label: 'Alternate', value: 'alternate' }]}
    />
    <Timeline
      mode={mode()}
      items={[
        { title: '2015-09-01', content: 'Create a services' },
        { title: '2015-09-01 09:12:11', content: 'Solve initial network problems' },
        { content: 'Technical testing' },
        { title: '2015-09-01 09:12:11', content: 'Network problems being solved' },
      ]}
    />
  </>
}
