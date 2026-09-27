import { For, Show, createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import Tag from 'upthrust-ui/source/Tag'
import Tooltip from 'upthrust-ui/source/Tooltip'

export default function Control() {
  const [tags, setTags] = createSignal(['不可删除', '标签二', '标签三'])
  const [adding, setAdding] = createSignal(false)
  const [draft, setDraft] = createSignal('')
  const [editing, setEditing] = createSignal(-1)
  const [editDraft, setEditDraft] = createSignal('')
  const confirmAdd = () => {
    const value = draft().trim()
    if (value && !tags().includes(value)) setTags([...tags(), value])
    setAdding(false); setDraft('')
  }
  const confirmEdit = () => {
    const index = editing(), value = editDraft().trim()
    if (index >= 0 && value) setTags(tags().map((tag, i) => i === index ? value : tag))
    setEditing(-1); setEditDraft('')
  }
  return <div class="flex flex-wrap items-center gap-2">
    <For each={tags()}>
      {(tag, index) => <Show when={editing() !== index()} fallback={
        <><label for="tag-control-edit" class="sr-only">编辑标签</label><Input id="tag-control-edit" size="small" class="w-[80px]" value={editDraft()} onChange={setEditDraft} onBlur={confirmEdit} onPressEnter={confirmEdit} ref={el => requestAnimationFrame(() => el.focus())} /></>
      }>
        {(() => {
          const long = tag.length > 12
          const node = <Tag closable={index() !== 0} class="select-none" onClose={() => setTags(tags().filter(item => item !== tag))}>
            <span onDblClick={() => { if (index() !== 0) { setEditing(index()); setEditDraft(tag) } }}>{long ? `${tag.slice(0, 12)}…` : tag}</span>
          </Tag>
          return long ? <Tooltip title={tag}>{node}</Tooltip> : node
        })()}
      </Show>}
    </For>
    <Show when={adding()} fallback={
      <Tag variant="outlined" class="border-dashed bg-surface cursor-pointer" icon={<span class="i-mdi-plus" />} role="button" tabindex={0}
        onClick={() => setAdding(true)} onKeyDown={event => { if (event.key === 'Enter') setAdding(true) }}>新标签</Tag>
    }>
      <label for="tag-control-new" class="sr-only">新标签名称</label>
      <Input id="tag-control-new" size="small" class="w-[80px]" value={draft()} onChange={setDraft} onBlur={confirmAdd} onPressEnter={confirmAdd} ref={el => requestAnimationFrame(() => el.focus())} />
    </Show>
  </div>
}
