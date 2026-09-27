import Button from 'upthrust-ui/source/Button'
import Input from 'upthrust-ui/source/Input'
import Select from 'upthrust-ui/source/Select'
import Space from 'upthrust-ui/source/Space'

export default function CompactDemo() {
  return <Space orientation="vertical" size="middle" class="w-full">
    <Space.Compact data-compact="search">
      <Input placeholder="搜索关键字" class="w-[220px]" />
      <Button type="primary">搜索</Button>
    </Space.Compact>
    <Space.Compact data-compact="select">
      <Select class="w-[120px]" value="zhejiang" options={[{ label: '浙江', value: 'zhejiang' }, { label: '江苏', value: 'jiangsu' }]} />
      <Input placeholder="详细地址" class="w-[220px]" />
    </Space.Compact>
    <Space.Compact block data-compact="block">
      <Input placeholder="撑满父容器宽度（flex-1 填充剩余）" class="flex-1" />
      <Button>提交</Button>
    </Space.Compact>
  </Space>
}
