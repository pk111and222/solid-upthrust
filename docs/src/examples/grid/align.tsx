import { createSignal } from 'solid-js'
import { Col, Row, type RowAlign } from 'upthrust-ui/source/Grid'
import Segmented from 'upthrust-ui/source/Segmented'

/** 高度不同的列，用来观察交叉轴对齐。 */
const HEIGHTS = ['h-[100px]', 'h-[50px]', 'h-[120px]', 'h-[80px]']

export default function Align() {
  const [align, setAlign] = createSignal<RowAlign>('top')
  return <div class="flex flex-col gap-md">
    <div class="max-w-full overflow-x-auto">
      <Segmented aria-label="垂直对齐" value={align()} onChange={value => setAlign(value as RowAlign)}
        options={(['top', 'middle', 'bottom', 'stretch'] as const).map(value => ({ label: value, value }))} />
    </div>
    <Row justify="space-around" align={align()} class="bg-on-surface/4" data-grid-align>
      {HEIGHTS.map((height, i) => (
        <Col span={4} class={`flex items-center justify-center text-on-primary ${align() === 'stretch' ? 'min-h-[50px]' : height} ${i % 2 ? 'bg-primary/75' : 'bg-primary'}`}>
          col-4
        </Col>
      ))}
    </Row>
  </div>
}
