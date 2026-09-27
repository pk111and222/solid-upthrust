import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'

export default function Wrap() {
  return <Space size={[8, 16]} wrap data-space-wrap>
    {Array.from({ length: 20 }, (_, i) => <Button>按钮 {i + 1}</Button>)}
  </Space>
}
