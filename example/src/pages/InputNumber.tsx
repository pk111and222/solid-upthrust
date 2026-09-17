import { type Component, createSignal, Show } from 'solid-js'
import { InputNumber, Button, Space, Divider, Typography, Alert, Form, FormItem } from 'upthrust-ui'
import { type FormInstance, type Store } from 'upthrust-competence'

const { Text, Title } = Typography

const InputNumberPage: Component = () => {
  const [basicValue, setBasicValue] = createSignal<number | null>(3)
  let formRef: FormInstance | undefined
  const [submitResult, setSubmitResult] = createSignal('')
  const [failInfo, setFailInfo] = createSignal('')

  const handleFinish = (values: Store) => {
    setFailInfo('')
    setSubmitResult(JSON.stringify(values, null, 2))
  }

  const handleFinishFailed = (errorInfo: any) => {
    setSubmitResult('')
    setFailInfo(`校验失败：${errorInfo.errorFields.map((f: any) => f.name.join('.')).join('、')}`)
  }

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">InputNumber 数字输入框</h2>
      <p class="text-on-surface-variant mb-6">
        headless createInputNumber（缓冲区/解析/步进/clamp/精度机）+ UI 层。
        键盘 Up/Down 步进（Shift ×10）、越界红字、blur 吸回范围。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础</h3>
      <Space direction="vertical" size="middle">
        <Space>
          <Text type="secondary">受控（当前 {basicValue() ?? '空'}）：</Text>
          <InputNumber
            value={basicValue()}
            onChange={v => setBasicValue(v)}
            min={1}
            max={10}
          />
        </Space>
        <Space>
          <Text type="secondary">默认值 5：</Text>
          <InputNumber defaultValue={5} />
        </Space>
        <Space>
          <Text type="secondary">min=1 max=10（越界试试 99）：</Text>
          <InputNumber min={1} max={10} />
        </Space>
        <Space>
          <Text type="secondary">step=0.1 精度 1：</Text>
          <InputNumber defaultValue={0.1} step={0.1} />
        </Space>
        <Space>
          <Text type="secondary">step=100（Shift+Up = 1000）：</Text>
          <InputNumber defaultValue={100} step={100} />
        </Space>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">尺寸与状态</h3>
      <Space direction="vertical" size="middle">
        <Space>
          <InputNumber defaultValue={1} size="small" />
          <InputNumber defaultValue={1} />
          <InputNumber defaultValue={1} size="large" />
        </Space>
        <Space>
          <InputNumber defaultValue={8} disabled />
          <InputNumber defaultValue={8} readonly />
          <InputNumber status="error" defaultValue={8} />
        </Space>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">prefix / suffix / formatter</h3>
      <Space direction="vertical" size="middle">
        <Space>
          <InputNumber defaultValue={1000} formatter={v => `$ ${v.toLocaleString()}`} />
        </Space>
        <Space>
          <InputNumber defaultValue={100} suffix={<span class="text-on-surface-variant text-[12px]">%</span>} />
          <InputNumber defaultValue={30} prefix={<span class="text-on-surface-variant text-[12px]">≥</span>} />
        </Space>
        <Space>
          <InputNumber
            defaultValue={5}
            controls={false}
            suffix={<span class="text-on-surface-variant text-[12px]">（无步进）</span>}
          />
        </Space>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">表单集成</h3>
      <Form
        ref={f => { formRef = f }}
        labelWidth="110px"
        onFinish={handleFinish}
        onFinishFailed={handleFinishFailed}
      >
        <FormItem
          name="quantity"
          label="数量"
          rules={[{ required: true, message: '请输入数量' }]}
        >
          <InputNumber min={1} max={99} style={{ width: '120px' }} />
        </FormItem>
        <FormItem
          name="price"
          label="价格"
          hasFeedback
          rules={[
            { required: true, message: '请输入价格' },
            { type: 'number', min: 0.01, message: '价格必须大于 0.01' },
          ]}
        >
          <InputNumber
            min={0}
            step={0.01}
            precision={2}
            prefix={<span class="text-on-surface-variant text-[12px]">¥</span>}
            style={{ width: '140px' }}
          />
        </FormItem>
        <FormItem label="">
          <Space>
            <Button variant="solid" onClick={() => { void formRef?.submit().catch(() => {}) }}>提交</Button>
            <Button onClick={() => { formRef?.resetFields(); setSubmitResult(''); setFailInfo('') }}>重置</Button>
          </Space>
        </FormItem>
      </Form>

      <Show when={failInfo()}>
        <div class="mt-4">
          <Alert type="error" message={failInfo()} closable />
        </div>
      </Show>

      <Show when={submitResult()}>
        <div class="mt-4">
          <Alert type="success" message="提交成功" description={<pre class="text-[12px] whitespace-pre-wrap">{submitResult()}</pre>} />
        </div>
      </Show>

      <Divider />

      <Title level={5}>API 说明</Title>
      <div class="text-on-surface-variant text-[13px] leading-6">
        <p>· <Text code>InputNumber</Text>：value / defaultValue / min / max / step / shiftMultiplier / precision / parser / formatter / prefix / suffix / controls / size / status / disabled / readonly / onStep</p>
        <p>· 键盘：Up/Down 步进（Shift ×10），Enter 触发 onPressEnter；blur 时越界值吸回范围。</p>
        <p>· 与 antd 的差异：onChange 直接传 number|null（Solid 惯例），formatter 入参为 number。</p>
      </div>
    </div>
  )
}

export default InputNumberPage
