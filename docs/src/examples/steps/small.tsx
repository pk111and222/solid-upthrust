import Steps from 'upthrust-ui/source/Steps'

export default function Small() {
  return <Steps size="small" current={1} items={[{ title: '已完成' }, { title: '进行中' }, { title: '待处理' }]} />
}
