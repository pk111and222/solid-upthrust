import { Col, Row } from 'upthrust-ui/source/Grid'

const cell = 'py-md text-center text-on-primary bg-primary'

export default function Offset() {
  return <div class="flex flex-col gap-xs" data-grid-offset>
    <Row><Col span={8} class={cell}>col-8</Col><Col span={8} offset={8} class={cell}>col-8 offset-8</Col></Row>
    <Row><Col span={6} offset={6} class={cell}>col-6 offset-6</Col><Col span={6} offset={6} class={cell}>col-6 offset-6</Col></Row>
    <Row><Col span={12} offset={6} class={cell}>col-12 offset-6</Col></Row>
  </div>
}
