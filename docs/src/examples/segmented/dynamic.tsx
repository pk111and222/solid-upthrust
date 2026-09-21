import { createSignal } from 'solid-js'
import type { SegmentedIns } from 'upthrust-competence'
import Segmented from 'upthrust-ui/source/Segmented'
import Button from 'upthrust-ui/source/Button'
export default function Dynamic() {
  const [removed, setRemoved] = createSignal(false)
  const [disabled, setDisabled] = createSignal(false)
  const [value, setValue] = createSignal<string | number>('a')
  let machine: SegmentedIns | undefined
  return <div class="px-3 flex flex-col gap-3">
    <Segmented aria-label="动态选项" value={value()} onChange={setValue} ref={instance => { machine = instance }}
      options={removed() ? [{ label: 'A', value: 'a' }, { label: 'C', value: 'c' }] : [
        { label: 'A', value: 'a' }, { label: 'B', value: 'b', disabled: disabled() }, { label: 'C', value: 'c' },
      ]} />
    <div class="flex flex-wrap gap-2">
      <Button onClick={() => setRemoved(!removed())}>切换 B 是否存在</Button>
      <Button onClick={() => setDisabled(!disabled())}>切换 B 禁用</Button>
      <Button onClick={() => machine?.select('c')}>通过 ref 选择 C</Button>
    </div>
    <output>当前：{String(value())}</output>
    <p>选项删除或禁用后，旧键盘候选会失效；ref 返回逻辑实例，不是 DOM 元素。</p>
  </div>
}
