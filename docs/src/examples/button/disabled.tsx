import Button from 'upthrust-ui/source/Button'

export default function Demo() {
  return <div class="flex flex-wrap gap-3"><Button disabled>禁用按钮</Button><Button disabled href="#examples">禁用链接</Button><Button disabled loading danger>禁用且加载</Button></div>
}
