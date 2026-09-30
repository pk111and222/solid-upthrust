import Alert from 'upthrust-ui/source/Alert'
import Flex from 'upthrust-ui/source/Flex'
import Spin from 'upthrust-ui/source/Spin'

// antd 的 contentStyle：padding 50、5% 黑底、4px 圆角。
const content = () => <div class="p-[50px] bg-black/5 rounded-sm" />

export default function Tip() {
  return <Flex gap="middle" vertical>
    <Flex gap="middle">
      <Spin description="Loading" size="small">{content()}</Spin>
      <Spin description="Loading">{content()}</Spin>
      <Spin description="Loading" size="large">{content()}</Spin>
    </Flex>
    <Spin description="Loading...">
      <Alert title="Alert message title" description="Further details about the context of this alert." type="info" />
    </Spin>
  </Flex>
}
