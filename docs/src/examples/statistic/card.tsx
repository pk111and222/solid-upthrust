import Card from 'upthrust-ui/source/Card'
import { Col, Row } from 'upthrust-ui/source/Grid'
import Statistic from 'upthrust-ui/source/Statistic'

export default function CardDemo() {
  return <div class="bg-surface-variant p-md">
    <Row gutter={16}>
      <Col span={12}>
        <Card variant="borderless">
          <Statistic title="活跃" value={11.28} precision={2} styles={{ content: { color: '#3f8600' } }} prefix={<span class="i-mdi-arrow-up inline-block align-[-0.125em]" />} suffix="%" />
        </Card>
      </Col>
      <Col span={12}>
        <Card variant="borderless">
          <Statistic title="空闲" value={9.3} precision={2} styles={{ content: { color: '#cf1322' } }} prefix={<span class="i-mdi-arrow-down inline-block align-[-0.125em]" />} suffix="%" />
        </Card>
      </Col>
    </Row>
  </div>
}
