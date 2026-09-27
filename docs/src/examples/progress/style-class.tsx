import Flex from 'upthrust-ui/source/Flex'
import Progress, { type ProgressProps } from 'upthrust-ui/source/Progress'

const classNames: ProgressProps['classNames'] = { root: 'demo-progress-root', rail: 'demo-progress-rail', track: 'demo-progress-track' }

// 函数形式：按 percent 计算色相。
const stylesFn: ProgressProps['styles'] = info => {
  const percent = info.props.percent ?? 0
  const hue = 200 - (200 * percent) / 100
  return {
    track: {
      'background-image': `linear-gradient(to right, hsla(${hue}, 85%, 65%, 1), hsla(${hue + 30}, 90%, 55%, 0.95))`,
      'border-radius': '8px',
      transition: 'all 0.3s ease',
    },
    rail: { 'background-color': 'rgba(0, 0, 0, 0.1)', 'border-radius': '8px' },
  }
}

export default function StyleClass() {
  return <Flex vertical gap="large">
    {[10, 20, 40, 60, 80, 99].map(percent => <Progress classNames={classNames} styles={stylesFn} percent={percent} />)}
  </Flex>
}
