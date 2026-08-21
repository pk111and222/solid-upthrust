import { type Component, createSignal, Show } from 'solid-js'
import { Tabs, Divider, Button, Space } from 'upthrust-ui'

const Content = (props: { text: string }) => (
  <div class="pt-4 text-on-surface-variant">{props.text}</div>
)

const TabsPage: Component = () => {
  const [activeKey, setActiveKey] = createSignal('1')
  const [posKey, setPosKey] = createSignal('1')
  const [addCount, setAddCount] = createSignal(2)
  const [closableKeys, setClosableKeys] = createSignal(['1', '2', '3'])
  const [closeActive, setCloseActive] = createSignal('1')

  const dynamicItems = () => {
    const items = Array.from({ length: addCount() }, (_, i) => ({
      key: `${i + 1}`,
      label: `选项卡 ${i + 1}`,
      children: <Content text={`选项卡 ${i + 1} 的内容`} />,
    }))
    if (activeKey() === 'add') {
      // keep TypeScript happy; never reached
    }
    return items
  }

  const closableItems = () => closableKeys().map((key) => ({
    key,
    label: `${key === '1' ? '首页' : `标签 ${key}`}`,
    children: <Content text={`标签 ${key} 的内容`} />,
  }))

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Tabs 标签页</h2>
      <p class="text-on-surface-variant mb-6">
        选项卡切换组件。线条式带滑动指示条（ink bar），卡片式造型。
      </p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <Tabs
        items={[
          { key: '1', label: '选项卡一', children: <Content text="选项卡一的内容" /> },
          { key: '2', label: '选项卡二', children: <Content text="选项卡二的内容" /> },
          { key: '3', label: '选项卡三', children: <Content text="选项卡三的内容" /> },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">受控模式</h3>
      <Tabs
        activeKey={activeKey()}
        onChange={setActiveKey}
        items={[
          { key: '1', label: '标签一', children: <Content text={`内容一：当前选中 ${activeKey()}`} /> },
          { key: '2', label: '标签二', children: <Content text={`内容二：当前选中 ${activeKey()}`} /> },
          { key: '3', label: '标签三', children: <Content text={`内容三：当前选中 ${activeKey()}`} /> },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">禁用标签</h3>
      <Tabs
        items={[
          { key: '1', label: '可用', children: <Content text="可用标签的内容" /> },
          { key: '2', label: '禁用', disabled: true, children: <Content text="禁用标签的内容" /> },
          { key: '3', label: '可用', children: <Content text="另一个可用标签的内容" /> },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">带图标</h3>
      <Tabs
        items={[
          { key: '1', label: '首页', icon: 'i-mdi-home', children: <Content text="首页内容" /> },
          { key: '2', label: '设置', icon: 'i-mdi-cog', children: <Content text="设置内容" /> },
          { key: '3', label: '用户', icon: 'i-mdi-account', children: <Content text="用户内容" /> },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">卡片类型</h3>
      <Tabs
        type="card"
        items={[
          { key: '1', label: '选项卡一', children: <Content text="卡片选项卡一的内容" /> },
          { key: '2', label: '选项卡二', children: <Content text="卡片选项卡二的内容" /> },
          { key: '3', label: '选项卡三', children: <Content text="卡片选项卡三的内容" /> },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">卡片 + 左右位置</h3>
      <div class="flex flex-col gap-4">
        <Tabs
          type="card"
          tabPosition="left"
          items={[
            { key: '1', label: '菜单一', children: <Content text="左侧卡片菜单一的内容" /> },
            { key: '2', label: '菜单二', children: <Content text="左侧卡片菜单二的内容" /> },
            { key: '3', label: '菜单三', children: <Content text="左侧卡片菜单三的内容" /> },
          ]}
        />
        <Tabs
          type="card"
          tabPosition="right"
          items={[
            { key: '1', label: '菜单一', children: <Content text="右侧卡片菜单一的内容" /> },
            { key: '2', label: '菜单二', children: <Content text="右侧卡片菜单二的内容" /> },
          ]}
        />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">尺寸</h3>
      <p class="text-sm text-on-surface-variant mb-2">Small：</p>
      <Tabs
        size="small"
        items={[
          { key: '1', label: '选项卡一', children: <Content text="小尺寸内容" /> },
          { key: '2', label: '选项卡二', children: <Content text="小尺寸内容二" /> },
        ]}
      />
      <p class="text-sm text-on-surface-variant mb-2 mt-4">Large：</p>
      <Tabs
        size="large"
        items={[
          { key: '1', label: '选项卡一', children: <Content text="大尺寸内容" /> },
          { key: '2', label: '选项卡二', children: <Content text="大尺寸内容二" /> },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">四个位置</h3>
      <Tabs
        activeKey={posKey()}
        onChange={(k) => { setPosKey(k); }}
        tabPosition="bottom"
        items={[
          { key: '1', label: '选项卡一', children: <Content text="底部位置：指示条在标签上方" /> },
          { key: '2', label: '选项卡二', children: <Content text="切到底部后 ink bar 朝上" /> },
        ]}
      />
      <div class="mt-6">
        <Tabs
          activeKey={posKey()}
          onChange={(k) => setPosKey(k)}
          tabPosition="left"
          items={[
            { key: '1', label: '左侧一', children: <Content text="左侧位置：指示条贴右缘" /> },
            { key: '2', label: '左侧二', children: <Content text="ink bar 垂直滑动" /> },
            { key: '3', label: '左侧三', children: <Content text="高度随标签变化" /> },
          ]}
        />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">居中</h3>
      <Tabs
        centered
        items={[
          { key: '1', label: '选项一', children: <Content text="居中的选项卡内容一" /> },
          { key: '2', label: '选项二', children: <Content text="居中的选项卡内容二" /> },
          { key: '3', label: '选项三', children: <Content text="居中的选项卡内容三" /> },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">懒渲染（destroyInactiveTabPane）</h3>
      <Tabs
        destroyInactiveTabPane
        items={[
          { key: '1', label: '保留状态', children: <Content text="切走再回来，这个面板会被销毁重建（状态丢失）" /> },
          { key: '2', label: '懒挂载', children: <Content text="这个面板只有在首次激活时才会挂载" /> },
        ]}
      />
      <p class="mt-2 text-sm text-on-surface-variant">
        默认模式下所有面板都会渲染（display 切换），保留各自内部状态。
      </p>
    </div>
  )
}

export default TabsPage
