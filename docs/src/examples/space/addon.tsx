import Button from 'upthrust-ui/source/Button'
import Input from 'upthrust-ui/source/Input'
import Space from 'upthrust-ui/source/Space'

export default function AddonDemo() {
  return <Space orientation="vertical" size="middle">
    <Space.Compact data-compact="addon">
      <Space.Addon>https://</Space.Addon>
      <Input placeholder="example.com" class="w-[200px]" />
      <Space.Addon>.cn</Space.Addon>
    </Space.Compact>
    <Space.Compact>
      <Input placeholder="金额" class="w-[160px]" />
      <Space.Addon>元</Space.Addon>
      <Button type="primary">充值</Button>
    </Space.Compact>
  </Space>
}
