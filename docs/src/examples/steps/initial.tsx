import { createSignal } from 'solid-js'
import Steps from 'upthrust-ui/source/Steps'

export default function Initial() {
  // initial=3：编号从 4 开始，current 与 onChange 都以 3 为起点计数。
  const [current, setCurrent] = createSignal(4)
  return <div class="flex flex-col gap-md">
    <Steps initial={3} current={current()} onChange={setCurrent} items={[{ title: '第四步' }, { title: '第五步' }, { title: '第六步' }]} />
    <output data-current={current()}>current = {String(current())}</output>
  </div>
}
