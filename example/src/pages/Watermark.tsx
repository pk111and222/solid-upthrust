import { type Component, createSignal } from 'solid-js'
import { Watermark, Divider, Space, Button } from 'upthrust-ui'

const WatermarkPage: Component = () => {
  const [content, setContent] = createSignal('内部文档')
  const [rotate, setRotate] = createSignal(-22)
  const [gap, setGap] = createSignal(120)
  const [opacity, setOpacity] = createSignal(1)

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Watermark 水印</h2>
      <p class="text-on-surface-variant mb-6">在页面上添加文字或图案水印。常用于标识版权、防止信息泄露。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <Watermark content="内部文档">
        <div class="h-48 rounded-lg border border-outline-variant p-4 text-on-surface-variant">
          这是被水印覆盖的内容区域。
        </div>
      </Watermark>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">多行水印</h3>
      <Watermark content={['多行水印', '第二行内容']}>
        <div class="h-48 rounded-lg border border-outline-variant p-4 text-on-surface-variant">
          content 数组渲染多行文本。
        </div>
      </Watermark>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">交互调整参数</h3>
      <Space size="middle" wrap class="mb-4">
        <Button size="small" variant="outlined" onClick={() => setContent(content() === '内部文档' ? '机密 CONFIDENTIAL' : '内部文档')}>
          内容：{content()}
        </Button>
        <Button size="small" variant="outlined" onClick={() => setRotate(rotate() === -22 ? 45 : -22)}>
          旋转：{rotate()}°
        </Button>
        <Button size="small" variant="outlined" onClick={() => setGap(gap() === 120 ? 200 : 120)}>
          间距：{gap()}px
        </Button>
        <Button size="small" variant="outlined" onClick={() => setOpacity(opacity() === 1 ? 0.5 : 1)}>
          透明度：{opacity()}
        </Button>
      </Space>
      <Watermark
        content={content()}
        rotate={rotate()}
        gap={[gap(), gap()]}
        opacity={opacity()}
        fontColor="rgba(0,0,0,0.2)"
      >
        <div class="h-48 rounded-lg border border-outline-variant p-4 text-on-surface-variant">
          调整上方参数实时预览水印效果。
        </div>
      </Watermark>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">全屏水印</h3>
      <p class="text-sm text-on-surface-variant mb-3">整页覆盖（此处演示放在一个较大容器内；实际使用时挂在 body 级容器即可）。</p>
      <Watermark content="组织名称" fontColor="rgba(0,0,0,0.08)" fontSize={20} gap={[160, 160]}>
        <div class="h-56 rounded-lg border border-dashed border-outline-variant p-4 text-on-surface-variant">
          大间距、低透明度的整页水印样式。水印层不拦截鼠标事件，内容仍然可以交互。
          <div class="mt-4"><Button size="small" variant="outlined" onClick={() => alert('水印下的内容可以交互')}>点我试试</Button></div>
        </div>
      </Watermark>
    </div>
  )
}

export default WatermarkPage
