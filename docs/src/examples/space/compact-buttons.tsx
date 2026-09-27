import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'

export default function CompactButtons() {
  return <Space orientation="vertical" size="middle">
    <Space.Compact data-compact="buttons">
      <Button>上一步</Button>
      <Button>重置</Button>
      <Button>下一步</Button>
    </Space.Compact>
    <Space.Compact data-compact="primary">
      <Button type="primary">编辑</Button>
      <Button type="primary">复制</Button>
      <Button type="primary">删除</Button>
    </Space.Compact>
    <Space.Compact data-compact="single">
      <Button>只有一个子元素时保留全部圆角</Button>
    </Space.Compact>
  </Space>
}
