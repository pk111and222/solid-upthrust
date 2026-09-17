import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import Popover from 'upthrust-ui/source/Popover'

export default function Demo() {
  const [clicks, setClicks] = createSignal(0)

  return <Space size="middle">
    <Popover
      title="卡片标题"
      content={<div>
        <p class="m-0">这是一段卡片内容，可以放置任意元素。</p>
        <Button size="small" variant="outlined" onClick={() => setClicks(clicks() + 1)}>
          点了 {clicks()} 次
        </Button>
      </div>}
    >
      <Button>悬停查看卡片</Button>
    </Popover>
    <Popover content="只有内容没有标题的卡片">
      <Button variant="outlined">无标题</Button>
    </Popover>
    <Popover>
      <Button variant="outlined">title/content 都为空，不会打开</Button>
    </Popover>
  </Space>
}
