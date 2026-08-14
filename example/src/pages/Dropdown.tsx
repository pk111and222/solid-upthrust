import { type Component } from 'solid-js'
import { Dropdown, Divider } from 'upthrust-ui'

const DropdownPage: Component = () => {
  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Dropdown 下拉菜单</h2>
      <p class="text-gray-600 mb-6">向下弹出的列表。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用（悬停触发）</h3>
      <Dropdown
        menu={{
          items: [
            { key: '1', label: '菜单项一' },
            { key: '2', label: '菜单项二' },
            { key: '3', label: '菜单项三' },
          ],
          onClick: (key) => console.log('clicked:', key),
        }}
      >
        <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          悬停显示菜单
        </button>
      </Dropdown>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">点击触发</h3>
      <Dropdown
        trigger="click"
        menu={{
          items: [
            { key: '1', label: '操作一', icon: 'i-mdi-pencil' },
            { key: '2', label: '操作二', icon: 'i-mdi-content-copy' },
            { key: 'divider', label: '', type: 'divider' },
            { key: '3', label: '删除', icon: 'i-mdi-delete', danger: true },
          ],
        }}
      >
        <button class="px-4 py-2 border border-gray-300 rounded hover:border-blue-500 transition-colors">
          点击显示菜单 <span class="i-mdi-chevron-down align-middle" />
        </button>
      </Dropdown>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">带图标</h3>
      <Dropdown
        menu={{
          items: [
            { key: '1', label: '编辑', icon: 'i-mdi-pencil' },
            { key: '2', label: '复制', icon: 'i-mdi-content-copy' },
            { key: '3', label: '分享', icon: 'i-mdi-share-variant' },
          ],
        }}
      >
        <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
          更多操作 <span class="i-mdi-chevron-down align-middle" />
        </button>
      </Dropdown>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">禁用项</h3>
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
        <button class="px-4 py-2 border border-gray-300 rounded">
          包含禁用项
        </button>
      </Dropdown>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">不同位置</h3>
      <div class="flex gap-4 flex-wrap">
        <Dropdown
          placement="bottomLeft"
          trigger="click"
          menu={{ items: [{ key: '1', label: 'bottomLeft' }] }}
        >
          <button class="px-3 py-1 border rounded text-sm">bottomLeft</button>
        </Dropdown>
        <Dropdown
          placement="bottomRight"
          trigger="click"
          menu={{ items: [{ key: '1', label: 'bottomRight' }] }}
        >
          <button class="px-3 py-1 border rounded text-sm">bottomRight</button>
        </Dropdown>
        <Dropdown
          placement="topLeft"
          trigger="click"
          menu={{ items: [{ key: '1', label: 'topLeft' }] }}
        >
          <button class="px-3 py-1 border rounded text-sm">topLeft</button>
        </Dropdown>
        <Dropdown
          placement="topRight"
          trigger="click"
          menu={{ items: [{ key: '1', label: 'topRight' }] }}
        >
          <button class="px-3 py-1 border rounded text-sm">topRight</button>
        </Dropdown>
      </div>
    </div>
  )
}

export default DropdownPage
