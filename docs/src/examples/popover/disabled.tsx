import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import Popover from 'upthrust-ui/source/Popover'

export default function Demo() {
  const [disabled, setDisabled] = createSignal(true)

  return <Space size="middle">
    <Button onClick={() => setDisabled(!disabled())}>
      {disabled() ? '启用触发器' : '禁用触发器'}
    </Button>
    {/* 内层按钮保持可聚焦/可悬停，只切换 Popover.disabled 本身，
        避免原生 disabled 屏蔽指针事件而无法测试 Popover 自己的开关限制。 */}
    <Popover title="禁用状态" content="disabled 为 true 时永不出现" disabled={disabled()}>
      <Button>动态 disabled</Button>
    </Popover>
  </Space>
}
