import { type Component, createSignal } from 'solid-js'
import { Menu, Divider } from 'upthrust-ui'

const MenuPage: Component = () => {
  const [selected, setSelected] = createSignal<string[]>(['1'])

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Menu 导航菜单</h2>
      <p class="text-gray-600 mb-6">为页面和功能提供导航的菜单列表。</p>

      <h3 class="text-lg font-semibold mb-3">垂直菜单</h3>
      <div class="w-60 border border-gray-200 rounded-lg p-2">
        <Menu
          items={[
            { key: '1', label: '导航一', icon: 'i-mdi-home' },
            { key: '2', label: '导航二', icon: 'i-mdi-inbox' },
            { key: 'sub1', label: '导航三 - 子菜单', icon: 'i-mdi-cog', children: [
              { key: '3', label: '选项一' },
              { key: '4', label: '选项二' },
              { key: '5', label: '选项三' },
            ]},
            { key: '6', label: '导航四', icon: 'i-mdi-account' },
          ]}
          selectedKeys={selected()}
          onSelect={({ selectedKeys }) => setSelected(selectedKeys)}
          defaultOpenKeys={['sub1']}
        />
      </div>
      <p class="mt-2 text-sm text-gray-500">当前选中: {selected().join(', ')}</p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">水平菜单</h3>
      <Menu
        mode="horizontal"
        items={[
          { key: 'h1', label: '首页', icon: 'i-mdi-home' },
          { key: 'h2', label: '文档', icon: 'i-mdi-file-document' },
          { key: 'h3', label: '组件', icon: 'i-mdi-puzzle' },
          { key: 'h4', label: '关于', icon: 'i-mdi-information' },
        ]}
        defaultSelectedKeys={['h1']}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">分组和分割线</h3>
      <div class="w-60 border border-gray-200 rounded-lg p-2">
        <Menu
          items={[
            { key: 'g1', label: '分组1', type: 'group', children: [
              { key: '1', label: '选项一' },
              { key: '2', label: '选项二' },
            ]},
            { key: 'd1', label: '', type: 'divider' },
            { key: 'g2', label: '分组2', type: 'group', children: [
              { key: '3', label: '选项三' },
              { key: '4', label: '选项四' },
            ]},
          ]}
        />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">禁用与危险项</h3>
      <div class="w-60 border border-gray-200 rounded-lg p-2">
        <Menu
          items={[
            { key: '1', label: '正常项' },
            { key: '2', label: '禁用项', disabled: true },
            { key: '3', label: '危险项', danger: true },
            { key: '4', label: '正常项' },
          ]}
        />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">多级嵌套</h3>
      <div class="w-64 border border-gray-200 rounded-lg p-2">
        <Menu
          items={[
            { key: '1', label: '用户管理', icon: 'i-mdi-account-group', children: [
              { key: '1-1', label: '用户列表' },
              { key: '1-2', label: '角色管理', children: [
                { key: '1-2-1', label: '管理员' },
                { key: '1-2-2', label: '普通用户' },
              ]},
            ]},
            { key: '2', label: '系统设置', icon: 'i-mdi-cog', children: [
              { key: '2-1', label: '基本设置' },
              { key: '2-2', label: '安全设置' },
            ]},
            { key: '3', label: '帮助', icon: 'i-mdi-help-circle' },
          ]}
          defaultOpenKeys={['1']}
        />
      </div>
    </div>
  )
}

export default MenuPage
