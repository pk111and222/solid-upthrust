import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import Popconfirm from 'upthrust-ui/source/Popconfirm'

export default function Demo() {
  return <Space>
    <Popconfirm title="确定删除吗？" okText="Yes" cancelText="No">
      <Button>自定义按钮文字</Button>
    </Popconfirm>
    <Popconfirm title="确定删除吗？" okType="danger" okText="删除" okButtonProps={{ variant: 'solid' }}>
      <Button danger>危险确认</Button>
    </Popconfirm>
    <Popconfirm title="已知晓风险" showCancel={false} okText="知道了">
      <Button>隐藏取消按钮</Button>
    </Popconfirm>
  </Space>
}
