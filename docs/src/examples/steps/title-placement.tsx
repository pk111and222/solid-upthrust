import Steps from 'upthrust-ui/source/Steps'

const content = '这是一段步骤描述。'
const items = [
  { title: '已完成', content },
  { title: '进行中', content },
  { title: '待处理', content },
]

export default function TitlePlacement() {
  // 标题位于图标下方居中。
  return <div class="flex flex-col gap-lg">
    <div data-case="default"><Steps titlePlacement="vertical" current={1} items={items} /></div>
    <div data-case="small"><Steps titlePlacement="vertical" size="small" current={1} items={items} /></div>
  </div>
}
