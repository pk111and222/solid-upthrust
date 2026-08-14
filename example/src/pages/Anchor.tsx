import { type Component } from 'solid-js'
import { Anchor, Divider } from 'upthrust-ui'

const AnchorPage: Component = () => {
  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Anchor 锚点</h2>
      <p class="text-gray-600 mb-6">用于跳转到页面指定位置。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <div class="flex gap-8">
        <Anchor
          items={[
            { key: 'section1', href: '#section1', title: '基本用法' },
            { key: 'section2', href: '#section2', title: '静态示例' },
            { key: 'section3', href: '#section3', title: '嵌套锚点', children: [
              { key: 'section3-1', href: '#section3-1', title: '子锚点 1' },
              { key: 'section3-2', href: '#section3-2', title: '子锚点 2' },
            ]},
          ]}
        />
        <div class="flex-1">
          <div id="section1" class="h-40 bg-blue-50 rounded p-4 mb-4">
            <h4 class="font-medium">基本用法</h4>
            <p class="text-sm text-gray-500 mt-2">这是第一个区域的内容</p>
          </div>
          <div id="section2" class="h-40 bg-green-50 rounded p-4 mb-4">
            <h4 class="font-medium">静态示例</h4>
            <p class="text-sm text-gray-500 mt-2">这是第二个区域的内容</p>
          </div>
          <div id="section3" class="h-40 bg-purple-50 rounded p-4 mb-4">
            <h4 class="font-medium">嵌套锚点</h4>
            <p class="text-sm text-gray-500 mt-2">这是第三个区域的内容</p>
          </div>
          <div id="section3-1" class="h-30 bg-purple-50/60 rounded p-4 mb-4 ml-4">
            <h4 class="font-medium">子锚点 1</h4>
          </div>
          <div id="section3-2" class="h-30 bg-purple-50/60 rounded p-4 mb-4 ml-4">
            <h4 class="font-medium">子锚点 2</h4>
          </div>
        </div>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">水平方向</h3>
      <Anchor
        direction="horizontal"
        items={[
          { key: 'h1', href: '#h-section1', title: '部分一' },
          { key: 'h2', href: '#h-section2', title: '部分二' },
          { key: 'h3', href: '#h-section3', title: '部分三' },
        ]}
      />
      <div class="flex gap-4 mt-4">
        <div id="h-section1" class="flex-1 h-24 bg-orange-50 rounded p-3">
          <span class="text-sm">部分一</span>
        </div>
        <div id="h-section2" class="flex-1 h-24 bg-orange-50 rounded p-3">
          <span class="text-sm">部分二</span>
        </div>
        <div id="h-section3" class="flex-1 h-24 bg-orange-50 rounded p-3">
          <span class="text-sm">部分三</span>
        </div>
      </div>
    </div>
  )
}

export default AnchorPage
