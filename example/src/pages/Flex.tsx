import { Component } from "solid-js";
import { Flex, Divider } from 'upthrust-ui';

const FlexPage: Component = () => {
  const boxStyle = { background: 'var(--un-color-primary, #0055ff)', color: 'white', padding: '8px 16px', 'border-radius': '4px' }
  const boxStyle2 = { background: 'var(--un-color-primary-container, #d4e3ff)', color: '#333', padding: '8px 16px', 'border-radius': '4px' }

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-semibold mb-4">Flex 弹性布局</h2>

      <h3 class="text-lg font-medium mb-2">基本使用</h3>
      <Flex gap="middle">
        <div style={boxStyle}>Item 1</div>
        <div style={boxStyle}>Item 2</div>
        <div style={boxStyle}>Item 3</div>
        <div style={boxStyle}>Item 4</div>
      </Flex>

      <Divider />

      <h3 class="text-lg font-medium mb-2">垂直排列</h3>
      <Flex vertical gap="small">
        <div style={boxStyle}>Item 1</div>
        <div style={boxStyle2}>Item 2</div>
        <div style={boxStyle}>Item 3</div>
      </Flex>

      <Divider />

      <h3 class="text-lg font-medium mb-2">对齐方式</h3>
      <Flex justify="space-between" align="center" style={{ height: '80px', background: '#f5f5f5', padding: '0 16px', 'border-radius': '8px' }}>
        <div style={boxStyle}>Left</div>
        <div style={boxStyle2}>Center</div>
        <div style={boxStyle}>Right</div>
      </Flex>

      <Divider />

      <h3 class="text-lg font-medium mb-2">自动换行</h3>
      <Flex wrap="wrap" gap={8}>
        {Array.from({ length: 12 }, (_, i) => (
          <div style={{ ...boxStyle, width: '120px', 'text-align': 'center' }}>Item {i + 1}</div>
        ))}
      </Flex>

      <Divider />

      <h3 class="text-lg font-medium mb-2">Gap 大小</h3>
      <Flex vertical gap="large">
        <Flex gap="small">
          <div style={boxStyle}>Small</div>
          <div style={boxStyle}>Gap</div>
          <div style={boxStyle}>8px</div>
        </Flex>
        <Flex gap="middle">
          <div style={boxStyle2}>Middle</div>
          <div style={boxStyle2}>Gap</div>
          <div style={boxStyle2}>16px</div>
        </Flex>
        <Flex gap="large">
          <div style={boxStyle}>Large</div>
          <div style={boxStyle}>Gap</div>
          <div style={boxStyle}>24px</div>
        </Flex>
        <Flex gap={48}>
          <div style={boxStyle2}>Custom</div>
          <div style={boxStyle2}>Gap</div>
          <div style={boxStyle2}>48px</div>
        </Flex>
      </Flex>
    </div>
  )
}

export default FlexPage
