import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import Tooltip, { type TooltipIns } from 'upthrust-ui/source/Tooltip'

export default function Demo() {
  let ins: TooltipIns | undefined

  return <Space size="middle">
    <Tooltip title="通过 ref.setOpen 命令式控制" ref={(v) => { ins = v }}>
      <Button variant="outlined">ref 绑定的触发器</Button>
    </Tooltip>
    <Button onPointerDown={e => e.stopPropagation()} onClick={() => ins?.setOpen(!ins.open())}>
      {ins?.open() ? '通过 ref 关闭' : '通过 ref 打开'}
    </Button>
  </Space>
}
