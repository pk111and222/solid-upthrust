import Steps from 'upthrust-ui/source/Steps'

const content = '这是一段步骤描述。'

export default function ErrorStatus() {
  // status 作用于当前步骤。
  return <Steps current={1} status="error" items={[
    { title: '已完成', content },
    { title: '出错了', content },
    { title: '待处理', content },
  ]} />
}
