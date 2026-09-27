import { Col, Row } from 'upthrust-ui/source/Grid'

export default function Sort() {
  return <Row data-grid-sort>
    <Col span={18} push={6} class="py-md text-center text-on-primary bg-primary">col-18 push-6</Col>
    <Col span={6} pull={18} class="py-md text-center text-on-primary bg-primary/75">col-6 pull-18</Col>
  </Row>
}
