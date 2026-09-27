import type { JSX } from '@solidjs/web'
import { Col, Row } from 'upthrust-ui/source/Grid'
import Divider from 'upthrust-ui/source/Divider'

/** 间距写在 Col 的内边距上，色块放在 Col 内部才能看出间隔。 */
const Box = (props: { children: JSX.Element }) => <div class="py-xs text-center text-on-primary bg-primary">{props.children}</div>

export default function Gutter() {
  return <div data-grid-gutter>
    <Divider titlePlacement="start" size="small">水平间距 16px</Divider>
    <Row gutter={16} data-gutter="horizontal">
      {[1, 2, 3, 4].map(i => <Col span={6}><Box>col-6 #{i}</Box></Col>)}
    </Row>
    <Divider titlePlacement="start" size="small">响应式间距 xs 8 / sm 16 / md 24 / lg 32</Divider>
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} data-gutter="responsive">
      {[1, 2, 3, 4].map(i => <Col span={6}><Box>col-6 #{i}</Box></Col>)}
    </Row>
    <Divider titlePlacement="start" size="small">水平 + 垂直 [16, 24]</Divider>
    <Row gutter={[16, 24]} data-gutter="both">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Col span={6}><Box>col-6 #{i}</Box></Col>)}
    </Row>
  </div>
}
