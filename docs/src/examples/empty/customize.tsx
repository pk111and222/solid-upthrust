import Button from 'upthrust-ui/source/Button'
import Empty from 'upthrust-ui/source/Empty'
import { Text } from 'upthrust-ui/source/Typography'

export default function Customize() {
  return <Empty
    image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
    styles={{ image: { height: '60px' } }}
    description={<Text>自定义 <a href="#empty-api">描述</a></Text>}
  >
    <Button type="primary">立即创建</Button>
  </Empty>
}
