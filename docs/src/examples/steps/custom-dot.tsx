import Steps from 'upthrust-ui/source/Steps'
import Tooltip from 'upthrust-ui/source/Tooltip'

const content = '这是一段步骤描述。'

export default function CustomDot() {
  // progressDot 传函数：拿到默认点与步骤信息，返回自定义节点。
  return <Steps
    current={1}
    progressDot={(dot, info) => <Tooltip title={`步骤 ${info.index + 1}：${info.status}`}><span data-custom-dot={info.status} class="inline-flex">{dot}</span></Tooltip>}
    items={[{ title: '已完成', content }, { title: '进行中', content }, { title: '待处理', content }, { title: '待处理', content }]}
  />
}
