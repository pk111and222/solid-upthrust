import { createSignal, For } from 'solid-js'
import { Col, Row } from 'upthrust-ui/source/Grid'
import Slider from 'upthrust-ui/source/Slider'

const GUTTERS = [8, 16, 24, 32, 40, 48]
const COUNTS = [2, 3, 4, 6, 8, 12]
/** 滑块刻度为下标，标签显示实际取值。 */
const marks = (values: number[]) => values.map((value, index) => ({ value: index, label: String(value) }))

export default function Playground() {
  const [h, setH] = createSignal(1)
  const [v, setV] = createSignal(1)
  const [count, setCount] = createSignal(2)
  const columns = () => Array.from({ length: COUNTS[count()] * 2 }, (_, i) => i)
  return <div class="flex flex-col gap-lg">
    <div class="grid gap-lg sm:grid-cols-3">
      <label class="flex flex-col gap-xs text-on-surface-variant">水平间距
        <Slider aria-label="水平间距" min={0} max={GUTTERS.length - 1} value={h()} onChange={setH} marks={marks(GUTTERS)} marksOnly step={null} />
      </label>
      <label class="flex flex-col gap-xs text-on-surface-variant">垂直间距
        <Slider aria-label="垂直间距" min={0} max={GUTTERS.length - 1} value={v()} onChange={setV} marks={marks(GUTTERS)} marksOnly step={null} />
      </label>
      <label class="flex flex-col gap-xs text-on-surface-variant">列数
        <Slider aria-label="列数" min={0} max={COUNTS.length - 1} value={count()} onChange={setCount} marks={marks(COUNTS)} marksOnly step={null} />
      </label>
    </div>
    <Row gutter={[GUTTERS[h()], GUTTERS[v()]]} data-grid-playground>
      <For each={columns()}>{() =>
        <Col span={24 / COUNTS[count()]}><div class="h-[60px] rounded-sm bg-primary/20 border border-solid border-primary/40" /></Col>}
      </For>
    </Row>
    <pre class="m-0 p-sm rounded bg-on-surface/4 text-xs overflow-x-auto">{`<Row gutter={[${GUTTERS[h()]}, ${GUTTERS[v()]}]}>\n  <Col span={${24 / COUNTS[count()]}} />  × ${COUNTS[count()] * 2}\n</Row>`}</pre>
  </div>
}
