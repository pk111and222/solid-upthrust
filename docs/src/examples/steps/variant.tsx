import Steps from 'upthrust-ui/source/Steps'

const items = [
  { title: '已完成' },
  { title: '出错了', status: 'error' as const },
  { title: '进行中', status: 'process' as const },
  { title: '待处理' },
]

export default function Variant() {
  // filled（默认）为浅色底图标，outlined 为描边图标。
  return <div class="flex flex-col gap-lg">
    <div data-case="filled"><Steps current={2} items={items} /></div>
    <div data-case="outlined"><Steps variant="outlined" current={2} items={items} /></div>
  </div>
}
