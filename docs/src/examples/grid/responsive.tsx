import { Col, Row } from 'upthrust-ui/source/Grid'

const cell = (i: number) => `py-md text-center text-on-primary ${i % 2 ? 'bg-primary/75' : 'bg-primary'}`

export default function Responsive() {
  return <Row data-grid-responsive>
    <Col xs={2} sm={4} md={6} lg={8} xl={10} class={cell(0)}>Col</Col>
    <Col xs={20} sm={16} md={12} lg={8} xl={4} class={cell(1)}>Col</Col>
    <Col xs={2} sm={4} md={6} lg={8} xl={10} class={cell(0)}>Col</Col>
  </Row>
}
