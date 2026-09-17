import { type Component, createSignal, Show, For } from 'solid-js'
import { Switch, Button, Space, Divider, Typography, Alert, Form, FormItem } from 'upthrust-ui'
import { type FormInstance, type Store } from 'upthrust-competence'

const { Text, Title } = Typography

const SwitchPage: Component = () => {
  const [checked, setChecked] = createSignal(true)
  const [loading, setLoading] = createSignal(false)
  let formRef: FormInstance | undefined
  const [submitResult, setSubmitResult] = createSignal('')

  const simulateLoading = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  const handleFinish = (values: Store) => {
    setSubmitResult(JSON.stringify(values, null, 2))
  }

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">Switch 开关</h2>
      <p class="text-on-surface-variant mb-6">
        headless createSwitch（受控/非受控 checked、loading/disabled 门控）+ UI 层。
        antd 视觉规格：track 22×44 圆角胶囊、16px 白色滑块、active 挤压。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础</h3>
      <Space direction="vertical" size="middle">
        <Space>
          <Text type="secondary">受控（当前 {String(checked())}）：</Text>
          <Switch checked={checked()} onChange={v => setChecked(v)} />
        </Space>
        <Space>
          <Text type="secondary">默认开：</Text>
          <Switch defaultChecked />
          <Text type="secondary">默认关：</Text>
          <Switch />
        </Space>
        <Space>
          <Text type="secondary">带文案：</Text>
          <Switch defaultChecked checkedChildren="开" unCheckedChildren="关" />
          <Switch checkedChildren="1" unCheckedChildren="0" />
        </Space>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">尺寸与状态</h3>
      <Space direction="vertical" size="middle">
        <Space>
          <Switch defaultChecked size="small" />
          <Switch defaultChecked />
        </Space>
        <Space>
          <Text type="secondary">disabled：</Text>
          <Switch defaultChecked disabled />
          <Switch disabled />
        </Space>
        <Space>
          <Text type="secondary">loading（模拟异步切换）：</Text>
          <Switch checked={checked()} loading={loading()} onChange={v => setChecked(v)} />
          <Button size="small" onClick={simulateLoading}>模拟 loading 2s</Button>
        </Space>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">表单集成</h3>
      <Form
        ref={f => { formRef = f }}
        labelWidth="110px"
        onFinish={handleFinish}
      >
        <FormItem name="enabled" label="启用通知" initialValue={false}>
          <Switch />
        </FormItem>
        <FormItem
          name="marketing"
          label="订阅营销"
          initialValue={true}
          extra="value=true 让表单收集布尔值"
        >
          <Switch checkedChildren="订阅" unCheckedChildren="不订阅" />
        </FormItem>
        <FormItem label="">
          <Space>
            <Button variant="solid" onClick={() => { void formRef?.submit().catch(() => {}) }}>提交</Button>
          </Space>
        </FormItem>
      </Form>

      <Show when={submitResult()}>
        <div class="mt-4">
          <Alert type="success" message="提交成功" description={<pre class="text-[12px] whitespace-pre-wrap">{submitResult()}</pre>} />
        </div>
      </Show>

      <Divider />

      <Title level={5}>API 说明</Title>
      <div class="text-on-surface-variant text-[13px] leading-6">
        <p>· <Text code>Switch</Text>：checked / defaultChecked / value / defaultValue / checkedChildren / unCheckedChildren / disabled / loading / size / onChange(checked)</p>
        <p>· loading 与 disabled 都会阻断切换；loading 显示滑块内旋转图标。</p>
        <p>· 表单集成：Item value 绑定布尔值，onChange 收到 boolean。</p>
      </div>
    </div>
  )
}

export default SwitchPage
