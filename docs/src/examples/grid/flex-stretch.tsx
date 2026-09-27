import { Col, Row } from 'upthrust-ui/source/Grid'
import Divider from 'upthrust-ui/source/Divider'

const cell = (i: number) => `py-md text-center text-on-primary ${i % 2 ? 'bg-primary/75' : 'bg-primary'}`

export default function FlexStretch() {
  return <div data-grid-flex>
    <Divider titlePlacement="start" size="small">按比例分配</Divider>
    <Row data-flex="ratio">
      <Col flex={2} class={cell(0)}>2 / 5</Col>
      <Col flex={3} class={cell(1)}>3 / 5</Col>
    </Row>
    <Divider titlePlacement="start" size="small">固定宽度 + 填充剩余</Divider>
    <Row data-flex="fill">
      <Col flex="100px" class={cell(0)}>100px</Col>
      <Col flex="auto" class={cell(1)}>auto 填充剩余</Col>
    </Row>
    <Divider titlePlacement="start" size="small">flex 简写</Divider>
    <Row data-flex="shorthand">
      <Col flex="1 1 200px" class={cell(0)}>1 1 200px</Col>
      <Col flex="0 1 300px" class={cell(1)}>0 1 300px</Col>
    </Row>
    <Divider titlePlacement="start" size="small">不换行（wrap=false）</Divider>
    <Row wrap={false} data-flex="nowrap">
      <Col flex="none" class="px-md py-md text-on-primary bg-primary">none</Col>
      <Col flex="auto" class={`${cell(1)} truncate`}>auto：长内容不会撑破行宽，超出部分省略显示 · 长内容不会撑破行宽，超出部分省略显示</Col>
    </Row>
  </div>
}
