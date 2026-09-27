import { Col, Row } from 'upthrust-ui/source/Grid'
import Statistic from 'upthrust-ui/source/Statistic'

export default function Unit() {
  return <Row gutter={16}>
    <Col span={12}>
      <Statistic title="反馈" value={1128} prefix={<span class="i-mdi-thumb-up-outline inline-block align-[-0.125em]" />} />
    </Col>
    <Col span={12}>
      <Statistic title="未合并" value={93} suffix="/ 100" />
    </Col>
  </Row>
}
