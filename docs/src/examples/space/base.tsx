import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'

export default function Base() {
  return <Space data-space-base>
    默认间距 8px
    <Button type="primary">主按钮</Button>
    <Button>次按钮</Button>
    <Button type="dashed">虚线按钮</Button>
    {/* false / null / 空串不产生子项，也不占间距；数字 0 会正常渲染。 */}
    {false}
    {0}
  </Space>
}
