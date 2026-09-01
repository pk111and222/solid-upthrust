import { type Component, createSignal, onCleanup } from 'solid-js'
import { List, Divider, Button, Avatar, Progress } from 'upthrust-ui'
import type { ListRef } from 'upthrust-ui'

// ---- 复杂数据模型：贴近真实 B 端场景（工单/用户管理类列表）------------
// 每行含：头像、双行主信息、状态标签、操作按钮、进度条 —— 单行真实高度
// 远超估算值，正好验证可变行高的实测校正能力。
const STATUSES = [
  { key: 'processing', label: '处理中', cls: 'text-primary bg-primary-container/15' },
  { key: 'success', label: '已完成', cls: 'text-[#389e0d] bg-[#52c41a]/10' },
  { key: 'failed', label: '失败', cls: 'text-error bg-error/10' },
  { key: 'pending', label: '待处理', cls: 'text-on-surface-variant bg-on-surface/6' },
] as const

const FIRST = ['张', '李', '王', '赵', '孙', '周', '吴', '郑', '陈', '林', '何', '高']
const LAST = ['伟', '芳', '娜', '敏', '静', '磊', '军', '洋', '勇', '艳', '杰', '涛']
const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '苏州']
const DEPTS = ['基础架构部', '前端平台组', '数据中台', '商业增长部', '智能引擎组', '运维保障部']

const AVATAR_COLORS = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#13c2c2', '#eb2f96']

interface OrderRow {
  id: number
  name: string
  city: string
  dept: string
  title: string
  desc: string
  status: (typeof STATUSES)[number]
  progress: number
  amount: number
  updated: string
}

const makeOrders = (n: number, offset = 0): OrderRow[] =>
  Array.from({ length: n }, (_, i) => {
    const k = i + offset
    return {
      id: 100000 + k,
      name: `${FIRST[k % FIRST.length]}${LAST[(k * 7) % LAST.length]}`,
      city: CITIES[k % CITIES.length],
      dept: DEPTS[(k * 3) % DEPTS.length],
      title: `ORD-2026${String(1000000 + k).slice(1)}`,
      desc:
        k % 5 === 0
          ? '集群节点内存水位持续告警，自动扩容任务已下发，等待调度器确认。'
          : k % 3 === 0
            ? '跨可用区数据同步延迟超阈值，触发降级预案。'
            : '例行健康检查通过，各项指标处于正常区间。',
      status: STATUSES[k % STATUSES.length],
      progress: (k * 37) % 101,
      amount: ((k * 9187) % 99000) / 100 + 100,
      updated: `08-${String((k % 28) + 1).padStart(2, '0')} ${String((k % 24)).padStart(2, '0')}:${String((k * 13) % 60).padStart(2, '0')}`,
    }
  })

const groupItems = makeOrders(8)

// 富内容：行高各不相同 —— 虚拟滚动按实测高度校正
const richItems = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  title: `通知 ${i + 1}`,
  lines: i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 4,
}))
const RichText: Component<{ lines: number }> = (props) => (
  <div>
    {Array.from({ length: props.lines }, (_, l) => (
      <p class={l === 0 ? '' : 'mt-[4px]'} style={{ color: 'var(--upthrust-colors-on-surface-variant)' }}>
        {props.lines === 1 ? '简短通知：系统将于今晚 22:00 例行维护。' : `第 ${l + 1} 行内容 —— 虚拟滚动支持可变行高，各行按实测高度参与定位计算，无需统一高度。`}
      </p>
    ))}
  </div>
)

// 复杂行渲染器：头像 + 双行文本 + 状态 + 进度 + 金额 + 操作
const OrderRowRender: Component<{ item: OrderRow }> = (props) => {
  const item = props.item
  return (
    <div class="flex items-start gap-[12px] py-[4px]">
      <Avatar size="small" color={AVATAR_COLORS[item.id % AVATAR_COLORS.length]}>
        {item.name.slice(0, 1)}
      </Avatar>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-[8px]">
          <span class="font-medium truncate">{item.name}</span>
          <span class="text-[12px] text-on-surface-variant">{item.dept}</span>
          <span
            class={`text-[12px] rounded-sm px-[6px] py-[1px] shrink-0 ${item.status.cls}`}
          >
            {item.status.label}
          </span>
        </div>
        <div class="text-[13px] text-on-surface-variant mt-[2px] truncate">
          {item.title} · {item.desc}
        </div>
        <div class="flex items-center gap-[12px] mt-[6px]">
          <div class="w-[160px]">
            <Progress size="small" percent={item.progress} showInfo={false} />
          </div>
          <span class="text-[12px] text-on-surface-variant tabular-nums w-[36px]">{item.progress}%</span>
          <span class="text-[12px] text-on-surface-variant">{item.city}</span>
          <span class="text-[12px] text-on-surface-variant ml-auto tabular-nums">¥{item.amount.toFixed(2)}</span>
          <span class="text-[12px] text-on-surface-variant">{item.updated}</span>
          <button
            class="text-[12px] text-primary hover:text-primary/70 cursor-pointer bg-transparent border-none p-0"
            onClick={() => console.log('view', item.id)}
          >
            查看
          </button>
        </div>
      </div>
    </div>
  )
}

const ListPage: Component = () => {
  let virtualRef: ListRef | undefined
  const [renderedCount, setRenderedCount] = createSignal(0)
  const [scrollTop, setScrollTop] = createSignal(0)

  // 无限加载：触底追加下一页
  const pageSize = 30
  const [infItems, setInfItems] = createSignal(makeOrders(pageSize))
  const [loading, setLoading] = createSignal(false)
  let loadTimer: ReturnType<typeof setTimeout> | undefined
  onCleanup(() => { if (loadTimer) clearTimeout(loadTimer) })

  const loadMore = () => {
    if (loading()) return
    setLoading(true)
    loadTimer = setTimeout(() => {
      const base = infItems().length
      setInfItems((prev) => [...prev, ...makeOrders(pageSize, base)])
      setLoading(false)
    }, 600)
  }

  // 轮询 DOM 行数：展示虚拟化效果
  let virtualHost: HTMLDivElement | undefined
  const updateCount = () => {
    if (!virtualHost) return
    setRenderedCount(virtualHost.querySelectorAll('[data-row]').length)
  }
  const poll = setInterval(updateCount, 400)
  onCleanup(() => clearInterval(poll))

  const bigData = makeOrders(10000)

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">List 列表</h2>
      <p class="text-on-surface-variant mb-6">
        通用列表容器（对齐 antd6 Listy 能力）：虚拟滚动、分组吸顶、可变行高、scrollTo 定位。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础使用</h3>
      <List
        items={[...groupItems]}
        rowKey="id"
        itemRender={(item) => <OrderRowRender item={item} />}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">虚拟滚动（10,000 行复杂行）</h3>
      <p class="text-sm text-on-surface-variant mb-2">
        当前渲染行数：<b class="text-primary">{renderedCount()}</b> / 10000 ｜ scrollTop：{Math.round(scrollTop())}px
      </p>
      <div class="flex gap-2 mb-3">
        <Button size="small" onClick={() => virtualRef?.scrollTo(2000)}>滚动到 2000px</Button>
        <Button size="small" onClick={() => virtualRef?.scrollTo({ key: 108888, align: 'top' })}>跳到 key=108888</Button>
        <Button size="small" onClick={() => virtualRef?.scrollTo(0)}>回到顶部</Button>
      </div>
      <div ref={virtualHost}>
        <List
          ref={(ins) => { virtualRef = ins }}
          virtual
          height={320}
          items={bigData}
          rowKey="id"
          estimateRowHeight={44}
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          itemRender={(item) => <OrderRowRender item={item} />}
        />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">分组与吸顶头部</h3>
      <List
        height={240}
        items={[...groupItems, ...groupItems.map((g) => ({ ...g, id: g.id + 100 }))]}
        rowKey="id"
        group={{
          key: (item) => item.dept,
          title: (dept) => <span class="tracking-wider">{dept}</span>,
        }}
        sticky
        itemRender={(item) => <OrderRowRender item={item} />}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">富内容（可变行高 + 虚拟滚动）</h3>
      <List
        virtual
        height={280}
        items={richItems}
        rowKey="id"
        itemRender={(item) => (
          <div>
            <div class="font-medium">{item.title}</div>
            <RichText lines={item.lines} />
          </div>
        )}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">无限加载（onScroll 触底 + 虚拟）</h3>
      <p class="text-sm text-on-surface-variant mb-2">
        已加载 {infItems().length} 条 {loading() ? '（加载中…）' : ''}
      </p>
      <List
        virtual
        height={240}
        items={infItems()}
        rowKey="id"
        loading={loading()}
        onScroll={(e) => {
          const el = e.currentTarget
          if (el.scrollHeight - el.scrollTop - el.clientHeight < 60) loadMore()
        }}
        itemRender={(item) => (
          <div class="flex items-center gap-[8px]">
            <span class="font-medium">{item.name}</span>
            <span class="text-[12px] text-on-surface-variant">{item.dept}</span>
            <span class={`text-[12px] rounded-sm px-[6px] py-[1px] ml-auto ${item.status.cls}`}>{item.status.label}</span>
          </div>
        )}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义语义化样式（classNames / styles）</h3>
      <List
        items={[...groupItems]}
        rowKey="id"
        classNames={{
          root: 'shadow',
          item: 'bg-primary-container/10 hover:bg-primary-container/20 border-b-primary/20',
        }}
        itemRender={(item) => <span>{item.name}</span>}
      />
    </div>
  )
}

export default ListPage
