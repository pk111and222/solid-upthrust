import { Component } from "solid-js";
import { Row, Col, Divider } from 'upthrust-ui';

const GridPage: Component = () => {
  const colStyle = (opacity: number) => ({
    background: `rgba(0, 85, 255, ${opacity})`,
    color: 'white',
    padding: '12px 0',
    'text-align': 'center' as const,
    'border-radius': '4px',
    'min-height': '40px',
  })

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-semibold mb-4">Grid 栅格</h2>

      <h3 class="text-lg font-medium mb-2">基础栅格</h3>
      <Row gutter={16}>
        <Col span={12}><div style={colStyle(0.8)}>col-12</div></Col>
        <Col span={12}><div style={colStyle(0.6)}>col-12</div></Col>
      </Row>
      <div class="h-4" />
      <Row gutter={16}>
        <Col span={8}><div style={colStyle(0.8)}>col-8</div></Col>
        <Col span={8}><div style={colStyle(0.6)}>col-8</div></Col>
        <Col span={8}><div style={colStyle(0.8)}>col-8</div></Col>
      </Row>
      <div class="h-4" />
      <Row gutter={16}>
        <Col span={6}><div style={colStyle(0.8)}>col-6</div></Col>
        <Col span={6}><div style={colStyle(0.6)}>col-6</div></Col>
        <Col span={6}><div style={colStyle(0.8)}>col-6</div></Col>
        <Col span={6}><div style={colStyle(0.6)}>col-6</div></Col>
      </Row>

      <Divider />

      <h3 class="text-lg font-medium mb-2">Gutter 间距</h3>
      <Row gutter={[16, 16]}>
        <Col span={6}><div style={colStyle(0.7)}>col-6</div></Col>
        <Col span={6}><div style={colStyle(0.5)}>col-6</div></Col>
        <Col span={6}><div style={colStyle(0.7)}>col-6</div></Col>
        <Col span={6}><div style={colStyle(0.5)}>col-6</div></Col>
        <Col span={6}><div style={colStyle(0.5)}>col-6</div></Col>
        <Col span={6}><div style={colStyle(0.7)}>col-6</div></Col>
        <Col span={6}><div style={colStyle(0.5)}>col-6</div></Col>
        <Col span={6}><div style={colStyle(0.7)}>col-6</div></Col>
      </Row>

      <Divider />

      <h3 class="text-lg font-medium mb-2">Offset 偏移</h3>
      <Row>
        <Col span={8}><div style={colStyle(0.8)}>col-8</div></Col>
        <Col span={8} offset={8}><div style={colStyle(0.6)}>col-8 offset-8</div></Col>
      </Row>
      <div class="h-4" />
      <Row>
        <Col span={6} offset={6}><div style={colStyle(0.7)}>col-6 offset-6</div></Col>
        <Col span={6} offset={6}><div style={colStyle(0.5)}>col-6 offset-6</div></Col>
      </Row>

      <Divider />

      <h3 class="text-lg font-medium mb-2">Flex 布局</h3>
      <Row>
        <Col flex="100px"><div style={colStyle(0.8)}>100px</div></Col>
        <Col flex="auto"><div style={colStyle(0.5)}>auto</div></Col>
      </Row>
      <div class="h-4" />
      <Row>
        <Col flex={2}><div style={colStyle(0.7)}>2 / 5</div></Col>
        <Col flex={3}><div style={colStyle(0.5)}>3 / 5</div></Col>
      </Row>

      <Divider />

      <h3 class="text-lg font-medium mb-2">对齐方式</h3>
      <Row justify="center" gutter={16}>
        <Col span={4}><div style={colStyle(0.8)}>col-4</div></Col>
        <Col span={4}><div style={colStyle(0.6)}>col-4</div></Col>
        <Col span={4}><div style={colStyle(0.8)}>col-4</div></Col>
      </Row>
      <div class="h-4" />
      <Row justify="space-between" gutter={16}>
        <Col span={4}><div style={colStyle(0.7)}>col-4</div></Col>
        <Col span={4}><div style={colStyle(0.5)}>col-4</div></Col>
        <Col span={4}><div style={colStyle(0.7)}>col-4</div></Col>
      </Row>
    </div>
  )
}

export default GridPage
