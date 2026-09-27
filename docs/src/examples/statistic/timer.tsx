import { Col, Row } from 'upthrust-ui/source/Grid'
import Statistic from 'upthrust-ui/source/Statistic'

const { Timer } = Statistic

const deadline = Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 30 // 也可以传 Date / dayjs
const before = Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 30
const tenSecondsLater = Date.now() + 10 * 1000

const onFinish = () => {
  console.log('finished!')
}
const onChange = (value: number) => {
  if (4.95 * 1000 < value && value < 5 * 1000) console.log('changed!')
}

export default function TimerDemo() {
  const classNames = { content: '[font-variant-numeric:tabular-nums]' }
  return <Row gutter={16}>
    <Col span={12}>
      <Timer classNames={classNames} type="countdown" value={deadline} onFinish={onFinish} />
    </Col>
    <Col span={12}>
      <Timer classNames={classNames} type="countdown" title="毫秒" value={deadline} format="HH:mm:ss:SSS" />
    </Col>
    <Col span={12}>
      <Timer classNames={classNames} type="countdown" title="倒计时" value={tenSecondsLater} onChange={onChange} onFinish={onFinish} />
    </Col>
    <Col span={12}>
      <Timer classNames={classNames} type="countup" title="正计时" value={before} onChange={onChange} />
    </Col>
    <Col span={24} style={{ 'margin-top': '32px' }}>
      <Timer classNames={classNames} type="countdown" title="天级别（倒计时）" value={deadline} format="D 天 H 时 m 分 s 秒" />
    </Col>
    <Col span={24} style={{ 'margin-top': '32px' }}>
      <Timer classNames={classNames} type="countup" title="天级别（正计时）" value={before} format="D 天 H 时 m 分 s 秒" />
    </Col>
  </Row>
}
