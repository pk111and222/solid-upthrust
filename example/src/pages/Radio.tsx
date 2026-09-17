import { type Component, createSignal, Show } from 'solid-js'
import { Radio, RadioGroup, Space, Divider, Typography } from 'upthrust-ui'

const { Text } = Typography

const RadioPage: Component = () => {
  const [plainValue, setPlainValue] = createSignal<string | number>('apple')
  const [btnValue, setBtnValue] = createSignal<string | number>('a')
  const [formValue, setFormValue] = createSignal<string | number | undefined>()

  const fruits = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃（禁用）', value: 'cherry', disabled: true },
  ]

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">Radio 单选框</h2>
      <p class="text-on-surface-variant mb-6">
        headless createRadio / createRadioGroup —— 单选组底层复用共享 selection store
        （maxSelect: 1），与 Checkbox.Group、未来的 Select 同一引擎。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础用法</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <RadioGroup
          options={fruits}
          value={plainValue()}
          onChange={setPlainValue}
        />
        <Text type="secondary">当前值：{String(plainValue())}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">按钮样式（optionType="button"）</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <RadioGroup
          options={[
            { label: '北京', value: 'a' },
            { label: '上海', value: 'b' },
            { label: '广州', value: 'c' },
            { label: '深圳', value: 'd' },
          ]}
          optionType="button"
          value={btnValue()}
          onChange={setBtnValue}
        />
        <Text type="secondary">当前值：{String(btnValue())}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">整组禁用 / 默认值 / 非受控</h3>
      <Space direction="vertical" size="middle">
        <RadioGroup options={fruits} disabled defaultValue="banana" />
        <RadioGroup options={fruits} />
        <Radio defaultChecked>独立 Radio（非受控）</Radio>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">表单集成</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <RadioGroup
          options={[
            { label: '选项一', value: '1' },
            { label: '选项二', value: '2' },
            { label: '选项三', value: '3' },
          ]}
          value={formValue()}
          onChange={setFormValue}
        />
        <Text type="secondary">已选：{formValue() ? String(formValue()) : '（未选）'}</Text>
      </div>
    </div>
  )
}

export default RadioPage
