import Button from 'upthrust-ui/source/Button'
import { Col, Row } from 'upthrust-ui/source/Grid'
import Statistic from 'upthrust-ui/source/Statistic'

export default function Basic() {
  return <Row gutter={16}>
    <Col span={12}>
      <Statistic title="活跃用户" value={112893} />
    </Col>
    <Col span={12}>
      <Statistic title="账户余额（CNY）" value={112893} precision={2} />
      <Button style={{ 'margin-top': '16px' }} type="primary">充值</Button>
    </Col>
    <Col span={12}>
      <Statistic title="活跃用户" value={112893} loading />
    </Col>
  </Row>
}
