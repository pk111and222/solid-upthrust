import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'

export default function Block() {
  return <Space orientation="vertical" block data-space-block>
    <Button type="primary" block>撑满宽度的按钮</Button>
    <Button block>纵向 + block：子项宽度随容器</Button>
  </Space>
}
