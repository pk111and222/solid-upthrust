import Tabs from 'upthrust-ui/source/Tabs'

export default function Demo() {
  return <Tabs centered items={[
    { key: '1', label: '选项一', children: <div class="pt-4 text-on-surface-variant">居中的选项卡内容一</div> },
    { key: '2', label: '选项二', children: <div class="pt-4 text-on-surface-variant">居中的选项卡内容二</div> },
    { key: '3', label: '选项三', children: <div class="pt-4 text-on-surface-variant">居中的选项卡内容三</div> },
  ]} />
}
