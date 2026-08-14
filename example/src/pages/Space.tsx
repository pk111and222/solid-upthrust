import { Component } from "solid-js";
import { Space, Compact, Divider } from 'upthrust-ui';
import { Button as UpButton } from 'upthrust-ui';

const SpacePage: Component = () => {
  const card = (text: string) => (
    <div class="px-4 py-2 bg-primary/10 border border-solid border-primary/30 rounded">{text}</div>
  )

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-semibold mb-4">Space 间距</h2>

      <h3 class="text-lg font-medium mb-2">基本使用</h3>
      <Space>
        {card("Item 1")}
        {card("Item 2")}
        {card("Item 3")}
      </Space>

      <Divider />

      <h3 class="text-lg font-medium mb-2">间距大小</h3>
      <Space direction="vertical" size="large" block>
        <Space size="small">
          <UpButton type="primary">Small</UpButton>
          <UpButton type="primary">Gap</UpButton>
          <UpButton type="primary">8px</UpButton>
        </Space>
        <Space size="middle">
          <UpButton type="default">Middle</UpButton>
          <UpButton type="default">Gap</UpButton>
          <UpButton type="default">16px</UpButton>
        </Space>
        <Space size="large">
          <UpButton type="dashed">Large</UpButton>
          <UpButton type="dashed">Gap</UpButton>
          <UpButton type="dashed">24px</UpButton>
        </Space>
      </Space>

      <Divider />

      <h3 class="text-lg font-medium mb-2">垂直间距</h3>
      <Space direction="vertical" size="middle">
        {card("Vertical Item 1")}
        {card("Vertical Item 2")}
        {card("Vertical Item 3")}
      </Space>

      <Divider />

      <h3 class="text-lg font-medium mb-2">分隔符</h3>
      <Space split={<Divider type="vertical" />}>
        <span>Link 1</span>
        <span>Link 2</span>
        <span>Link 3</span>
      </Space>

      <Divider />

      <h3 class="text-lg font-medium mb-2">自动换行</h3>
      <Space wrap size="middle">
        {Array.from({ length: 16 }, (_, i) => (
          <UpButton type="primary">Button {i + 1}</UpButton>
        ))}
      </Space>

      <Divider />

      <h3 class="text-lg font-medium mb-2">Space.Compact 紧凑模式</h3>
      <Compact>
        <UpButton type="default">Left</UpButton>
        <UpButton type="default">Center</UpButton>
        <UpButton type="default">Right</UpButton>
      </Compact>
    </div>
  )
}

export default SpacePage
