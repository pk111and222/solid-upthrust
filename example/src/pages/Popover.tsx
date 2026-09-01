import { type Component, createSignal } from 'solid-js'
import { Popover, Divider, Button, Space } from 'upthrust-ui'

const PopoverPage: Component = () => {
  const [open, setOpen] = createSignal(false)
  const [clicks, setClicks] = createSignal(0)

  const content = (
    <div>
      <p class="m-0">这是一段卡片内容，可以放置任意元素。</p>
      <p class="m-0">点击按钮会更新计数：</p>
      <Button size="small" variant="outlined" onClick={() => setClicks(clicks() + 1)}>
        点了 {clicks()} 次
      </Button>
    </div>
  )

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Popover 气泡卡片</h2>
      <p class="text-on-surface-variant mb-6">点击/悬停浮出的卡片容器，可承载标题与任意内容。底层直接复用 createTrigger 浮层机制。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用（悬停触发）</h3>
      <Space size="middle">
        <Popover title="卡片标题" content={content}>
          <Button>悬停查看卡片</Button>
        </Popover>
        <Popover content="只有内容没有标题的卡片">
          <Button variant="outlined">无标题</Button>
        </Popover>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">位置</h3>
      <div class="flex flex-wrap gap-4">
        <Popover title="上左" content="topLeft" placement="topLeft"><Button variant="outlined">TL</Button></Popover>
        <Popover title="上中" content="top" placement="top"><Button variant="outlined">Top</Button></Popover>
        <Popover title="上右" content="topRight" placement="topRight"><Button variant="outlined">TR</Button></Popover>
        <Popover title="下左" content="bottomLeft" placement="bottomLeft"><Button variant="outlined">BL</Button></Popover>
        <Popover title="下中" content="bottom" placement="bottom"><Button variant="outlined">Bottom</Button></Popover>
        <Popover title="下右" content="bottomRight" placement="bottomRight"><Button variant="outlined">BR</Button></Popover>
        <Popover title="左上" content="leftTop" placement="leftTop"><Button variant="outlined">LT</Button></Popover>
        <Popover title="左中" content="left" placement="left"><Button variant="outlined">Left</Button></Popover>
        <Popover title="左下" content="leftBottom" placement="leftBottom"><Button variant="outlined">LB</Button></Popover>
        <Popover title="右上" content="rightTop" placement="rightTop"><Button variant="outlined">RT</Button></Popover>
        <Popover title="右中" content="right" placement="right"><Button variant="outlined">Right</Button></Popover>
        <Popover title="右下" content="rightBottom" placement="rightBottom"><Button variant="outlined">RB</Button></Popover>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">触发方式</h3>
      <Space size="middle">
        <Popover title="悬停触发" content="鼠标移入卡片区域不会关闭" trigger="hover">
          <Button>hover</Button>
        </Popover>
        <Popover title="点击触发" content="点击外部或按 Esc 关闭" trigger="click">
          <Button>click</Button>
        </Popover>
        <Popover title="聚焦触发" content="focus" trigger="focus">
          <Button variant="outlined">focus</Button>
        </Popover>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">受控模式</h3>
      <Space size="middle">
        <Button variant={open() ? 'solid' : 'outlined'} onClick={() => setOpen(!open())}>
          {open() ? '关闭' : '打开'}卡片
        </Button>
        <Popover title="受控卡片" content="由外部信号控制开关" open={open()} onOpenChange={setOpen} trigger="click">
          <Button variant="outlined">受控触发器</Button>
        </Popover>
      </Space>
    </div>
  )
}

export default PopoverPage
