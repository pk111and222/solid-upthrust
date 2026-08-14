import { Component } from "solid-js";
import { Divider } from 'upthrust-ui';

const DividerPage: Component = () => {
  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-semibold mb-4">Divider 分割线</h2>

      <h3 class="text-lg font-medium mb-2">水平分割线</h3>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      <Divider />
      <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <Divider dashed />
      <p>Ut enim ad minim veniam.</p>

      <h3 class="text-lg font-medium mt-8 mb-2">带文字的分割线</h3>
      <Divider>居中文字</Divider>
      <Divider orientation="left">左侧文字</Divider>
      <Divider orientation="right">右侧文字</Divider>
      <Divider dashed orientation="left">虚线 + 左侧</Divider>
      <Divider plain>纯文本样式</Divider>

      <h3 class="text-lg font-medium mt-8 mb-2">自定义边距</h3>
      <Divider orientation="left" orientationMargin={0}>Left 0px margin</Divider>
      <Divider orientation="left" orientationMargin="60px">Left 60px margin</Divider>

      <h3 class="text-lg font-medium mt-8 mb-2">垂直分割线</h3>
      <div>
        <span>Text</span>
        <Divider type="vertical" />
        <span>Link</span>
        <Divider type="vertical" />
        <span>Link</span>
        <Divider type="vertical" dashed />
        <span>Link (dashed)</span>
      </div>
    </div>
  )
}

export default DividerPage
