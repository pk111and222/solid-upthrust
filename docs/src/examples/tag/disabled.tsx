import { createSignal } from 'solid-js'
import Tag, { CheckableTag } from 'upthrust-ui/source/Tag'

export default function Disabled() {
  const [selected, setSelected] = createSignal(['图书'])
  const [message, setMessage] = createSignal('')
  return <div class="flex flex-col gap-3">
    <div class="flex flex-wrap gap-2">
      <Tag disabled>基础标签</Tag>
      <Tag disabled><a href="https://ant.design">链接子元素</a></Tag>
      <Tag disabled href="https://ant.design">href 标签</Tag>
      <Tag disabled color="success" icon={<span class="i-mdi-check-circle-outline" />}>图标标签</Tag>
    </div>
    <div class="flex flex-wrap gap-2">
      <Tag disabled color="red">预设红色</Tag>
      <Tag disabled color="#f50">自定义 #f50</Tag>
      <Tag disabled color="#f50" variant="solid">自定义实心</Tag>
      <Tag disabled color="#f50" variant="outlined">自定义描边</Tag>
      <Tag disabled color="success">预设状态</Tag>
    </div>
    <div class="flex flex-wrap gap-2">
      {['图书', '电影', '音乐'].map(tag => <CheckableTag disabled checked={selected().includes(tag)} onChange={checked => setSelected(checked ? [...selected(), tag] : selected().filter(item => item !== tag))}>{tag}</CheckableTag>)}
    </div>
    <div class="flex flex-wrap gap-2">
      <Tag disabled closable onClose={() => setMessage('已关闭')}>可关闭</Tag>
      <Tag disabled closable color="blue" variant="solid" onClose={() => setMessage('已关闭')}>实心可关闭</Tag>
    </div>
    <p class="m-0 text-sm text-on-surface-variant" role="status">{message() || '禁用标签不会关闭，也不会切换'}</p>
  </div>
}
