import { type Component, createSignal } from 'solid-js'
import { Message, MessageProvider, Button, Space, Divider, Typography } from 'upthrust-ui'

const { Text } = Typography

const MessagePage: Component = () => {
  const [loadingKey, setLoadingKey] = createSignal('')
  const [lastAction, setLastAction] = createSignal('（未操作）')
  const [placement, setPlacement] = createSignal<'top' | 'center' | 'bottom'>('top')

  // 命令式调用 loading → 异步完成后 update 为 success（同一个 key 原地更新，不新开一条）
  const simulateAsync = () => {
    const handle = Message.loading({ content: '正在加载中...', key: 'async-demo', duration: 0 })
    setLoadingKey(handle.key)
    setLastAction('loading 打开（duration=0 不自动关闭）')
    setTimeout(() => {
      handle.update({ type: 'success', content: '加载完成（原地更新，同一通知）', duration: 2000 })
      setLastAction('update 为 success，2 秒后自动关闭')
    }, 1500)
  }

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Message 全局提示</h2>
      <p class="text-on-surface-variant mb-6">全局展示操作反馈信息。命令式调用（message.info(...) 等），同一页面共用一个单例队列，多条按出现顺序堆叠；通知消失后堆栈收回顶部，新通知始终从顶部弹出。</p>

      <div class="flex flex-col items-center justify-center min-h-[50vh] rounded-lg border border-dashed border-outline-variant mb-2">
        <p class="text-on-surface-variant mb-6">在中央区域体验全局提示——通知从页面顶部弹出，与触发按钮位置无关</p>
        <Space size="middle" wrap>
          <Button onClick={() => { Message.info('这是一条普通的提示'); setLastAction('info 纯文本') }}>Info</Button>
          <Button variant="solid" onClick={() => { Message.success('操作成功'); setLastAction('success 纯文本') }}>Success</Button>
          <Button variant="outlined" onClick={() => { Message.warning('注意：这里有一条警告'); setLastAction('warning 纯文本') }}>Warning</Button>
          <Button danger onClick={() => { Message.error('操作失败，请重试'); setLastAction('error 纯文本') }}>Error</Button>
        </Space>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">四种状态与纯文本调用（紧凑排列）</h3>
      <Space size="middle" wrap>
        <Button onClick={() => { Message.info('这是一条普通的提示'); setLastAction('info 纯文本') }}>Info</Button>
        <Button variant="solid" onClick={() => { Message.success('操作成功'); setLastAction('success 纯文本') }}>Success</Button>
        <Button variant="outlined" onClick={() => { Message.warning('注意：这里有一条警告'); setLastAction('warning 纯文本') }}>Warning</Button>
        <Button danger onClick={() => { Message.error('操作失败，请重试'); setLastAction('error 纯文本') }}>Error</Button>
      </Space>
      <p class="mt-2 text-sm text-on-surface-variant">最近操作：{lastAction()}</p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">loading → 异步完成原地更新</h3>
      <Space size="middle">
        <Button onClick={simulateAsync}>模拟异步操作</Button>
        <Button
          variant="outlined"
          disabled={!loadingKey()}
          onClick={() => { Message.destroy(); setLoadingKey(''); setLastAction('destroy 全部关闭') }}
        >
          destroy 全部
        </Button>
      </Space>
      <p class="mt-2">
        <Text type="secondary">loading 不会自动关闭（duration=0）；1.5 秒后 update 为 success 并 2 秒自动消失——同 key 复用同一通知槽位。</Text>
      </p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义时长与手动关闭</h3>
      <Space size="middle" wrap>
        <Button onClick={() => { const h = Message.info({ content: '10 秒后才消失', duration: 10000 }); setLastAction(`10s 通知 key=${h.key}`) }}>
          10 秒提示
        </Button>
        <Button
          variant="outlined"
          onClick={() => { Message.close('10s-key'); setLastAction('close 指定 key') }}
        >
          关闭 key=10s-key
        </Button>
        <Button
          variant="outlined"
          onClick={() => { const h = Message.warning({ content: '不会自动消失，点击按钮关闭', key: 'manual', duration: 0 }); void h; setLastAction('手动关闭模式') }}
        >
          不自动关闭
        </Button>
        <Button danger onClick={() => { Message.close('manual'); setLastAction('关闭 manual') }}>关闭它</Button>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">堆叠与 maxCount</h3>
      <Space size="middle">
        <Button
          onClick={() => {
            for (let i = 1; i <= 5; i++) Message.info({ content: `第 ${i} 条消息（同时批量打开）`, duration: 6000 })
            setLastAction('批量打开 5 条')
          }}
        >
          连续打开 5 条
        </Button>
      </Space>
      <p class="mt-2">
        <Text type="secondary">同时打开多条会按顺序堆叠；超过 maxCount（默认 10）时最旧的会被挤掉。批量调用经过函数式更新，同批不会互相丢失。</Text>
      </p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">弹出位置（顶部 / 垂直居中 / 底部，始终水平居中）</h3>
      <p class="text-sm text-on-surface-variant mb-3">通知栈固定在视口水平居中，垂直方向由 MessageProvider 的 placement 决定：默认 top 从顶部弹出，center 在视口垂直居中弹出，bottom 从底部弹出。下面的切换按钮实时驱动本页挂载的 Provider（与根 Provider 共用同一队列）。</p>
      <MessageProvider placement={placement()} />
      <Space size="middle" wrap>
        <Button variant={placement() === 'top' ? 'solid' : 'outlined'} onClick={() => setPlacement('top')}>顶部弹出</Button>
        <Button variant={placement() === 'center' ? 'solid' : 'outlined'} onClick={() => setPlacement('center')}>垂直居中弹出</Button>
        <Button variant={placement() === 'bottom' ? 'solid' : 'outlined'} onClick={() => setPlacement('bottom')}>底部弹出</Button>
        <Button variant="outlined" onClick={() => {
          const label = placement() === 'top' ? '从顶部居中弹出' : placement() === 'center' ? '从视口垂直居中弹出' : '从底部居中弹出'
          Message.info(label)
          setLastAction(`placement=${placement()} 弹出示例`)
        }}>弹出一条</Button>
      </Space>
    </div>
  )
}

export default MessagePage
