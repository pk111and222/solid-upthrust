import { Col, Row } from 'upthrust-ui/source/Grid'
import Divider from 'upthrust-ui/source/Divider'

const cell = (i: number) => `py-md text-center text-on-primary ${i % 2 ? 'bg-primary/75' : 'bg-primary'}`

export default function Order() {
  return <div data-grid-order>
    <Divider titlePlacement="start" size="small">固定顺序</Divider>
    <Row>
      <Col span={6} order={4} class={cell(0)}>1 col-order-4</Col>
      <Col span={6} order={3} class={cell(1)}>2 col-order-3</Col>
      <Col span={6} order={2} class={cell(2)}>3 col-order-2</Col>
      <Col span={6} order={1} class={cell(3)}>4 col-order-1</Col>
    </Row>
    <Divider titlePlacement="start" size="small">响应式顺序（缩放窗口观察）</Divider>
    <Row data-order="responsive">
      <Col span={6} xs={{ order: 1 }} sm={{ order: 2 }} md={{ order: 3 }} lg={{ order: 4 }} class={cell(0)}>1 col</Col>
      <Col span={6} xs={{ order: 2 }} sm={{ order: 1 }} md={{ order: 4 }} lg={{ order: 3 }} class={cell(1)}>2 col</Col>
      <Col span={6} xs={{ order: 3 }} sm={{ order: 4 }} md={{ order: 2 }} lg={{ order: 1 }} class={cell(2)}>3 col</Col>
      <Col span={6} xs={{ order: 4 }} sm={{ order: 3 }} md={{ order: 1 }} lg={{ order: 2 }} class={cell(3)}>4 col</Col>
    </Row>
  </div>
}
