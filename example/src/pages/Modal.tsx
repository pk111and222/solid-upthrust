import { type Component, createSignal } from 'solid-js'
import { Modal, Button, Space, Divider, Typography } from 'upthrust-ui'

const { Text } = Typography

const ModalPage: Component = () => {
  const [basicOpen, setBasicOpen] = createSignal(false)
  const [asyncOpen, setAsyncOpen] = createSignal(false)
  const [customOpen, setCustomOpen] = createSignal(false)
  const [lastAction, setLastAction] = createSignal('（未操作）')

  // 异步 onOk：Promise 期间确定按钮 loading、弹窗保持打开，resolve 后才关闭
  const simulateAsyncOk = () => new Promise<void>(resolve => {
    setLastAction('onOk 返回 Promise → 按钮进入 loading，2 秒后自动关闭')
    setTimeout(resolve, 2000)
  })

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Modal 对话框</h2>
      <p class="text-on-surface-variant mb-6">模态对话框：遮罩 + 居中面板，需要用户处理事务。关闭意图（遮罩点击 / ESC / × / 取消 / 确定）统一经过同一套状态机——支持 veto 与异步门（Promise 未决时保持打开）。与 Drawer 共用同一 headless 层。</p>

      <h3 class="text-lg font-semibold mb-3">基础用法</h3>
      <Space size="middle" wrap>
        <Button variant="solid" onClick={() => { setBasicOpen(true); setLastAction('打开基础弹窗') }}>打开弹窗</Button>
      </Space>
      <Modal
        open={basicOpen()}
        title="基础弹窗"
        okText="确定"
        cancelText="取消"
        onCancel={() => { setBasicOpen(false); setLastAction('onCancel 关闭') }}
        onOk={() => { setBasicOpen(false); setLastAction('onOk 关闭') }}
      >
        <p>这是一段正文内容，支持多行。</p>
        <p class="text-on-surface-variant">点击遮罩或按 ESC 也会触发 onCancel（maskClosable / keyboard 默认开启）。</p>
      </Modal>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">异步关闭（onOk 返回 Promise）</h3>
      <Space size="middle" wrap>
        <Button onClick={() => { setAsyncOpen(true); setLastAction('打开异步弹窗') }}>异步提交</Button>
      </Space>
      <Modal
        open={asyncOpen()}
        title="异步提交"
        okText="提交"
        onOk={async () => {
          await simulateAsyncOk()
          setAsyncOpen(false)
        }}
        onCancel={() => { setAsyncOpen(false); setLastAction('异步弹窗被取消') }}
      >
        <p>点击「提交」后按钮进入 loading，Promise resolve 前弹窗不会关闭（防重复提交：loading 期间再次点击无效）。</p>
      </Modal>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义页脚 / 隐藏页脚</h3>
      <Space size="middle" wrap>
        <Button onClick={() => { setCustomOpen(true); setLastAction('打开自定义页脚弹窗') }}>自定义页脚</Button>
      </Space>
      <Modal
        open={customOpen()}
        title="自定义页脚"
        footer={
          <Space size="middle">
            <Button variant="text" onClick={() => { setCustomOpen(false); setLastAction('知道了') }}>知道了</Button>
            <Button variant="solid" onClick={() => { setCustomOpen(false); setLastAction('完成') }}>完成</Button>
          </Space>
        }
        onCancel={() => setCustomOpen(false)}
      >
        <p>footer 传 null 可完全隐藏页脚；传自定义 JSX 替换默认的「取消 / 确定」行。</p>
      </Modal>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">生命周期回调</h3>
      <p class="mt-1"><Text type="secondary">最近操作：{lastAction()}</Text></p>
      <p class="mt-2"><Text type="secondary">afterClose 在离场动画结束后触发；afterOpenChange 在开/关两侧都会触发（ true → 打开完成，false → 关闭完成）。快速开关时（动画未结束就重开），pending 的销毁会被取消，DOM 复用。</Text></p>
      <Divider />
      <h3 class="text-lg font-semibold mb-3">静态方法与更新</h3>
      <Space wrap>
        <Button onClick={() => Modal.confirm({ title: '删除确认', content: '确认后异步提交，失败将保留弹窗以便重试。', onOk: () => new Promise(resolve => setTimeout(resolve, 800)) })}>Modal.confirm</Button>
        <Button onClick={() => Modal.info({ title: '提示', content: '支持无需预先挂载的静态入口。' })}>info</Button>
        <Button onClick={() => Modal.success({ title: '完成', content: '操作成功' })}>success</Button>
        <Button onClick={() => Modal.warning({ title: '警告', content: '请检查输入' })}>warning</Button>
        <Button onClick={() => Modal.error({ title: '错误', content: '稍后重试' })}>error</Button>
        <Button onClick={() => { const instance = Modal.info({ title: '正在准备', content: '稍后自动更新' }); setTimeout(() => instance.update({ title: '已准备好', content: '可调用返回值的 destroy() 关闭' }), 1000) }}>动态更新</Button>
        <Button onClick={() => Modal.destroyAll()}>关闭全部静态弹窗</Button>
      </Space>
    </div>
  )
}

export default ModalPage
