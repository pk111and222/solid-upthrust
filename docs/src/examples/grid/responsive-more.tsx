import { Col, Row } from 'upthrust-ui/source/Grid'
import Divider from 'upthrust-ui/source/Divider'

const cell = (i: number) => `py-md text-center text-on-primary ${i % 2 ? 'bg-primary/75' : 'bg-primary'}`

export default function ResponsiveMore() {
  return <div data-grid-responsive-more>
    <Divider titlePlacement="start" size="small">断点对象 {'{ span, offset }'}</Divider>
    <Row>
      <Col xs={{ span: 5, offset: 1 }} lg={{ span: 6, offset: 2 }} class={cell(0)}>Col</Col>
      <Col xs={{ span: 11, offset: 1 }} lg={{ span: 6, offset: 2 }} class={cell(1)}>Col</Col>
      <Col xs={{ span: 5, offset: 1 }} lg={{ span: 6, offset: 2 }} class={cell(0)}>Col</Col>
    </Row>
    <Divider titlePlacement="start" size="small">按断点隐藏（span 0）</Divider>
    <Row gutter={8} data-responsive-hide>
      <Col span={8} md={0} class={cell(0)}>md 以上隐藏</Col>
      <Col xs={0} md={8} class={cell(1)}>md 以上显示</Col>
      <Col span={8} class={cell(0)}>始终显示</Col>
    </Row>
    <Divider titlePlacement="start" size="small">Row 的响应式 justify（xs 居中 / sm 靠右 / md 两端）</Divider>
    <Row justify={{ xs: 'center', sm: 'end', md: 'space-between' }} class="bg-on-surface/4" data-responsive-justify>
      {[0, 1, 2].map(i => <Col span={6} class={cell(i)}>col-6</Col>)}
    </Row>
  </div>
}
