import { type Component, createSignal, For } from 'solid-js'
import { Notification, NotificationProvider, Button, Space, Divider, Typography } from 'upthrust-ui'
import type { NotificationPlacement } from 'upthrust-ui'

const { Text } = Typography

const PLACEMENTS: NotificationPlacement[] = ['topLeft', 'top', 'topRight', 'bottomLeft', 'bottom', 'bottomRight']

const NotificationPage: Component = () => {
  const [lastAction, setLastAction] = createSignal('（未操作）')

  const openAt = (placement: NotificationPlacement) => {
    Notification.open({
      message: `${placement} 通知标题`,
      description: '通知的描述文案，用于补充标题信息。会根据 placement 出现在对应的屏幕角落。',
      placement,
      duration: 4.5,
    })
    setLastAction(`open placement=${placement}`)
  }

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Notification 通知提醒框</h2>
      <p class="text-on-surface-variant mb-6">全局展示通知信息，挂在页面角落（六个方位）。与 Message 的区别：Notification 常驻在角落、可带描述与操作按钮、支持暂停倒计时与进度条。命令式调用 notification.open(...)，同一页面共用一个单例队列。</p>

      <h3 class="text-lg font-semibold mb-3">弹出位置（六个方位）</h3>
      <Space size="middle" wrap>
        <For each={PLACEMENTS}>
          {(p) => <Button onClick={() => openAt(p)}>{p}</Button>}
        </For>
      </Space>
      <p class="mt-2 text-sm text-on-surface-variant">最近操作：{lastAction()}</p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">四种类型（带图标）</h3>
      <Space size="middle" wrap>
        <Button onClick={() => { Notification.info({ message: '通知标题', description: '这是一条 info 类型的通知描述。' }); setLastAction('info') }}>Info</Button>
        <Button variant="solid" onClick={() => { Notification.success({ message: '操作成功', description: '这是一条 success 类型的通知描述。' }); setLastAction('success') }}>Success</Button>
        <Button variant="outlined" onClick={() => { Notification.warning({ message: '注意警告', description: '这是一条 warning 类型的通知描述。' }); setLastAction('warning') }}>Warning</Button>
        <Button danger onClick={() => { Notification.error({ message: '操作失败', description: '这是一条 error 类型的通知描述。' }); setLastAction('error') }}>Error</Button>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">倒计时进度条 + 悬停暂停</h3>
      <Space size="middle" wrap>
        <Button onClick={() => { Notification.open({ message: '带进度条的通知', description: '底部进度条展示剩余时间；把鼠标悬停在卡片上会暂停倒计时。', duration: 5, showProgress: true, pauseOnHover: true, key: 'progress-demo' }); setLastAction('showProgress + pauseOnHover') }}>进度条通知</Button>
        <Button onClick={() => { Notification.open({ message: '暂停已关闭', description: 'pauseOnHover=false：悬停不暂停，倒计时照常进行。', duration: 5, showProgress: true, pauseOnHover: false }); setLastAction('pauseOnHover=false') }}>不暂停</Button>
      </Space>
      <p class="mt-2"><Text type="secondary">duration 单位为秒（antd 口径）：默认 4.5s，设为 0 则不自动关闭。</Text></p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义按钮与手动关闭</h3>
      <Space size="middle" wrap>
        <Button
          onClick={() => {
            const handle = Notification.open({
              message: '需要确认的操作',
              description: '点击卡片内的按钮触发回调，通知不会自动关闭（duration=0）。',
              duration: 0,
              key: 'btn-demo',
              btn: (
                <Space size="small">
                  <Button size="small" variant="outlined" onClick={() => { handle.close(); setLastAction('btn: 取消') }}>取消</Button>
                  <Button size="small" variant="solid" onClick={() => { handle.close(); setLastAction('btn: 确定') }}>确定</Button>
                </Space>
              ),
            })
            setLastAction('duration=0 + btn')
          }}
        >
          带按钮的通知
        </Button>
        <Button variant="outlined" onClick={() => { Notification.close('btn-demo'); setLastAction('close key=btn-demo') }}>关闭 btn-demo</Button>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">原地更新（同 key）</h3>
      <Space size="middle">
        <Button
          onClick={() => {
            const handle = Notification.open({ message: '正在处理…', description: '1.5 秒后原地更新为成功结果。', key: 'update-demo', type: 'info', duration: 0 })
            setTimeout(() => {
              handle.update({ type: 'success', message: '处理完成', description: '同一条通知被原地更新（不新开卡片），3 秒后自动关闭。', duration: 3 })
              setLastAction('update 同 key 原地更新')
            }, 1500)
            setLastAction('open key=update-demo')
          }}
        >
          打开并稍后更新
        </Button>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">堆叠与 maxCount</h3>
      <Space size="middle" wrap>
        <Button
          onClick={() => {
            for (let i = 1; i <= 5; i++) Notification.open({ message: `第 ${i} 条通知`, description: '同批打开多条，堆叠在 topRight；超过 maxCount（默认 3）时最旧的被挤掉。', duration: 8 })
            setLastAction('批量打开 5 条')
          }}
        >
          连续打开 5 条
        </Button>
        <Button danger onClick={() => { Notification.destroy(); setLastAction('destroy 全部关闭') }}>destroy 全部</Button>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">Provider 配置（默认方位）</h3>
      <p class="text-sm text-on-surface-variant mb-3">本页挂载的 NotificationProvider 将 placement 设为 topRight（antd 默认）。在应用根挂载 &lt;NotificationProvider placement="bottomLeft" /&gt; 即可改变所有未指定 placement 调用的默认方位。</p>
      <NotificationProvider placement="topRight" />
      <Space size="middle">
        <Button variant="outlined" onClick={() => { Notification.open({ message: '默认方位通知', description: '未指定 placement 时使用 Provider 配置的默认方位。' }); setLastAction('默认方位弹出') }}>默认方位弹出</Button>
      </Space>
    </div>
  )
}

export default NotificationPage
