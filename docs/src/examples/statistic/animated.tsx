import { createSignal, onCleanup } from 'solid-js'
import { Col, Row } from 'upthrust-ui/source/Grid'
import Statistic from 'upthrust-ui/source/Statistic'

// antd 示例借助 react-countup；这里用 requestAnimationFrame 写一个等价的数字滚动。
function CountUp(props: { end: number; duration?: number }) {
  const [current, setCurrent] = createSignal(0, { ownedWrite: true })
  const duration = props.duration ?? 2000
  if (typeof requestAnimationFrame !== 'undefined') {
    const start = performance.now()
    let frame = requestAnimationFrame(function step(time) {
      const progress = Math.min((time - start) / duration, 1)
      // easeOutExpo，与 react-countup 的默认缓动一致。
      setCurrent(progress === 1 ? props.end : props.end * (1 - 2 ** (-10 * progress)))
      if (progress < 1) frame = requestAnimationFrame(step)
    })
    onCleanup(() => cancelAnimationFrame(frame))
  }
  return <>{Math.round(current()).toLocaleString('en-US')}</>
}

const formatter = (value: number | string) => <CountUp end={Number(value)} />

export default function Animated() {
  const classNames = { content: '[font-variant-numeric:tabular-nums]' }
  return <Row gutter={16}>
    <Col span={12}>
      <Statistic classNames={classNames} title="活跃用户" value={112893} formatter={formatter} />
    </Col>
    <Col span={12}>
      <Statistic classNames={classNames} title="账户余额（CNY）" value={112893} precision={2} formatter={formatter} />
    </Col>
  </Row>
}
