import Tag from 'upthrust-ui/source/Tag'

export default function Basic() {
  return <div class="flex flex-wrap items-center gap-2">
    <Tag>标签一</Tag>
    <Tag><a href="https://github.com/ant-design/ant-design/issues/1862" target="_blank" rel="noopener noreferrer">链接</a></Tag>
    <Tag closeIcon onClose={event => event.preventDefault()}>阻止关闭</Tag>
    <Tag closeIcon={<span class="i-mdi-close-circle-outline" />}>标签二</Tag>
    <Tag closable={{ closeIcon: <span class="i-mdi-delete-outline" />, 'aria-label': '删除标签三' }}>标签三</Tag>
    <Tag href="https://ant.design/components/tag-cn" target="_blank">href 标签</Tag>
  </div>
}
