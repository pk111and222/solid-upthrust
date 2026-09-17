import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import Tabs, { type TabsIns } from 'upthrust-ui/source/Tabs'

export default function Demo() {
  let ins: TabsIns | undefined

  return <div class="flex flex-col gap-3">
    <Space size="middle">
      <Button onClick={() => ins?.prevTab()}>上一个</Button>
      <Button onClick={() => ins?.nextTab()}>下一个</Button>
      <Button variant="outlined" onClick={() => ins?.setActiveKey('3')}>跳到选项卡三</Button>
    </Space>
    <Tabs ref={(v) => { ins = v }} items={[
      { key: '1', label: '选项卡一', children: <div class="pt-4 text-on-surface-variant">通过 ref 命令式控制</div> },
      { key: '2', label: '选项卡二', children: <div class="pt-4 text-on-surface-variant">nextTab/prevTab 跳过禁用项</div> },
      { key: '3', label: '选项卡三', children: <div class="pt-4 text-on-surface-variant">setActiveKey 直接跳转</div> },
    ]} />
  </div>
}
