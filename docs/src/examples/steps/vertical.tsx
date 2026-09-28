import Steps from 'upthrust-ui/source/Steps'

const content = '这是一段步骤描述。'

export default function Vertical() {
  return <Steps orientation="vertical" current={1} items={[
    { title: '已完成', content },
    { title: '进行中', content },
    { title: '待处理', content },
  ]} />
}
