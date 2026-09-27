import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'

export default function CompactVertical() {
  return <Space>
    <Space.Compact orientation="vertical" data-compact="vertical">
      <Button>按钮 1</Button>
      <Button>按钮 2</Button>
      <Button>按钮 3</Button>
    </Space.Compact>
    <Space.Compact orientation="vertical">
      <Button type="dashed">按钮 1</Button>
      <Button type="dashed">按钮 2</Button>
      <Button type="dashed">按钮 3</Button>
    </Space.Compact>
  </Space>
}
