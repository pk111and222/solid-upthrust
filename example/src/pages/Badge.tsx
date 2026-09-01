import { type Component, createSignal } from 'solid-js'
import { Badge, BadgeRibbon, Divider, Space, Button, Avatar, Typography } from 'upthrust-ui'

const { Text } = Typography

// IMPORTANT: JSX-element props are real DOM nodes in Solid — each demo that
// repeats a custom count node builds its OWN element (see Descriptions notes).
// No text-on-primary here: the icon INHERITS the pill's color (white on the
// red default; #999 when the pill's style sets a custom color, like antd).
const makeCustomCount = () => (
  <span class="i-mdi-clock-outline text-[14px]" />
)

const BadgePage: Component = () => {
  const [count, setCount] = createSignal(5)

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Badge 徽章</h2>
      <p class="text-on-surface-variant mb-6">图标右上角的圆形徽标数字，或独立使用的状态点/缎带。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <Space size="large" align="center">
        <Badge count={5}>
          <Avatar shape="square" size="large" />
        </Badge>
        <Badge count={0} showZero>
          <Avatar shape="square" size="large" />
        </Badge>
        <Badge dot>
          <span class="i-mdi-bell-outline text-[16px]" />
        </Badge>
        <Badge count={99} overflowCount={10}>
          <span class="text-[16px] text-on-surface">消息</span>
        </Badge>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">独立使用（不包裹子元素）</h3>
      <Space size="large" align="center">
        <Badge count={5} />
        <Badge count={99} overflowCount={10} />
        <Badge count={0} showZero />
        <Badge count={0} />
        <Badge dot />
        <Badge count="新" />
      </Space>
      <p class="mt-2 text-sm text-on-surface-variant">
        count=0 且未开 showZero 时完全不渲染。
      </p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">溢出封顶与自定义上限</h3>
      <Space size="large" align="center">
        <Badge count={99}>
          <Avatar shape="square" size="middle" />
        </Badge>
        <Badge count={100}>
          <Avatar shape="square" size="middle" />
        </Badge>
        <Badge count={1000} overflowCount={999}>
          <Avatar shape="square" size="middle" />
        </Badge>
        <Badge count={99} overflowCount={10} title="自定义 hover 提示">
          <Avatar shape="square" size="middle" />
        </Badge>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">小红点</h3>
      <Space size="large" align="center">
        <Badge dot count={13}>
          <span class="i-mdi-bell-outline text-[16px]" />
        </Badge>
        <Badge dot>
          <span class="text-[14px] text-on-surface">Link</span>
        </Badge>
        <Badge dot count={0}>
          <span class="text-[14px] text-on-surface">零值隐藏</span>
        </Badge>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">状态点（status + text）</h3>
      <Space size="large" align="center" wrap>
        <Badge status="success" text="Success" />
        <Badge status="processing" text="Processing" />
        <Badge status="default" text="Default" />
        <Badge status="error" text="Error" />
        <Badge status="warning" text="Warning" />
        <Badge color="#1677ff" text="自定义色" />
      </Space>
      <p class="mt-2 text-sm text-on-surface-variant">
        processing 状态带 antd 的扩散脉冲动画。
      </p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">动态计数</h3>
      <Space size="large" align="center">
        <Badge count={count()} size="middle">
          <span class="i-mdi-bell-outline text-[16px]" />
        </Badge>
        <Button size="small" variant="outlined" onClick={() => setCount(c => Math.min(120, c + 10))}>
          +10
        </Button>
        <Button size="small" variant="outlined" onClick={() => setCount(c => Math.max(0, c - 10))}>
          -10
        </Button>
        <Button size="small" onClick={() => setCount(0)}>归零</Button>
        <Text class="text-sm text-on-surface-variant">当前 count = {count()}（0 隐藏 / &gt;99 显示 99+）</Text>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">尺寸与偏移</h3>
      <Space size="large" align="center">
        <Badge count={8} size="middle">
          <Avatar shape="square" size="small" />
        </Badge>
        <Badge count={8} size="small">
          <Avatar shape="square" size="small" />
        </Badge>
        <Badge count={8} offset={[10, 10]}>
          <Avatar shape="square" size="small" />
        </Badge>
        <Badge count={8} offset={[-10, 10]}>
          <Avatar shape="square" size="small" />
        </Badge>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义 count 节点与颜色</h3>
      <Space size="large" align="center">
        <Badge count={makeCustomCount()}>
          <Avatar shape="square" size="small" />
        </Badge>
        <Badge count={makeCustomCount()} title="自定义图标">
          <Avatar shape="square" size="small" />
        </Badge>
        <Badge count={makeCustomCount()} style={{ 'background-color': 'transparent', color: '#999', 'font-weight': 'normal', border: 'none', 'box-shadow': 'none' }}>
          <span class="i-mdi-clock-outline text-[16px]" />
        </Badge>
      </Space>
      <Space size="large" align="center" class="ml-16 mt-4">
        <Badge count={5} color="blue">
          <Avatar shape="square" size="small" />
        </Badge>
        <Badge count={5} color="red">
          <Avatar shape="square" size="small" />
        </Badge>
        <Badge count={5} color="green">
          <Avatar shape="square" size="small" />
        </Badge>
        <Badge count={5} color="gray">
          <Avatar shape="square" size="small" />
        </Badge>
        <Badge count={5} color="#faad14">
          <Avatar shape="square" size="small" />
        </Badge>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">Ribbon 缎带</h3>
      <Space size="large" align="center" wrap>
        <BadgeRibbon text="推荐">
          <div class="w-[164px] h-[110px] rounded-lg bg-surface-variant border border-outline-variant" />
        </BadgeRibbon>
        <BadgeRibbon text="新品" placement="start" color="green">
          <div class="w-[164px] h-[110px] rounded-lg bg-surface-variant border border-outline-variant" />
        </BadgeRibbon>
        <BadgeRibbon text="促销" color="red">
          <div class="w-[164px] h-[110px] rounded-lg bg-surface-variant border border-outline-variant" />
        </BadgeRibbon>
        <BadgeRibbon text="灰色" color="gray" placement="start">
          <div class="w-[164px] h-[110px] rounded-lg bg-surface-variant border border-outline-variant" />
        </BadgeRibbon>
        <BadgeRibbon text="自定义色" color="#722ed1">
          <div class="w-[164px] h-[110px] rounded-lg bg-surface-variant border border-outline-variant" />
        </BadgeRibbon>
      </Space>
    </div>
  )
}

export default BadgePage
