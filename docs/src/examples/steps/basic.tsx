import Steps from 'upthrust-ui/source/Steps'

const content = '这是一段步骤描述。'

export default function Basic() {
  return <Steps current={1} items={[
    { title: '已完成', content },
    { title: '进行中', content, subTitle: '剩余 00:00:08' },
    { title: '待处理', content },
  ]} />
}
