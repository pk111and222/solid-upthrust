import { createSignal } from 'solid-js'
import Affix from 'upthrust-ui/source/Affix'
import Button from 'upthrust-ui/source/Button'

export default function OnChange() {
  const [log, setLog] = createSignal<boolean[]>([])
  return <div class="flex flex-col gap-sm items-start">
    {/* onChange 只在固定状态切换时触发，滚动过程中不会重复触发。 */}
    <Affix offsetTop={120} onChange={affixed => setLog(list => [...list, affixed])}>
      <Button>固定在顶部 120px</Button>
    </Affix>
    <output data-log={log().join(',')}>onChange：[{log().join(', ')}]</output>
  </div>
}
