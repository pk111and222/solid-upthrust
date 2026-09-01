import { type Component, createSignal } from 'solid-js'
import { Drawer, Button, Space, Divider, Typography } from 'upthrust-ui'

const { Text } = Typography

const DrawerPage: Component = () => {
  const [basicOpen, setBasicOpen] = createSignal(false)
  const [placement, setPlacement] = createSignal<'left' | 'right' | 'top' | 'bottom'>('right')
  const [placementOpen, setPlacementOpen] = createSignal(false)
  const [sizeOpen, setSizeOpen] = createSignal(false)
  const [multiOpen, setMultiOpen] = createSignal(false)
  const [nestedOpen, setNestedOpen] = createSignal(false)
  const [lastAction, setLastAction] = createSignal('（未操作）')

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Drawer 抽屉</h2>
      <p class="text-on-surface-variant mb-6">屏幕边缘滑出的浮层面板，承载与当前上下文相关的任务。四个方向（上/下/左/右）、异步 onClose、多层级抽屉（推开前一层）。与 Modal 共用同一 headless 状态机。</p>

      <h3 class="text-lg font-semibold mb-3">基础用法</h3>
      <Space size="middle" wrap>
        <Button variant="solid" onClick={() => { setBasicOpen(true); setLastAction('打开基础抽屉') }}>打开抽屉</Button>
      </Space>
      <Drawer
        open={basicOpen()}
        title="基础抽屉"
        onClose={() => { setBasicOpen(false); setLastAction('onClose 关闭') }}
        okText="确定"
        cancelText="取消"
        onOk={() => { setBasicOpen(false); setLastAction('onOk 关闭') }}
      >
        <p class="mb-sm">这是一个右侧滑入的抽屉（默认 placement="right"，宽度 378px）。</p>
        <p class="text-on-surface-variant">内容区可滚动；点击遮罩或按 ESC 触发 onClose。</p>
      </Drawer>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">四个方向</h3>
      <Space size="middle" wrap>
        <Button onClick={() => { setPlacement('left'); setPlacementOpen(true) }}>左侧</Button>
        <Button onClick={() => { setPlacement('right'); setPlacementOpen(true) }}>右侧</Button>
        <Button onClick={() => { setPlacement('top'); setPlacementOpen(true) }}>顶部</Button>
        <Button onClick={() => { setPlacement('bottom'); setPlacementOpen(true) }}>底部</Button>
      </Space>
      <Drawer
        open={placementOpen()}
        title={`${placement()} 方向抽屉`}
        placement={placement()}
        onClose={() => { setPlacementOpen(false); setLastAction(`${placement()} 抽屉关闭`) }}
        okText="知道了"
        onOk={() => setPlacementOpen(false)}
      >
        <p>水平方向（left/right）由 width 控制宽度；垂直方向（top/bottom）由 height 控制高度。</p>
      </Drawer>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">尺寸（size / width / height）</h3>
      <Space size="middle" wrap>
        <Button onClick={() => { setSizeOpen(true); setLastAction('打开 large 抽屉') }}>large（736px）</Button>
      </Space>
      <Drawer
        open={sizeOpen()}
        title="large 尺寸"
        size="large"
        onClose={() => setSizeOpen(false)}
        okText="确定"
        onOk={() => setSizeOpen(false)}
      >
        <p>size="large" 宽 736px；也可用 width={600} 或 width="50vw" 直接指定。</p>
      </Drawer>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">多层级抽屉</h3>
      <Space size="middle" wrap>
        <Button onClick={() => { setMultiOpen(true); setLastAction('打开第一层抽屉') }}>打开多级抽屉</Button>
      </Space>
      <Drawer
        open={multiOpen()}
        title="第一层"
        zIndex={1000}
        onClose={() => { setMultiOpen(false); setLastAction('第一层关闭') }}
        footer={null}
      >
        <p class="mb-sm">点击下方按钮在第一层之上再叠一层抽屉。第二层打开时，第一层会被<b>向屏幕内推开 180px</b>（antd 的 push 行为，可传 push={false} 关闭或传数字自定义距离），保持可见而非被完全盖住。</p>
        <Button variant="solid" onClick={() => { setNestedOpen(true); setLastAction('打开第二层抽屉') }}>打开第二层</Button>
      </Drawer>
      <Drawer
        open={nestedOpen()}
        title="第二层"
        zIndex={1010}
        onClose={() => { setNestedOpen(false); setLastAction('第二层关闭') }}
        okText="知道了"
        onOk={() => setNestedOpen(false)}
      >
        <p>第二层抽屉贴右边缘滑入盖住右侧；第一层同时被<b>向屏幕内推开 180px</b>（向左让位、保持可见）。关闭本层后第一层滑回原位。</p>
      </Drawer>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义页脚 / 隐藏页脚</h3>
      <p class="mt-1"><Text type="secondary">footer 传 null 隐藏；传 JSX 替换默认按钮行（与 Modal 同构）。</Text></p>
      <p class="mt-2"><Text type="secondary">最近操作：{lastAction()}</Text></p>
    </div>
  )
}

export default DrawerPage
