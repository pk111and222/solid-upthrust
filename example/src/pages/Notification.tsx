import { type Component, createSignal, For } from 'solid-js'
import { Notification, NotificationProvider, Button, Space, Divider, Typography } from 'upthrust-ui'
import type { NotificationPlacement } from 'upthrust-ui'

const { Text } = Typography

const PLACEMENTS: NotificationPlacement[] = ['topLeft', 'top', 'topRight', 'bottomLeft', 'bottom', 'bottomRight']

const NotificationPage: Component = () => {
  const [lastAction, setLastAction] = createSignal('（未操作）')
  const [stack, setStack] = createSignal(true)

  const openAt = (placement: NotificationPlacement) => {
    Notification.open({
      title: `${placement} 通知标题`,
      description: '通知的描述文案，用于补充标题信息。会根据 placement 出现在对应的屏幕角落。',
      placement,
    })
    setLastAction(`open placement=${placement}`)
  }

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Notification 通知提醒框</h2>
      <p class="text-on-surface-variant mb-6">全局展示通知提醒信息，出现在页面角落（六个方位）。与 Message 相比可带描述与操作按钮，支持进度条、悬停暂停与堆叠。命令式调用 notification.open(...)，同一页面共用一个单例队列。</p>

      <h3 class="text-lg font-semibold mb-3">基本（不传 type 时无图标）</h3>
      <div data-notification-demo="basic">
        <Space size="middle" wrap>
          <Button variant="solid" onClick={() => { Notification.open({ title: '通知标题', description: '这是通知的内容。这是通知的内容。这是通知的内容。', onClick: () => setLastAction('onClick 卡片') }); setLastAction('open') }}>打开通知</Button>
          <Button onClick={() => { Notification.open({ title: '不会自动关闭', description: 'duration=0（或 false / null）时一直保留，直到手动关闭。', duration: 0, key: 'manual' }); setLastAction('duration=0') }}>不自动关闭</Button>
          <Button danger onClick={() => { Notification.destroy('manual'); setLastAction('destroy(key)') }}>关闭它</Button>
        </Space>
      </div>
      <p class="mt-2 text-sm text-on-surface-variant">最近操作：<span data-notification-last>{lastAction()}</span></p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">四种类型（带图标）</h3>
      <div data-notification-demo="types">
        <Space size="middle" wrap>
          <Button onClick={() => { Notification.success({ title: '操作成功', description: '这是一条 success 类型的通知描述。' }); setLastAction('success') }}>Success</Button>
          <Button onClick={() => { Notification.info({ title: '通知标题', description: '这是一条 info 类型的通知描述。' }); setLastAction('info') }}>Info</Button>
          <Button onClick={() => { Notification.warning({ title: '注意警告', description: '这是一条 warning 类型的通知描述。' }); setLastAction('warning') }}>Warning</Button>
          <Button onClick={() => { Notification.error({ title: '操作失败', description: '这是一条 error 类型的通知描述。' }); setLastAction('error') }}>Error</Button>
        </Space>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">弹出位置（六个方位）</h3>
      <div data-notification-demo="placement">
        <Space size="middle" wrap>
          <For each={PLACEMENTS}>
            {(p) => <Button onClick={() => openAt(p)}>{p}</Button>}
          </For>
        </Space>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">进度条 + 悬停暂停</h3>
      <div data-notification-demo="progress">
        <Space size="middle" wrap>
          <Button onClick={() => { Notification.open({ title: '悬停暂停', description: '底部进度条展示剩余时间；悬停在卡片上暂停倒计时。', duration: 3, showProgress: true }); setLastAction('showProgress + pauseOnHover') }}>悬停暂停</Button>
          <Button onClick={() => { Notification.open({ title: '悬停不暂停', description: 'pauseOnHover=false：悬停时倒计时照常进行。', duration: 3, showProgress: true, pauseOnHover: false }); setLastAction('pauseOnHover=false') }}>悬停不暂停</Button>
        </Space>
      </div>
      <p class="mt-2"><Text type="secondary">duration 单位为秒（与 antd 一致）：默认 4.5 秒，0 / null / false 表示不自动关闭。</Text></p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">操作按钮、自定义图标与关闭</h3>
      <div data-notification-demo="actions">
        <Space size="middle" wrap>
          <Button
            onClick={() => {
              const handle = Notification.open({
                title: '需要确认的操作',
                description: '点击卡片内的按钮触发回调，通知不会自动关闭（duration=0）。',
                duration: 0,
                key: 'actions-demo',
                onClose: () => setLastAction('onClose actions-demo'),
                actions: (
                  <Space size="small">
                    <Button size="small" variant="link" onClick={() => { handle.close(); setLastAction('actions: 全部关闭') }}>全部关闭</Button>
                    <Button size="small" variant="solid" onClick={() => { handle.close(); setLastAction('actions: 确认') }}>确认</Button>
                  </Space>
                ),
              })
              setLastAction('actions')
            }}
          >
            带操作按钮
          </Button>
          <Button onClick={() => { Notification.open({ title: '自定义图标', description: 'icon 替换类型图标；不带类型色。', icon: <span class="flex text-primary" data-custom-icon>★</span> }); setLastAction('icon') }}>自定义图标</Button>
          <Button onClick={() => { Notification.open({ title: '不可关闭', description: 'closable=false 时不渲染关闭按钮，标题右侧不再预留空间。', closable: false, duration: 3 }); setLastAction('closable=false') }}>不可关闭</Button>
          <Button onClick={() => { Notification.open({ title: '自定义关闭', description: 'closable 对象形式：自定义图标 + 额外回调。', closable: { closeIcon: <span class="text-[12px]">关闭</span>, onClose: () => setLastAction('closable.onClose') } }); setLastAction('closable object') }}>自定义关闭</Button>
        </Space>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">原地更新（同 key）</h3>
      <div data-notification-demo="update">
        <Space size="middle">
          <Button
            onClick={() => {
              const handle = Notification.info({ title: '正在处理…', description: '1 秒后原地更新为成功结果。', key: 'update-demo', duration: 0 })
              setTimeout(() => {
                handle.update({ type: 'success', title: '处理完成', description: '同一条通知被原地更新（不新开卡片），3 秒后自动关闭。', duration: 3 })
                setLastAction('update 同 key 原地更新')
              }, 1000)
              setLastAction('open key=update-demo')
            }}
          >
            打开并稍后更新
          </Button>
        </Space>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">堆叠（stack）</h3>
      <p class="text-sm text-on-surface-variant mb-3">同一角落超过 3 条时折叠为卡片堆，悬停展开。</p>
      <div data-notification-demo="stack">
        <Space size="middle" wrap>
          <Button
            onClick={() => {
              for (let i = 1; i <= 5; i++) Notification.open({ title: `第 ${i} 条通知`, description: `同一角落连续打开的第 ${i} 条。`, duration: 8 })
              setLastAction('批量打开 5 条')
            }}
          >
            连续打开 5 条
          </Button>
          <Button onClick={() => { const next = !stack(); setStack(next); Notification.config({ stack: next }); setLastAction(`stack=${next}`) }}>{stack() ? '关闭堆叠' : '开启堆叠'}</Button>
          <Button danger onClick={() => { Notification.destroy(); setLastAction('destroy 全部关闭') }}>destroy 全部</Button>
        </Space>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">语义化 classNames / styles</h3>
      <div data-notification-demo="semantic">
        <Space size="middle" wrap>
          <Button
            onClick={() => {
              Notification.error({
                title: '语义化样式',
                description: '函数形式 styles 按 props.type 返回样式。',
                duration: 0,
                key: 'semantic',
                styles: ({ props }) => ({
                  root: { 'background-color': props.type === 'error' ? 'rgb(255, 242, 240)' : '' },
                  title: { color: props.type === 'error' ? 'rgb(207, 19, 34)' : '' },
                }),
              })
              setLastAction('semantic styles')
            }}
          >
            函数 styles
          </Button>
          <Button onClick={() => { Notification.destroy('semantic'); setLastAction('destroy semantic') }}>关闭</Button>
        </Space>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">Provider 配置</h3>
      <p class="text-sm text-on-surface-variant mb-3">本页挂载的 NotificationProvider 会覆盖应用根的 Provider（后挂载者负责渲染）；它的 props 与 notification.config 等价。</p>
      <NotificationProvider placement="topRight" />
    </div>
  )
}

export default NotificationPage
