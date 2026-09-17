import { type Component, createSignal, Show } from 'solid-js'
import { Input, InputPassword, InputSearch, InputTextArea, Space, Divider, Typography, Button } from 'upthrust-ui'

const { Text } = Typography

const InputPage: Component = () => {
  const [basic, setBasic] = createSignal('')
  const [controlled, setControlled] = createSignal('受控值')
  const [lastChange, setLastChange] = createSignal('（未输入）')
  const [searchVal, setSearchVal] = createSignal('')
  const [taValue, setTaValue] = createSignal('')

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Input 输入框</h2>
      <p class="text-on-surface-variant mb-6">
        antd6 视觉对标：hover 主色边框、focus 边框 + 2px 光圈（ring）、disabled 三态、三尺寸（24/32/40px）。
        子组件 InputPassword / InputTextArea / InputSearch；支持 showCount / 前后缀 / allowClear（清空后自动回焦）。
        作为 Form.Item 子组件时自动注入 value / onChange / 校验状态（useFormItem 协议）。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础用法</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <Input placeholder="请输入内容" />
        <Input placeholder="非受控 + 默认值" defaultValue="hello" />
        <Input
          value={basic()}
          onChange={v => { setBasic(v); setLastChange(v || '（空）') }}
          placeholder="受控输入"
          allowClear
        />
        <p><Text type="secondary">最近输入：{lastChange()}</Text></p>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">前后缀与清空</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <Input placeholder="搜索…" prefix={<span class="i-mdi-magnify" />} allowClear />
        <Input placeholder="金额" suffix={<span class="text-[14px]">RMB</span>} />
        <Input placeholder="网址" prefix={<span class="i-mdi-web" />} suffix={<span class="i-mdi-open-in-new" />} />
        <Input
          placeholder="字数统计"
          showCount
          maxLength={20}
          onChange={v => setTaValue(v)}
          value={taValue()}
        />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">三种尺寸</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <Input placeholder="small" size="small" />
        <Input placeholder="middle（默认）" />
        <Input placeholder="large" size="large" />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">状态：禁用 / 错误 / 警告</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <Input placeholder="禁用" disabled />
        <Input defaultValue="错误状态" status="error" />
        <Input defaultValue="警告状态" status="warning" />
        <Input defaultValue="禁用 + 错误" status="error" disabled />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">密码框 InputPassword</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <InputPassword placeholder="点击眼睛切换明文" />
        <InputPassword placeholder="hover 切换" action="hover" />
        <InputPassword placeholder="无切换按钮" visibilityToggle={false} />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">文本域 InputTextArea</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <InputTextArea placeholder="固定 3 行" rows={3} />
        <InputTextArea
          placeholder="自适应高度（最多 6 行）"
          autoSize={{ minRows: 2, maxRows: 6 }}
        />
        <InputTextArea
          placeholder="字数统计 + 清空"
          showCount
          maxLength={100}
          allowClear
          value={taValue()}
          onChange={setTaValue}
        />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">搜索框 InputSearch</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <InputSearch
          placeholder="输入后按 Enter"
          allowClear
          onSearch={(v, _e, info) => setSearchVal(`${v || '（空）'}（${info?.source ?? 'input'}）`)}
        />
        <InputSearch
          placeholder="带搜索按钮"
          enterButton
          loading={false}
          onSearch={v => setSearchVal(v)}
        />
        <InputSearch
          placeholder="自定义按钮文案"
          enterButton="搜索"
          onSearch={v => setSearchVal(v)}
        />
        <Show when={searchVal()}>
          <p><Text type="secondary">最近搜索：{searchVal()}</Text></p>
        </Show>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">事件：onChange / onPressEnter</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <Input
          value={controlled()}
          onChange={setControlled}
          onPressEnter={() => setLastChange(`回车确认：${controlled()}`)}
          placeholder="按回车试试"
          allowClear
        />
        <Space size="small">
          <Button size="small" onClick={() => setControlled('')}>清空</Button>
          <Button size="small" onClick={() => setControlled('受控值')}>恢复默认</Button>
        </Space>
        <p><Text type="secondary">当前值：{controlled() || '（空）'}</Text></p>
      </div>
    </div>
  )
}

export default InputPage
