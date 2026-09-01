import { type Component, createSignal } from 'solid-js'
import { Image, ImagePreviewGroup, Button, Space, Divider, Typography } from 'upthrust-ui'

const { Text } = Typography

const GOOD_SRC = 'https://picsum.photos/seed/upthrust/400/260'
const SLOW_SRC = 'https://picsum.photos/seed/slowdemo/400/260?delay=3000'
const BAD_SRC = 'https://invalid.example.domain/unreachable.png'
const GROUP_SRCS = [
  'https://picsum.photos/seed/group-a/400/260',
  'https://picsum.photos/seed/group-b/400/260',
  'https://picsum.photos/seed/group-c/400/260',
  'https://picsum.photos/seed/group-d/400/260',
]

const ImagePage: Component = () => {
  const [controlledOpen, setControlledOpen] = createSignal(false)
  const [lastAction, setLastAction] = createSignal('（未操作）')
  const [groupOpen, setGroupOpen] = createSignal(false)
  const [groupIndex, setGroupIndex] = createSignal(0)

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Image 图片</h2>
      <p class="text-on-surface-variant mb-6">展示图片，内置加载占位与失败回退；点击可打开放大预览（缩放 / 旋转 / ESC 关闭）。加载与预览的状态机在 headless 层（createImage），与本库其他反馈物料同构。</p>

      <h3 class="text-lg font-semibold mb-3">基础用法</h3>
      <Space size="middle" wrap>
        <Image src={GOOD_SRC} width={200} height={130} alt="示例图片" />
      </Space>
      <p class="mt-2"><Text type="secondary">默认开启 preview：hover 出现遮罩，点击进入全屏预览。</Text></p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">加载占位</h3>
      <Space size="middle" wrap>
        <Image src={SLOW_SRC} width={200} height={130} alt="慢图" />
      </Space>
      <p class="mt-2"><Text type="secondary">慢速图片在加载完成前显示 spinner 占位（placeholder 可传自定义节点）。</Text></p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">加载失败与 fallback</h3>
      <Space size="middle" wrap>
        <Image src={BAD_SRC} width={200} height={130} alt="失败图" />
        <Image src={BAD_SRC} fallback={GOOD_SRC} width={200} height={130} alt="回退图" />
      </Space>
      <p class="mt-2"><Text type="secondary">左侧显示默认的错误占位；右侧指定 fallback 后加载失败自动切换到回退图。</Text></p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">关闭预览</h3>
      <Space size="middle" wrap>
        <Image src={GOOD_SRC} width={200} height={130} preview={false} alt="无预览" />
      </Space>
      <p class="mt-2"><Text type="secondary">preview=false 时不显示 hover 遮罩、点击无反应。</Text></p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">受控预览</h3>
      <Space size="middle" wrap>
        <Image
          src={GOOD_SRC}
          width={200}
          height={130}
          previewVisible={controlledOpen()}
          onPreviewVisibleChange={(o) => { setControlledOpen(o); setLastAction(`预览${o ? '打开' : '关闭'}`) }}
          alt="受控预览"
        />
        <Button variant="outlined" onClick={() => setControlledOpen(true)}>外部打开预览</Button>
      </Space>
      <p class="mt-2 text-sm text-on-surface-variant">最近操作：{lastAction()}（预览内 ESC / 遮罩点击同样会同步回来）</p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">图片组预览</h3>
      <ImagePreviewGroup>
        <Image src={GROUP_SRCS[0]} width={160} height={104} alt="组图 1" />
        <Image src={GROUP_SRCS[1]} width={160} height={104} alt="组图 2" />
        <Image src={GROUP_SRCS[2]} width={160} height={104} alt="组图 3" />
        <Image src={GROUP_SRCS[3]} width={160} height={104} alt="组图 4" />
      </ImagePreviewGroup>
      <p class="mt-2"><Text type="secondary">组内图片共用一个全屏预览：点击任一张从该张开始，左右箭头 / ←→ 键切换（首尾循环），切换后缩放旋转复位，左上角显示计数。</Text></p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">受控图片组预览</h3>
      <Space size="middle" wrap>
        <Button variant="outlined" onClick={() => setGroupOpen(true)}>打开第 3 张</Button>
        <Button variant="outlined" onClick={() => setGroupIndex((i) => (i + 1) % GROUP_SRCS.length)}>切换 index（当前 {groupIndex() + 1}）</Button>
      </Space>
      <div class="mt-3">
        <ImagePreviewGroup
          previewVisible={groupOpen()}
          onPreviewVisibleChange={setGroupOpen}
          current={groupIndex()}
          onChange={(cur) => setGroupIndex(cur)}
        >
          <Image src={GROUP_SRCS[0]} width={120} height={78} alt="受控组图 1" />
          <Image src={GROUP_SRCS[1]} width={120} height={78} alt="受控组图 2" />
          <Image src={GROUP_SRCS[2]} width={120} height={78} alt="受控组图 3" />
        </ImagePreviewGroup>
      </div>
      <p class="mt-2 text-sm text-on-surface-variant">预览状态与当前 index 均受控：外部按钮可打开指定张、切换时 index 同步回来。</p>
    </div>
  )
}

export default ImagePage
