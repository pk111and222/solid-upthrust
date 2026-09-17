import { type Component, createSignal } from 'solid-js'
import { FloatButton, Divider, Typography } from 'upthrust-ui'

const { Text, Title } = Typography

const FloatButtonPage: Component = () => {
  const [, setClicked] = createSignal<string | null>(null)

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">FloatButton 悬浮按钮</h2>
      <p class="text-on-surface-variant mb-6">
        headless createFloatButton 拥有滚动可见性（阈值显隐 + rAF 去抖 + 容器 DI，
        与 createAnchor 同形）和 BackTop 滚顶意图；createFloatButtonGroup 管展开/
        收起（受控镜像）。渲染层 Portal 到 body——position:fixed 在 transformed
        祖先内会被其吞掉，这是必须 portal 的原因。展开方向 up/down/left/right，
        触发器是扇形的视觉基座。
      </p>

      <div class="rounded border border-outline-variant p-6 mb-4">
        <Title level={5}>本页试玩</Title>
        <Text type="secondary">
          右下角已挂了：一个带 tooltip 的纯按钮、一个 BackTop（滚动 400px 出现）、
          一个 Group（direction="up"）。向下滚动页面看 BackTop 显隐。
        </Text>
        <div class="h-[600px]" />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">基础 + tooltip</h3>
      <FloatButton
        icon={<span class="i-mdi-customer-service" />}
        tooltip="客服"
        placement="rt"
        onClick={() => setClicked('service')}
      />

      <h3 class="text-lg font-semibold mb-3 mt-8">BackTop（滚动出现）</h3>
      <FloatButton.BackTop
        visibilityHeight={400}
        placement="rb"
        onClick={() => setClicked('backtop')}
      />

      <h3 class="text-lg font-semibold mb-3 mt-8">Group（up 展开）</h3>
      <FloatButton.Group placement="lt" direction="up">
        <FloatButton icon={<span class="i-mdi-file-document-outline" />} tooltip="文档" onClick={() => setClicked('doc')} />
        <FloatButton icon={<span class="i-mdi-cog-outline" />} tooltip="设置" onClick={() => setClicked('settings')} />
        <FloatButton icon={<span class="i-mdi-help-circle-outline" />} tooltip="帮助" onClick={() => setClicked('help')} />
      </FloatButton.Group>

      <Divider />

      <Title level={5}>API 要点</Title>
      <ul class="list-disc pl-6 text-on-surface-variant text-sm leading-6">
        <li><Text code>backTop</Text>：BackTop 模式（上箭头 + 点击滚顶，阈值默认 400）</li>
        <li><Text code>visibilityHeight</Text>：滚动多少 px 后出现（不设 = 恒显）</li>
        <li><Text code>target</Text>：监听的滚动容器（默认 window）</li>
        <li><Text code>shape</Text>：circle / square；<Text code>placement</Text>：rt/rb/lt/lb</li>
        <li><Text code>FloatButton.Group</Text>：<Text code>direction</Text> up/down/left/right，触发器 + 渐次展开</li>
        <li>compound：<Text code>{'<FloatButton.BackTop />'}</Text>、<Text code>{'<FloatButton.Group>'}</Text>，亦可裸导入 <Text code>BackTop</Text></li>
      </ul>
    </div>
  )
}

export default FloatButtonPage
