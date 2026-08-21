import { type Component, createSignal } from 'solid-js'
import { QRCode, Divider, Space, Button } from 'upthrust-ui'

const QRCodePage: Component = () => {
  const [status, setStatus] = createSignal<'active' | 'expired' | 'loading' | 'scanned'>('active')
  const [value, setValue] = createSignal('https://upthrust.dev')
  const [nonce, setNonce] = createSignal(0)

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">QRCode 二维码</h2>
      <p class="text-on-surface-variant mb-6">二维码容器，支持自定义配色、logo 与状态遮罩。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <Space size="large" align="start">
        <div class="flex flex-col items-center gap-2">
          <QRCode value={value()} />
          <span class="text-sm text-on-surface-variant">默认 160px</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <QRCode value={value()} size={100} />
          <span class="text-sm text-on-surface-variant">100px</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <QRCode value={value()} size={220} />
          <span class="text-sm text-on-surface-variant">220px</span>
        </div>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">配色与无边框</h3>
      <Space size="large" align="start">
        <QRCode value={value()} color="#1677ff" bgColor="#f0f5ff" />
        <QRCode value={value()} color="#722ed1" bordered={false} />
        <QRCode value={value()} color="#fa541c" />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">纠错等级</h3>
      <Space size="large" align="start">
        <div class="flex flex-col items-center gap-2">
          <QRCode value={value()} errorLevel="L" />
          <span class="text-sm text-on-surface-variant">L · 7%</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <QRCode value={value()} errorLevel="M" />
          <span class="text-sm text-on-surface-variant">M · 15%</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <QRCode value={value()} errorLevel="H" />
          <span class="text-sm text-on-surface-variant">H · 30%</span>
        </div>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">状态与刷新</h3>
      <Space size="large" align="start">
        <div class="flex flex-col items-center gap-2">
          <QRCode
            value={`${value()}?t=${nonce()}`}
            status={status()}
            onRefresh={() => { setNonce(n => n + 1); setStatus('active') }}
          />
          <span class="text-sm text-on-surface-variant">当前: {status()}</span>
        </div>
      </Space>
      <Space class="mt-4">
        <Button size="small" variant="outlined" onClick={() => setStatus('active')}>active</Button>
        <Button size="small" variant="outlined" onClick={() => setStatus('loading')}>loading</Button>
        <Button size="small" variant="outlined" onClick={() => setStatus('expired')}>expired</Button>
        <Button size="small" variant="outlined" onClick={() => setStatus('scanned')}>scanned</Button>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">动态内容</h3>
      <Space align="center">
        <input
          class="h-control rounded border border-outline px-2 text-[14px] outline-none focus:border-primary"
          value={value()}
          onInput={(e) => setValue(e.currentTarget.value)}
          placeholder="输入要编码的内容"
        />
        <QRCode value={value() || ' '} size={120} />
      </Space>
    </div>
  )
}

export default QRCodePage
