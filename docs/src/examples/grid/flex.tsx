import { createSignal } from 'solid-js'
import { Col, Row, type RowJustify } from 'upthrust-ui/source/Grid'
import Segmented from 'upthrust-ui/source/Segmented'

const JUSTIFY: RowJustify[] = ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly']

export default function Flex() {
  const [justify, setJustify] = createSignal<RowJustify>('start')
  return <div class="flex flex-col gap-md">
    <div class="max-w-full overflow-x-auto">
      <Segmented aria-label="水平排列" value={justify()} onChange={value => setJustify(value as RowJustify)}
        options={JUSTIFY.map(value => ({ label: value, value }))} />
    </div>
    <Row justify={justify()} class="bg-on-surface/4" data-grid-justify>
      {[0, 1, 2, 3].map(i => <Col span={4} class={`py-md text-center text-on-primary ${i % 2 ? 'bg-primary/75' : 'bg-primary'}`}>col-4</Col>)}
    </Row>
  </div>
}
