import { type Component, createSignal } from 'solid-js'
import { Rate, Space, Divider, Typography, ConfigProvider, Form, FormItem, Button } from 'upthrust-ui'
import type { FormInstance, Store } from 'upthrust-competence'

const { Text } = Typography

const RatePage: Component = () => {
  const [basic, setBasic] = createSignal(3)
  const [half, setHalf] = createSignal(2.5)
  const [halfHover, setHalfHover] = createSignal(2.5)
  const [clearable, setClearable] = createSignal(4)
  const [last, setLast] = createSignal<number | string>('（未操作）')
  const [result, setResult] = createSignal('尚未提交')
  let ratingElement: HTMLUListElement | undefined
  const [focusEvent, setFocusEvent] = createSignal('尚未聚焦')
  const [autoFocus, setAutoFocus] = createSignal(false)
  let form: FormInstance | undefined

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">Rate 评分</h2>
      <p class="text-on-surface-variant mb-6">
        headless createRate —— 底层复用共享 createNumericValue 数值机（与 InputNumber / Slider
        同一引擎，min=0 max=count step=0.5|1），本层只增加 hover 预览与半星。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础（受控）</h3>
      <div data-rate-demo="basic" class="max-w-md flex flex-col gap-3">
        <Rate aria-label="服务评分" value={basic()} onChange={setBasic} />
        <output>评分：{basic()} 星</output>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">半星 allowHalf</h3>
      <div data-rate-demo="half" class="max-w-md flex flex-col gap-3">
        <Rate aria-label="半星评分" value={half()} allowHalf onChange={setHalf} onHoverChange={setHalfHover} />
        <output>提交：{half()}；预览：{halfHover()}</output>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">可清空 / 禁用 / 自定义数量</h3>
      <div data-rate-demo="states"><Space direction="vertical" size="middle">
        <div class="flex items-center gap-3">
          <Rate aria-label="可清空评分" value={clearable()} allowClear onChange={setClearable} />
          <Text type="secondary">当前值：{clearable()}（点当前值清零）</Text>
        </div>
        <Rate aria-label="禁用评分" defaultValue={3} disabled />
        <Rate aria-label="十级评分" defaultValue={2} count={10} />
      </Space></div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">非受控 + 事件</h3>
      <div data-rate-demo="events" class="max-w-md flex flex-col gap-3">
        <Rate aria-label="事件评分" defaultValue={3} onChange={v => setLast(v)} autoFocus={autoFocus()}
          ref={el => { ratingElement = el }} onFocus={() => setFocusEvent('已聚焦')} onBlur={() => setFocusEvent('已失焦')} />
        <Button onClick={() => ratingElement?.focus()}>通过 ref 聚焦</Button>
        <Button onClick={() => setAutoFocus(true)}>启用自动聚焦</Button>
        <output>{focusEvent()}</output>
        <Text type="secondary">最近一次 onChange：{last()}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">Form 与全局禁用</h3>
      <div data-rate-demo="context">
        <ConfigProvider componentDisabled>
          <div class="flex flex-col gap-3">
            <Rate aria-label="全局禁用" defaultValue={3} />
            <Form disabled={false} initialValues={{ rating: 2 }} ref={instance => { form = instance }} onFinish={(values: Store) => setResult(JSON.stringify(values))}>
              <FormItem name="rating" label="满意度"><Rate aria-label="表单评分" allowHalf /></FormItem>
              <div class="flex gap-2"><Button type="primary" htmlType="submit">提交评分</Button><Button onClick={() => { form?.resetFields(); setResult('尚未提交') }}>重置评分</Button></div>
            </Form>
            <output>{result()}</output>
          </div>
        </ConfigProvider>
      </div>
    </div>
  )
}

export default RatePage
