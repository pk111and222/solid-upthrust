import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import Tooltip from 'upthrust-ui/source/Tooltip'

export default function Demo() {
  const [disabled, setDisabled] = createSignal(true)

  return <Space size="middle">
    <Button onClick={() => setDisabled(!disabled())}>
      {disabled() ? '启用触发器' : '禁用触发器'}
    </Button>
    <Tooltip title="disabled 为 true 时永不出现" disabled={disabled()}>
      {/* 内层按钮保持可聚焦/可悬停，只切换 Tooltip.disabled 本身，
          避免原生 disabled 屏蔽指针事件而无法测试 Tooltip 自己的开关限制。 */}
      <Button>动态 disabled</Button>
    </Tooltip>
    <Tooltip title="悬停 500ms 后才显示" mouseEnterDelay={500}>
      <Button variant="outlined">延迟打开</Button>
    </Tooltip>
    <Tooltip title="离开 800ms 后才隐藏，可移到浮层上暂停倒计时" mouseLeaveDelay={800}>
      <Button variant="outlined">延迟关闭</Button>
    </Tooltip>
  </Space>
}
