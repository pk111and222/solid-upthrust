import { Text } from 'upthrust-ui/source/Typography'
export default function Texts() {
  return <div class="flex flex-col gap-2"><Text>默认文本</Text><Text type="secondary">次要信息</Text><Text type="success">操作成功</Text><Text type="warning">待确认</Text><Text type="danger">操作失败</Text><Text disabled>已禁用</Text><Text strong>加粗</Text><Text italic>斜体</Text><Text underline>下划线</Text><Text delete>删除线</Text><Text code>pnpm install</Text><Text mark>重要信息</Text><Text keyboard>Ctrl + K</Text><Text strong italic underline type="danger">组合装饰</Text></div>
}
