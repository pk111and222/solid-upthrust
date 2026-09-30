import { type Component, createSignal } from 'solid-js'
import { message, MessageProvider, Button, Space, Divider, Typography } from 'upthrust-ui'

const { Text } = Typography

const MessagePage: Component = () => {
  const [lastAction, setLastAction] = createSignal('（未操作）')
  const [placement, setPlacement] = createSignal<'top' | 'center' | 'bottom'>('top')

  // 同一个 key 原地更新：loading → success，不新开一条，倒计时重新开始。
  const openUpdatable = () => {
    message.open({ key: 'updatable', type: 'loading', content: '加载中...' })
    setLastAction('loading 打开（key=updatable）')
    setTimeout(() => {
      message.open({ key: 'updatable', type: 'success', content: '加载完成！', duration: 2 })
      setLastAction('同 key 更新为 success，2 秒后关闭')
    }, 1000)
  }

  // Promise 接口：前一条关闭后再打开下一条。
  const sequential = () => {
    message.open({ type: 'loading', content: '处理中..', duration: 2.5 })
      .then(() => message.success('处理完成', 2.5))
      .then(() => { message.info('全部结束', 2.5); setLastAction('then 链式三条完成') })
  }

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Message 全局提示</h2>
      <p class="text-on-surface-variant mb-6">全局展示操作反馈信息。顶部居中显示并自动消失，是一种不打断用户操作的轻量级提示方式。命令式调用，同一页面共用一个单例队列。</p>

      <h3 class="text-lg font-semibold mb-3">其他提示类型</h3>
      <div data-message-demo="types">
        <Space size="middle" wrap>
          <Button onClick={() => { message.success('这是一条成功消息'); setLastAction('success') }}>Success</Button>
          <Button onClick={() => { message.error('这是一条错误消息'); setLastAction('error') }}>Error</Button>
          <Button onClick={() => { message.warning('这是一条警告消息'); setLastAction('warning') }}>Warning</Button>
          <Button onClick={() => { message.info('这是一条普通提示'); setLastAction('info') }}>Info</Button>
          <Button onClick={() => { message.open({ content: '没有类型，也就没有图标' }); setLastAction('open 无类型') }}>无类型</Button>
        </Space>
      </div>
      <p class="mt-2 text-sm text-on-surface-variant">最近操作：<span data-message-last>{lastAction()}</span></p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">修改延时（单位：秒）</h3>
      <div data-message-demo="duration">
        <Space size="middle" wrap>
          <Button onClick={() => { message.success('这条 10 秒后才消失', 10); setLastAction('duration=10') }}>10 秒</Button>
          <Button onClick={() => { message.warning({ content: '不会自动消失（duration=0），悬停也不影响', key: 'manual', duration: 0 }); setLastAction('duration=0') }}>不自动关闭</Button>
          <Button danger onClick={() => { message.destroy('manual'); setLastAction('destroy(key)') }}>关闭它</Button>
          <Button onClick={() => { message.info({ content: '悬停时暂停计时（默认）', duration: 2 }); setLastAction('pauseOnHover') }}>悬停暂停</Button>
          <Button onClick={() => { message.info({ content: '悬停不暂停', duration: 2, pauseOnHover: false }); setLastAction('pauseOnHover=false') }}>悬停不暂停</Button>
        </Space>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">加载中 / 更新消息内容 / Promise 接口</h3>
      <div data-message-demo="loading">
        <Space size="middle" wrap>
          <Button onClick={() => { const hide = message.loading('正在执行中..', 0); setTimeout(hide, 2500); setLastAction('loading，2.5 秒后调用返回值关闭') }}>显示加载中</Button>
          <Button variant="solid" color="primary" onClick={openUpdatable}>同 key 更新</Button>
          <Button onClick={sequential}>顺序显示</Button>
          <Button variant="outlined" onClick={() => { message.destroy(); setLastAction('destroy() 全部关闭') }}>destroy 全部</Button>
        </Space>
      </div>
      <p class="mt-2">
        <Text type="secondary">返回值可直接调用关闭，也可以 then 在关闭后继续；同 key 再次 open 会原地替换内容并重新计时。</Text>
      </p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义样式</h3>
      <div data-message-demo="style">
        <Space size="middle" wrap>
          <Button onClick={() => message.open({
            type: 'success',
            content: '对象形式的语义化样式',
            styles: { root: { 'background-color': '#f6ffed', border: '2px solid #95de64', 'border-radius': '16px' }, icon: { color: '#237804' }, title: { color: '#237804', 'font-weight': '600' } },
          })}>对象 styles</Button>
          <Button onClick={() => message.open({
            type: 'error',
            content: '函数形式的语义化样式（按 type 取色）',
            styles: ({ props }) => props.type === 'error' ? { root: { 'background-color': '#fff2f0', border: '2px solid #ffccc7' }, title: { color: '#cf1322' } } : {},
          })}>函数 styles</Button>
          <Button onClick={() => message.open({ type: 'info', content: '点击我关闭', key: 'clickable', duration: 0, onClick: () => message.destroy('clickable') })}>onClick</Button>
        </Space>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">堆叠与 maxCount</h3>
      <div data-message-demo="stack">
        <Space size="middle" wrap>
          <Button onClick={() => { for (let i = 1; i <= 5; i++) message.info({ content: `第 ${i} 条消息`, duration: 6 }); setLastAction('批量打开 5 条') }}>连续打开 5 条</Button>
          <Button onClick={() => { message.config({ maxCount: 3 }); setLastAction('maxCount=3') }}>maxCount = 3</Button>
          <Button onClick={() => { message.config({ maxCount: 0 }); setLastAction('maxCount 不限') }}>不限条数</Button>
        </Space>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">弹出位置（本库扩展：顶部 / 垂直居中 / 底部）</h3>
      <p class="text-sm text-on-surface-variant mb-3">antd 只有顶部；placement 由 MessageProvider / message.config 决定，下面的切换按钮实时驱动本页挂载的 Provider（与根 Provider 共用同一队列）。</p>
      <MessageProvider placement={placement()} />
      <div data-message-demo="placement">
        <Space size="middle" wrap>
          <Button variant={placement() === 'top' ? 'solid' : 'outlined'} onClick={() => setPlacement('top')}>顶部</Button>
          <Button variant={placement() === 'center' ? 'solid' : 'outlined'} onClick={() => setPlacement('center')}>垂直居中</Button>
          <Button variant={placement() === 'bottom' ? 'solid' : 'outlined'} onClick={() => setPlacement('bottom')}>底部</Button>
          <Button variant="outlined" onClick={() => { message.info(`placement=${placement()}`); setLastAction(`placement=${placement()}`) }}>弹出一条</Button>
        </Space>
      </div>
    </div>
  )
}

export default MessagePage
