import { type Component, createSignal } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { FloatButton, Divider, Switch, Typography } from 'upthrust-ui'

const { Text } = Typography

/** translateZ(0) 让 fixed 的悬浮按钮锚在演示框内（right 24 / bottom 48 相对演示框）。 */
const Stage = (props: { demo: string; height: number; children: JSX.Element }) => (
  <div
    data-float-button-demo={props.demo}
    class="relative rounded-lg border border-solid border-outline-variant bg-surface-variant/30 mb-4"
    style={{ height: `${props.height}px`, transform: 'translateZ(0)' }}
  >{props.children}</div>
)

const FloatButtonPage: Component = () => {
  const [open, setOpen] = createSignal(true)
  const [clicks, setClicks] = createSignal(0)
  let pane: HTMLDivElement | undefined

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">FloatButton 悬浮按钮</h2>
      <p class="text-on-surface-variant mb-6">
        对标 antd 6：40px 纵向按钮，单独使用时 fixed 在右下角（right 24 / bottom 48、z 1000）。
        Group 圆形为独立按钮 + 16px 间距，方形为紧凑列表；设置 trigger 进入菜单模式。BackTop 滚动超过阈值后淡入。
      </p>

      <h3 class="text-lg font-semibold mb-3">类型、形状与内容</h3>
      <Stage demo="basic" height={140}>
        <FloatButton onClick={() => setClicks(c => c + 1)} style={{ right: '24px' }} />
        <FloatButton type="primary" icon={<span class="i-mdi-help-circle-outline" />} style={{ right: '88px' }} />
        <FloatButton shape="square" type="primary" icon={<span class="i-mdi-headset" />} style={{ right: '152px' }} />
        <FloatButton shape="square" icon={<span class="i-mdi-file-document-outline" />} content="文档" style={{ right: '216px' }} />
        <FloatButton shape="square" content="HELP INFO" style={{ right: '280px' }} />
        <FloatButton href="https://ant.design" target="_blank" tooltip={{ title: '链接 + 气泡', placement: 'top' }} style={{ right: '344px' }} />
        <div class="p-md text-[13px]"><Text type="secondary">默认按钮点击次数：{clicks()}</Text></div>
      </Stage>

      <h3 class="text-lg font-semibold mb-3">徽标</h3>
      <Stage demo="badge" height={140}>
        <FloatButton badge={{ count: 5 }} style={{ right: '24px' }} />
        <FloatButton badge={{ dot: true }} style={{ right: '88px' }} />
        <FloatButton shape="square" badge={{ count: 12, color: 'blue' }} style={{ right: '152px' }} />
        <FloatButton shape="square" badge={{ dot: true }} style={{ right: '216px' }} />
      </Stage>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">按钮组（circle / square）</h3>
      <Stage demo="group" height={240}>
        <FloatButton.Group shape="circle" style={{ right: '24px' }}>
          <FloatButton icon={<span class="i-mdi-help-circle-outline" />} />
          <FloatButton />
          <FloatButton.BackTop visibilityHeight={0} />
        </FloatButton.Group>
        <FloatButton.Group shape="square" style={{ right: '88px' }}>
          <FloatButton icon={<span class="i-mdi-help-circle-outline" />} />
          <FloatButton />
          <FloatButton icon={<span class="i-mdi-sync" />} />
          <FloatButton.BackTop visibilityHeight={0} />
        </FloatButton.Group>
      </Stage>

      <h3 class="text-lg font-semibold mb-3">菜单模式（click / hover / 受控）</h3>
      <Stage demo="menu" height={260}>
        <FloatButton.Group trigger="click" type="primary" icon={<span class="i-mdi-headset" />} style={{ right: '24px' }}>
          <FloatButton />
          <FloatButton icon={<span class="i-mdi-comment-outline" />} />
        </FloatButton.Group>
        <FloatButton.Group trigger="hover" type="primary" icon={<span class="i-mdi-headset" />} style={{ right: '88px' }}>
          <FloatButton />
          <FloatButton icon={<span class="i-mdi-comment-outline" />} />
        </FloatButton.Group>
        <FloatButton.Group trigger="click" shape="square" open={open()} onOpenChange={setOpen} style={{ right: '152px' }}>
          <FloatButton />
          <FloatButton icon={<span class="i-mdi-comment-outline" />} />
        </FloatButton.Group>
        <div class="p-md"><Switch checked={open()} onChange={setOpen} checkedChildren="展开" unCheckedChildren="收起" /></div>
      </Stage>

      <h3 class="text-lg font-semibold mb-3">弹出方向</h3>
      <Stage demo="placement" height={300}>
        <FloatButton.Group trigger="click" placement="top" style={{ right: '210px', bottom: '190px' }} icon={<span class="i-mdi-arrow-up" />}><FloatButton /><FloatButton /></FloatButton.Group>
        <FloatButton.Group trigger="click" placement="right" style={{ right: '290px', bottom: '110px' }} icon={<span class="i-mdi-arrow-right" />}><FloatButton /><FloatButton /></FloatButton.Group>
        <FloatButton.Group trigger="click" placement="bottom" style={{ right: '210px', bottom: '30px' }} icon={<span class="i-mdi-arrow-down" />}><FloatButton /><FloatButton /></FloatButton.Group>
        <FloatButton.Group trigger="click" placement="left" style={{ right: '130px', bottom: '110px' }} icon={<span class="i-mdi-arrow-left" />}><FloatButton /><FloatButton /></FloatButton.Group>
      </Stage>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">回到顶部（容器滚动，阈值 100）</h3>
      <Stage demo="back-top" height={240}>
        <div ref={el => { pane = el }} data-back-top-pane class="h-full overflow-auto px-md">
          <div class="h-[1200px] pt-md text-[13px] text-on-surface-variant">向下滚动这个容器，右下角出现回到顶部按钮。</div>
        </div>
        <FloatButton.BackTop target={() => pane!} visibilityHeight={100} tooltip="回到顶部" />
      </Stage>

      <h3 class="text-lg font-semibold mb-3">语义化 classNames / styles</h3>
      <Stage demo="semantic" height={200}>
        <FloatButton
          type="primary" shape="square" content="HOT" style={{ right: '88px' }}
          styles={({ props }) => props.type === 'primary' ? { root: { 'background-color': '#fa541c', 'border-color': '#fa541c' } } : {}}
        />
        <FloatButton.Group shape="square" styles={{ list: { 'box-shadow': '0 0 0 2px #1677ff' }, itemContent: { color: '#1677ff' } }}>
          <FloatButton content="A" />
          <FloatButton content="B" />
        </FloatButton.Group>
      </Stage>
    </div>
  )
}

export default FloatButtonPage
