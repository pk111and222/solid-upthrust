import Tag from 'upthrust-ui/source/Tag'

export default function Customize() {
  return <div class="flex flex-wrap items-center gap-2">
    <Tag closable closeIcon="关闭">标签一</Tag>
    <Tag closable closeIcon={<span class="i-mdi-close-circle-outline" />}>标签二</Tag>
    <Tag closable closeLabel="移除筛选条件" variant="outlined" color="blue">自定义无障碍名称</Tag>
  </div>
}
