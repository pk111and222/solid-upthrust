import { Col, Row } from 'upthrust-ui/source/Grid'

/** 单元格底色：奇偶交替，方便看清列边界。 */
const cell = (index: number) => `py-md text-center text-on-primary ${index % 2 ? 'bg-primary/75' : 'bg-primary'}`

export default function Basic() {
  return <div class="flex flex-col gap-xs" data-grid-basic>
    <Row><Col span={24} class={cell(0)}>col</Col></Row>
    <Row><Col span={12} class={cell(0)}>col-12</Col><Col span={12} class={cell(1)}>col-12</Col></Row>
    <Row>{[0, 1, 2].map(i => <Col span={8} class={cell(i)}>col-8</Col>)}</Row>
    <Row>{[0, 1, 2, 3].map(i => <Col span={6} class={cell(i)}>col-6</Col>)}</Row>
  </div>
}
