import { type Component, createSignal } from 'solid-js'
import { Popconfirm, Divider, Button, Space, Typography } from 'upthrust-ui'

const { Text } = Typography

const PopconfirmPage: Component = () => {
  const [lastAction, setLastAction] = createSignal('（未操作）')
  const [open, setOpen] = createSignal(false)

  // 模拟异步确认：onConfirm 返回 Promise 时确认按钮进入 loading，
  // Promise 结束后气泡自动关闭。
  const asyncConfirm = () =>
    new Promise<void>((resolve) => setTimeout(resolve, 1500))

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Popconfirm 气泡确认框</h2>
      <p class="text-on-surface-variant mb-6">点击元素弹出气泡式的确认框。点击确认或取消前的谨慎操作，常用于删除等危险动作的二次确认。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <Space size="middle">
        <Popconfirm
          title="确定删除这个任务吗？"
          onConfirm={() => { setLastAction(() => '确认删除') }}
          onCancel={() => { setLastAction(() => '取消删除') }}
        >
          <Button danger>删除</Button>
        </Popconfirm>
        <Popconfirm title="确定提交表单吗？" onConfirm={() => { setLastAction(() => '确认提交') }}>
          <Button variant="outlined">提交</Button>
        </Popconfirm>
      </Space>
      <p class="mt-2 text-sm text-on-surface-variant">最近操作：{lastAction()}</p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">描述文本与自定义按钮</h3>
      <Space size="middle">
        <Popconfirm
          title="确定删除这条记录吗？"
          description="删除后无法恢复，请谨慎操作。"
          okText="确认删除"
          cancelText="再想想"
          okButtonProps={{ danger: true }}
          onConfirm={() => { setLastAction(() => '删除了记录') }}
        >
          <Button danger variant="outlined">带描述的确认</Button>
        </Popconfirm>
        <Popconfirm title="隐藏图标的确认框" icon={false} onConfirm={() => { setLastAction(() => '无图标确认') }}>
          <Button variant="outlined">无图标</Button>
        </Popconfirm>
        <Popconfirm
          title="确定操作吗？"
          icon={<span class="i-mdi-alert text-[16px] text-error" />}
          onConfirm={() => { setLastAction(() => '自定义图标确认') }}
        >
          <Button variant="outlined">自定义图标</Button>
        </Popconfirm>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">异步确认（loading）</h3>
      <Popconfirm
        title="该操作需要一点时间"
        description="点击确定后按钮进入 loading，1.5 秒后自动关闭。"
        onConfirm={asyncConfirm}
      >
        <Button>异步确认</Button>
      </Popconfirm>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">位置</h3>
      <div class="flex flex-wrap gap-4">
        <Popconfirm title="上左" placement="topLeft" onConfirm={() => { setLastAction(() => 'TL') }}><Button variant="outlined">TL</Button></Popconfirm>
        <Popconfirm title="上中" placement="top" onConfirm={() => { setLastAction(() => 'Top') }}><Button variant="outlined">Top</Button></Popconfirm>
        <Popconfirm title="上右" placement="topRight" onConfirm={() => { setLastAction(() => 'TR') }}><Button variant="outlined">TR</Button></Popconfirm>
        <Popconfirm title="下左" placement="bottomLeft" onConfirm={() => { setLastAction(() => 'BL') }}><Button variant="outlined">BL</Button></Popconfirm>
        <Popconfirm title="下中" placement="bottom" onConfirm={() => { setLastAction(() => 'Bottom') }}><Button variant="outlined">Bottom</Button></Popconfirm>
        <Popconfirm title="下右" placement="bottomRight" onConfirm={() => { setLastAction(() => 'BR') }}><Button variant="outlined">BR</Button></Popconfirm>
        <Popconfirm title="左上" placement="leftTop" onConfirm={() => { setLastAction(() => 'LT') }}><Button variant="outlined">LT</Button></Popconfirm>
        <Popconfirm title="左中" placement="left" onConfirm={() => { setLastAction(() => 'Left') }}><Button variant="outlined">Left</Button></Popconfirm>
        <Popconfirm title="右上" placement="rightTop" onConfirm={() => { setLastAction(() => 'RT') }}><Button variant="outlined">RT</Button></Popconfirm>
        <Popconfirm title="右下" placement="rightBottom" onConfirm={() => { setLastAction(() => 'RB') }}><Button variant="outlined">RB</Button></Popconfirm>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">受控模式</h3>
      <Space size="middle">
        <Button variant={open() ? 'solid' : 'outlined'} onClick={() => setOpen(!open())}>
          {open() ? '关闭' : '打开'}确认框
        </Button>
        <Popconfirm
          title="受控确认框"
          open={open()}
          onOpenChange={setOpen}
          onConfirm={() => { setLastAction(() => '受控确认'); setOpen(false) }}
        >
          <Button variant="outlined">受控触发器</Button>
        </Popconfirm>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">禁用</h3>
      <Popconfirm title="永远看不到" disabled onConfirm={() => { setLastAction(() => '不会发生') }}>
        <Button disabled>禁用的确认框</Button>
      </Popconfirm>
      <p class="mt-2">
        <Text type="secondary">禁用状态下点击不会弹出确认框。</Text>
      </p>
    </div>
  )
}

export default PopconfirmPage
