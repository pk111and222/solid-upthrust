import Steps from 'upthrust-ui/source/Steps'

const content = '这是一段步骤描述。'
const items = [
  { title: '已完成', content },
  { title: '进行中', content },
  { title: '待处理', content },
]

export default function ProgressDot() {
  return <div class="flex flex-col gap-lg">
    <div data-case="horizontal"><Steps type="dot" current={1} items={items} /></div>
    <div data-case="vertical"><Steps progressDot orientation="vertical" current={1} items={items} /></div>
  </div>
}
