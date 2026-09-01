import { type Component, createSignal, For } from 'solid-js'
import { Carousel, Button, Space, Divider, Typography } from 'upthrust-ui'

const { Text } = Typography

const Slide = (props: { n: number; label?: string }) => (
  <div class="h-full w-full flex flex-col items-center justify-center text-white select-none"
       style={{ background: `hsl(${props.n * 67} 45% 45%)` }}>
    <div class="text-[32px] font-bold">{props.n}</div>
    <div class="text-[14px] opacity-80 mt-xs">{props.label ?? `第 ${props.n} 张幻灯片`}</div>
  </div>
)

const CarouselPage: Component = () => {
  const [controlled, setControlled] = createSignal(1)
  const [lastChange, setLastChange] = createSignal('（未切换）')

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Carousel 走马灯</h2>
      <p class="text-on-surface-variant mb-6">旋转轮播的内容展示。默认循环滚动、显示切换箭头与指示器；支持自动播放（悬停暂停）、受控切换与循环关闭。</p>

      <h3 class="text-lg font-semibold mb-3">基础用法</h3>
      <Carousel afterChange={(c) => setLastChange(`切换到第 ${c + 1} 张`)}>
        <Slide n={1} />
        <Slide n={2} />
        <Slide n={3} />
      </Carousel>
      <p class="mt-2 text-sm text-on-surface-variant">最近切换：{lastChange()}</p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自动播放（悬停暂停）</h3>
      <Carousel autoplay autoplaySpeed={2000}>
        <Slide n={1} label="每 2 秒自动切换" />
        <Slide n={2} label="鼠标悬停时暂停" />
        <Slide n={3} />
        <Slide n={4} />
      </Carousel>
      <p class="mt-2"><Text type="secondary">autoplay + autoplaySpeed=2000；pauseOnHover 默认开启，移入停止、移出恢复。</Text></p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">受控模式 + 定制高度/指示器</h3>
      <Space size="middle" wrap class="mb-sm">
        <For each={[0, 1, 2]}>
          {(i) => (
            <Button size="small" variant={controlled() === i ? 'solid' : 'outlined'} onClick={() => setControlled(i)}>
              第 {i + 1} 张
            </Button>
          )}
        </For>
        <Button size="small" variant="outlined" onClick={() => setControlled((c) => (c + 1) % 3)}>下一张</Button>
      </Space>
      <Carousel current={controlled()} height={220} dotPosition="inner">
        <Slide n={1} label="受控：current 由外部 state 驱动" />
        <Slide n={2} label="高度 220px" />
        <Slide n={3} label="箭头与指示器均可操作" />
      </Carousel>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">非循环（infinite=false）</h3>
      <Carousel infinite={false}>
        <Slide n={1} label="到两端后箭头隐藏" />
        <Slide n={2} />
        <Slide n={3} label="最后一张" />
      </Carousel>
      <p class="mt-2"><Text type="secondary">首张时左箭头、末张时右箭头自动隐藏。</Text></p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">纵向滑动（vertical）</h3>
      <Carousel vertical height={260} autoplay autoplaySpeed={2500}>
        <Slide n={1} label="轨道变为纵向列" />
        <Slide n={2} label="箭头移到上下边缘" />
        <Slide n={3} label="指示器竖排在右侧" />
      </Carousel>
      <p class="mt-2"><Text type="secondary">vertical 模式：轨道沿 Y 轴滑动，箭头变为上下 chevron，指示器竖排贴右边缘（react-slick 的纵向布局）。</Text></p>
    </div>
  )
}

export default CarouselPage
