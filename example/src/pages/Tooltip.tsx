import { type Component, createSignal } from 'solid-js'
import { Tooltip, Divider, Button, Space } from 'upthrust-ui'

const TooltipPage: Component = () => {
  const [open, setOpen] = createSignal(false)

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Tooltip 文字提示</h2>
      <p class="text-on-surface-variant mb-6">简单的文字提示气泡。默认悬停触发、显示在上方，深色背景适配明暗主题。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <Space size="middle">
        <Tooltip title="默认提示（上方）">
          <Button>悬停我</Button>
        </Tooltip>
        <Tooltip title="这条提示文本很长，可以自动换行，最大宽度 250px，超出部分会折行显示">
          <Button variant="outlined">长文本提示</Button>
        </Tooltip>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">位置（12 种方向）</h3>
      <div class="flex flex-wrap gap-4">
        <Tooltip title="上左" placement="topLeft"><Button variant="outlined">TL</Button></Tooltip>
        <Tooltip title="上中" placement="top"><Button variant="outlined">Top</Button></Tooltip>
        <Tooltip title="上右" placement="topRight"><Button variant="outlined">TR</Button></Tooltip>
        <Tooltip title="下左" placement="bottomLeft"><Button variant="outlined">BL</Button></Tooltip>
        <Tooltip title="下中" placement="bottom"><Button variant="outlined">Bottom</Button></Tooltip>
        <Tooltip title="下右" placement="bottomRight"><Button variant="outlined">BR</Button></Tooltip>
      </div>
      <div class="flex flex-wrap gap-4 mt-4">
        <Tooltip title="左上" placement="leftTop"><Button variant="outlined">LT</Button></Tooltip>
        <Tooltip title="左中" placement="left"><Button variant="outlined">Left</Button></Tooltip>
        <Tooltip title="左下" placement="leftBottom"><Button variant="outlined">LB</Button></Tooltip>
        <Tooltip title="右上" placement="rightTop"><Button variant="outlined">RT</Button></Tooltip>
        <Tooltip title="右中" placement="right"><Button variant="outlined">Right</Button></Tooltip>
        <Tooltip title="右下" placement="rightBottom"><Button variant="outlined">RB</Button></Tooltip>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">触发方式</h3>
      <Space size="middle">
        <Tooltip title="悬停触发（默认）" trigger="hover">
          <Button>hover</Button>
        </Tooltip>
        <Tooltip title="点击触发" trigger="click">
          <Button>click</Button>
        </Tooltip>
        <Tooltip title="聚焦触发" trigger="focus">
          <Button variant="outlined">focus</Button>
        </Tooltip>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">受控模式</h3>
      <Space size="middle">
        <Button variant={open() ? 'solid' : 'outlined'} onClick={() => setOpen(!open())}>
          {open() ? '隐藏' : '显示'}提示
        </Button>
        <Tooltip title="受控打开的提示" open={open()} onOpenChange={setOpen}>
          <Button variant="outlined">受控触发器</Button>
        </Tooltip>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">禁用与延迟</h3>
      <Space size="middle">
        <Tooltip title="这条提示永远不会出现" disabled>
          <Button disabled>禁用触发器</Button>
        </Tooltip>
        <Tooltip title="悬停 500ms 后才显示" mouseEnterDelay={500}>
          <Button variant="outlined">延迟打开</Button>
        </Tooltip>
        <Tooltip title="离开 800ms 后才隐藏" mouseLeaveDelay={800}>
          <Button variant="outlined">延迟关闭</Button>
        </Tooltip>
      </Space>
    </div>
  )
}

export default TooltipPage
