import { type Component, createSignal, Show, For } from 'solid-js'
import { Checkbox, CheckboxGroup, Button, Space, Divider, Typography, Alert, Form, FormItem } from 'upthrust-ui'
import { type FormInstance, type Store } from 'upthrust-competence'
import type { CheckboxOption } from 'upthrust-ui'

const { Text, Title } = Typography

const CheckboxPage: Component = () => {
  const [checked, setChecked] = createSignal(false)
  const [indeterminate, setIndeterminate] = createSignal(true)
  const [groupValue, setGroupValue] = createSignal<Array<string | number>>(['apple'])
  let formRef: FormInstance | undefined
  const [submitResult, setSubmitResult] = createSignal('')

  const fruits: CheckboxOption[] = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃', value: 'cherry', disabled: true },
  ]

  const toggleAll = () => {
    const allSelected = fruits.every(f => groupValue().includes(f.value))
    setGroupValue(allSelected ? [] : fruits.filter(f => !f.disabled).map(f => f.value))
  }

  const handleGroupChange = (v: Array<string | number>) => {
    setGroupValue(v)
    setChecked(v.length === fruits.filter(f => !f.disabled).length)
    setIndeterminate(v.length > 0 && v.length < fruits.filter(f => !f.disabled).length)
  }

  const handleFinish = (values: Store) => {
    setSubmitResult(JSON.stringify(values, null, 2))
  }

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">Checkbox 多选框</h2>
      <p class="text-on-surface-variant mb-6">
        headless createCheckbox / createCheckboxGroup（受控 checked、indeterminate 纯展示、
        group 的 value 数组与半选态）+ UI 层（原生 input 隐藏但可聚焦）。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础</h3>
      <Space direction="vertical" size="middle">
        <Space>
          <Text type="secondary">受控（当前 {String(checked())}）：</Text>
          <Checkbox checked={checked()} onChange={v => setChecked(v)}>
            同意用户协议
          </Checkbox>
        </Space>
        <Space>
          <Checkbox defaultChecked>默认勾选</Checkbox>
          <Checkbox>默认不勾</Checkbox>
        </Space>
        <Space>
          <Checkbox disabled>禁用未选</Checkbox>
          <Checkbox disabled defaultChecked>禁用已选</Checkbox>
        </Space>
        <Space>
          <Checkbox indeterminate>半选（indeterminate）</Checkbox>
        </Space>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">全选 / 半选联动</h3>
      <Space direction="vertical">
        <Checkbox
          checked={checked()}
          indeterminate={indeterminate()}
          onChange={v => {
            setChecked(v)
            setIndeterminate(false)
            setGroupValue(v ? fruits.filter(f => !f.disabled).map(f => f.value) : [])
          }}
        >
          全选水果
        </Checkbox>
        <CheckboxGroup
          value={groupValue()}
          options={fruits}
          onChange={handleGroupChange}
        />
        <Button size="small" onClick={toggleAll}>编程式全选/清空</Button>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">Group 受控</h3>
      <Space direction="vertical">
        <CheckboxGroup
          value={groupValue()}
          options={fruits}
          onChange={handleGroupChange}
        />
        <Text type="secondary">当前值：{JSON.stringify(groupValue())}</Text>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">表单集成</h3>
      <Form
        ref={f => { formRef = f }}
        labelWidth="110px"
        onFinish={handleFinish}
      >
        <FormItem
          name="agree"
          label="协议"
          rules={[{ validator: (_r, v) => v ? Promise.resolve() : Promise.reject(new Error('请先勾选协议')) }]}
        >
          <Checkbox>
            我已阅读并同意
          </Checkbox>
        </FormItem>
        <FormItem
          name="fruits"
          label="喜欢的水果"
          initialValue={['apple']}
          rules={[{ required: true, type: 'array', min: 1, message: '至少选一个' }]}
        >
          <CheckboxGroup options={fruits} />
        </FormItem>
        <FormItem label="">
          <Button variant="solid" onClick={() => { void formRef?.submit().catch(() => {}) }}>提交</Button>
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
        <p>· <Text code>Checkbox</Text>：checked / defaultChecked / indeterminate / disabled / skipGroup / value / onChange(checked)</p>
        <p>· <Text code>CheckboxGroup</Text>：value / defaultValue / options / disabled / onChange(value[])</p>
        <p>· indeterminate 纯展示，不参与 checked 运算；group 内 option.disabled 单独禁用该项。</p>
      </div>
    </div>
  )
}

export default CheckboxPage
