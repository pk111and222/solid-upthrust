import { type Component, createSignal } from 'solid-js'
import { Dropdown, Divider, Button } from 'upthrust-ui'

const DropdownPage: Component = () => {
  const [open, setOpen] = createSignal(false)
  const [lastAction, setLastAction] = createSignal('（未操作）')

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Dropdown 下拉菜单</h2>
      <p class="text-on-surface-variant mb-6">向下弹出的列表。支持悬停/点击/右键触发，菜单展开后可用 ↑↓ 导航、Enter 选中、Esc 关闭。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用（悬停触发）</h3>
      <Dropdown
        menu={{
          items: [
            { key: '1', label: '菜单项一' },
            { key: '2', label: '菜单项二' },
            { key: '3', label: '菜单项三' },
          ],
          onClick: (key) => setLastAction(`点击了 ${key}`),
        }}
      >
        <Button>悬停显示菜单</Button>
      </Dropdown>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">点击触发（支持键盘导航）</h3>
      <Dropdown
        trigger="click"
        menu={{
          items: [
            { key: 'edit', label: '编辑', icon: 'i-mdi-pencil' },
            { key: 'copy', label: '复制', icon: 'i-mdi-content-copy' },
            { key: 'divider', label: '', type: 'divider' },
            { key: 'delete', label: '删除', icon: 'i-mdi-delete', danger: true },
          ],
          onClick: (key) => setLastAction(`${key}（键盘或点击）`),
        }}
      >
        <Button variant="outlined">点击显示菜单 <span class="i-mdi-chevron-down align-middle" /></Button>
      </Dropdown>
      <p class="mt-2 text-sm text-on-surface-variant">最近操作：{lastAction()}</p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">右键菜单</h3>
      <div class="h-24 rounded-lg border border-dashed border-outline-variant flex items-center justify-center text-on-surface-variant select-none">
        <Dropdown
          trigger="contextMenu"
          menu={{
            items: [
              { key: 'refresh', label: '刷新', icon: 'i-mdi-refresh' },
              { key: 'pin', label: '置顶', icon: 'i-mdi-pin' },
            ],
            onClick: (key) => setLastAction(`右键菜单 ${key}`),
          }}
        >
          <span class="px-4 py-2">在此区域点击右键</span>
        </Dropdown>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">受控模式</h3>
      <div class="flex gap-2 items-center">
        <Button variant={open() ? 'solid' : 'outlined'} onClick={() => setOpen(!open())}>
          {open() ? '关闭' : '展开'}菜单
        </Button>
        <Dropdown
          open={open()}
          onOpenChange={setOpen}
          trigger="click"
          menu={{
            items: [
              { key: '1', label: '受控菜单项一' },
              { key: '2', label: '受控菜单项二' },
            ],
            onClick: () => setOpen(false),
          }}
        >
          <Button variant="outlined">受控触发器</Button>
        </Dropdown>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">禁用项与禁用触发器</h3>
      <div class="flex gap-4">
        <Dropdown
          trigger="click"
          menu={{
            items: [
              { key: '1', label: '可用项' },
              { key: '2', label: '禁用项', disabled: true },
              { key: '3', label: '可用项' },
            ],
          }}
        >
          <Button variant="outlined">包含禁用项</Button>
        </Dropdown>
        <Dropdown
          disabled
          menu={{ items: [{ key: '1', label: '不应出现' }] }}
        >
          <Button variant="outlined" disabled>禁用触发器</Button>
        </Dropdown>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">不同位置</h3>
      <div class="flex gap-4 flex-wrap">
        <Dropdown placement="bottomLeft" trigger="click" menu={{ items: [{ key: '1', label: 'bottomLeft' }] }}>
          <Button size="small" variant="outlined">bottomLeft</Button>
        </Dropdown>
        <Dropdown placement="bottomRight" trigger="click" menu={{ items: [{ key: '1', label: 'bottomRight' }] }}>
          <Button size="small" variant="outlined">bottomRight</Button>
        </Dropdown>
        <Dropdown placement="topLeft" trigger="click" menu={{ items: [{ key: '1', label: 'topLeft' }] }}>
          <Button size="small" variant="outlined">topLeft</Button>
        </Dropdown>
        <Dropdown placement="topRight" trigger="click" menu={{ items: [{ key: '1', label: 'topRight' }] }}>
          <Button size="small" variant="outlined">topRight</Button>
        </Dropdown>
      </div>

      <div class="mt-8" />

      <h3 class="text-lg font-semibold mb-3">弹出位置演示</h3>
      <div class="flex flex-col gap-16 py-4">
        <Dropdown placement="bottom" trigger="click" menu={{ items: [{ key: '1', label: 'bottom 居中' }] }}>
          <Button variant="outlined">placement="bottom"</Button>
        </Dropdown>
      </div>
    </div>
  )
}

export default DropdownPage
