import { createSignal } from 'solid-js'
import Tag, { CheckableTag, CheckableTagGroup } from 'upthrust-ui/source/Tag'

const tagsData = ['电影', '图书', '音乐', '运动']

export default function Checkable() {
  const [checked, setChecked] = createSignal(true)
  const [single, setSingle] = createSignal<string | null>('图书')
  const [multiple, setMultiple] = createSignal<string[]>(['电影', '音乐'])
  const row = 'grid grid-cols-[96px_1fr] items-center gap-3'
  return <div class="flex flex-col gap-4">
    <div class={row}><span class="text-on-surface-variant">单个</span><div><CheckableTag checked={checked()} onChange={setChecked}>是</CheckableTag></div></div>
    <div class={row}><span class="text-on-surface-variant">单选组</span><CheckableTagGroup aria-label="单选组" options={tagsData} value={single()} onChange={setSingle} /></div>
    <div class={row}><span class="text-on-surface-variant">多选组</span><CheckableTagGroup aria-label="多选组" multiple options={tagsData} value={multiple()} onChange={setMultiple} /></div>
    <div class={row}><span class="text-on-surface-variant">非受控</span><div class="flex gap-2"><Tag.CheckableTag defaultChecked>默认选中</Tag.CheckableTag><CheckableTag>默认未选</CheckableTag></div></div>
    <p class="m-0 text-sm text-on-surface-variant" data-result>单选：{single() ?? '无'}；多选：{multiple().join('、') || '无'}</p>
  </div>
}
