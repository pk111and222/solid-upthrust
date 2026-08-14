import { type Component, createSignal } from 'solid-js'
import { Tabs, Divider } from 'upthrust-ui'

const TabsPage: Component = () => {
  const [activeKey, setActiveKey] = createSignal('1')

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Tabs 标签页</h2>
      <p class="text-gray-600 mb-6">选项卡切换组件。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <Tabs
        items={[
          { key: '1', label: '选项卡1', children: <p>选项卡1的内容</p> },
          { key: '2', label: '选项卡2', children: <p>选项卡2的内容</p> },
          { key: '3', label: '选项卡3', children: <p>选项卡3的内容</p> },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">受控模式</h3>
      <Tabs
        activeKey={activeKey()}
        onChange={setActiveKey}
        items={[
          { key: '1', label: '标签一', children: <p>内容一：当前选中 {activeKey()}</p> },
          { key: '2', label: '标签二', children: <p>内容二：当前选中 {activeKey()}</p> },
          { key: '3', label: '标签三', children: <p>内容三：当前选中 {activeKey()}</p> },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">禁用标签</h3>
      <Tabs
        items={[
          { key: '1', label: '可用', children: <p>可用标签的内容</p> },
          { key: '2', label: '禁用', disabled: true, children: <p>禁用标签的内容</p> },
          { key: '3', label: '可用', children: <p>另一个可用标签的内容</p> },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">带图标</h3>
      <Tabs
        items={[
          { key: '1', label: '首页', icon: 'i-mdi-home', children: <p>首页内容</p> },
          { key: '2', label: '设置', icon: 'i-mdi-cog', children: <p>设置内容</p> },
          { key: '3', label: '用户', icon: 'i-mdi-account', children: <p>用户内容</p> },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">卡片类型</h3>
      <Tabs
        type="card"
        items={[
          { key: '1', label: '选项卡1', children: <p>卡片选项卡1的内容</p> },
          { key: '2', label: '选项卡2', children: <p>卡片选项卡2的内容</p> },
          { key: '3', label: '选项卡3', children: <p>卡片选项卡3的内容</p> },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">尺寸</h3>
      <p class="text-sm text-gray-500 mb-2">Small:</p>
      <Tabs
        size="small"
        items={[
          { key: '1', label: 'Tab 1', children: <p>Small tab content</p> },
          { key: '2', label: 'Tab 2', children: <p>Small tab content 2</p> },
        ]}
      />
      <p class="text-sm text-gray-500 mb-2 mt-4">Large:</p>
      <Tabs
        size="large"
        items={[
          { key: '1', label: 'Tab 1', children: <p>Large tab content</p> },
          { key: '2', label: 'Tab 2', children: <p>Large tab content 2</p> },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">居中</h3>
      <Tabs
        centered
        items={[
          { key: '1', label: '选项一', children: <p>居中的选项卡内容1</p> },
          { key: '2', label: '选项二', children: <p>居中的选项卡内容2</p> },
          { key: '3', label: '选项三', children: <p>居中的选项卡内容3</p> },
        ]}
      />
    </div>
  )
}

export default TabsPage
