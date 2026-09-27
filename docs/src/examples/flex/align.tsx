import { createSignal, For } from 'solid-js'
import Flex, { type FlexAlign, type FlexJustify } from 'upthrust-ui/source/Flex'
import Button from 'upthrust-ui/source/Button'
import Segmented from 'upthrust-ui/source/Segmented'

const justifyOptions: FlexJustify[] = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly']
const alignOptions: FlexAlign[] = ['flex-start', 'center', 'flex-end', 'baseline']

export default function Align() {
  const [justify, setJustify] = createSignal<FlexJustify>('flex-start')
  const [align, setAlign] = createSignal<FlexAlign>('flex-start')
  return <Flex gap="middle" vertical align="flex-start">
    <p class="m-0 text-sm">justify-content：</p>
    <div class="max-w-full overflow-x-auto">
      <Segmented aria-label="主轴对齐" value={justify()} onChange={value => setJustify(value as FlexJustify)} options={justifyOptions} />
    </div>
    <p class="m-0 text-sm">align-items：</p>
    <div class="max-w-full overflow-x-auto">
      <Segmented aria-label="交叉轴对齐" value={align()} onChange={value => setAlign(value as FlexAlign)} options={alignOptions} />
    </div>
    <Flex data-flex-align class="h-[120px] w-full rounded-lg border border-outline-variant" justify={justify()} align={align()}>
      <For each={['Primary', '按钮', '较高的按钮', '按钮']}>{label =>
        <Button type={label === 'Primary' ? 'primary' : 'default'} style={label === '较高的按钮' ? { height: '48px' } : undefined}>{label}</Button>}
      </For>
    </Flex>
  </Flex>
}
