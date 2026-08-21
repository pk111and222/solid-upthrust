import { Component } from "solid-js";
import { Button as UpButton, Icon } from 'upthrust-ui';

const ButtonPage: Component = () => {
  return <div class="space-y-8">
    {/* Type syntactic sugar (backward compat) */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">Type 语法糖 (向后兼容)</h3>
      <div class="flex flex-wrap gap-3">
        <UpButton type="primary">Primary</UpButton>
        <UpButton type="default">Default</UpButton>
        <UpButton type="dashed">Dashed</UpButton>
        <UpButton type="text">Text</UpButton>
        <UpButton type="link">Link</UpButton>
      </div>
    </section>

    {/* Variant × Color Matrix */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">Variant + Color 矩阵</h3>

      <h4 class="text-[14px] font-medium mb-2 text-on-surface-variant">Solid</h4>
      <div class="flex flex-wrap gap-3 mb-4">
        <UpButton variant="solid" color="primary">Primary</UpButton>
        <UpButton variant="solid" color="default">Default</UpButton>
        <UpButton variant="solid" color="danger">Danger</UpButton>
      </div>

      <h4 class="text-[14px] font-medium mb-2 text-on-surface-variant">Outlined</h4>
      <div class="flex flex-wrap gap-3 mb-4">
        <UpButton variant="outlined" color="primary">Primary</UpButton>
        <UpButton variant="outlined" color="default">Default</UpButton>
        <UpButton variant="outlined" color="danger">Danger</UpButton>
      </div>

      <h4 class="text-[14px] font-medium mb-2 text-on-surface-variant">Dashed</h4>
      <div class="flex flex-wrap gap-3 mb-4">
        <UpButton variant="dashed" color="primary">Primary</UpButton>
        <UpButton variant="dashed" color="default">Default</UpButton>
        <UpButton variant="dashed" color="danger">Danger</UpButton>
      </div>

      <h4 class="text-[14px] font-medium mb-2 text-on-surface-variant">Filled</h4>
      <div class="flex flex-wrap gap-3 mb-4">
        <UpButton variant="filled" color="primary">Primary</UpButton>
        <UpButton variant="filled" color="default">Default</UpButton>
        <UpButton variant="filled" color="danger">Danger</UpButton>
      </div>

      <h4 class="text-[14px] font-medium mb-2 text-on-surface-variant">Text</h4>
      <div class="flex flex-wrap gap-3 mb-4">
        <UpButton variant="text" color="primary">Primary</UpButton>
        <UpButton variant="text" color="default">Default</UpButton>
        <UpButton variant="text" color="danger">Danger</UpButton>
      </div>

      <h4 class="text-[14px] font-medium mb-2 text-on-surface-variant">Link</h4>
      <div class="flex flex-wrap gap-3 mb-4">
        <UpButton variant="link" color="primary">Primary</UpButton>
        <UpButton variant="link" color="default">Default</UpButton>
        <UpButton variant="link" color="danger">Danger</UpButton>
      </div>
    </section>

    {/* Sizes */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">尺寸 Size</h3>
      <div class="flex items-center gap-3">
        <UpButton variant="solid" color="primary" size="small">Small</UpButton>
        <UpButton variant="solid" color="primary" size="middle">Middle</UpButton>
        <UpButton variant="solid" color="primary" size="large">Large</UpButton>
      </div>
    </section>

    {/* Shape */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">形状 Shape</h3>
      <div class="flex items-center gap-3">
        <UpButton variant="solid" color="primary" shape="default">Default</UpButton>
        <UpButton variant="solid" color="primary" shape="round">Round</UpButton>
        <UpButton variant="solid" color="primary" shape="circle" icon={<Icon name="mdi:magnify" />} />
      </div>
    </section>

    {/* Ghost */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">幽灵 Ghost</h3>
      <div class="flex gap-3 p-4 bg-on-surface/60 rounded-lg">
        <UpButton variant="solid" color="primary" ghost>Primary</UpButton>
        <UpButton variant="outlined" color="default" ghost>Default</UpButton>
        <UpButton variant="dashed" color="danger" ghost>Danger</UpButton>
      </div>
    </section>

    {/* Danger shorthand */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">危险 Danger</h3>
      <div class="flex flex-wrap gap-3">
        <UpButton danger variant="solid">Solid Danger</UpButton>
        <UpButton danger variant="outlined">Outlined Danger</UpButton>
        <UpButton danger variant="dashed">Dashed Danger</UpButton>
        <UpButton danger variant="filled">Filled Danger</UpButton>
        <UpButton danger variant="text">Text Danger</UpButton>
        <UpButton danger variant="link">Link Danger</UpButton>
      </div>
    </section>

    {/* Disabled */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">禁用 Disabled</h3>
      <div class="flex flex-wrap gap-3">
        <UpButton variant="solid" color="primary" disabled>Solid</UpButton>
        <UpButton variant="outlined" color="default" disabled>Outlined</UpButton>
        <UpButton variant="dashed" disabled>Dashed</UpButton>
        <UpButton variant="filled" disabled>Filled</UpButton>
        <UpButton variant="text" disabled>Text</UpButton>
        <UpButton variant="link" disabled>Link</UpButton>
      </div>
    </section>

    {/* Loading */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">加载中 Loading</h3>
      <div class="flex flex-wrap gap-3">
        <UpButton variant="solid" color="primary" loading>Loading</UpButton>
        <UpButton variant="outlined" loading>Loading</UpButton>
        <UpButton variant="filled" color="primary" loading>Loading</UpButton>
      </div>
    </section>

    {/* Icon Placement */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">图标位置 Icon Placement</h3>
      <div class="flex flex-wrap gap-3">
        <UpButton variant="solid" color="primary" icon={<Icon name="mdi:magnify" />}>Search</UpButton>
        <UpButton variant="outlined" icon={<Icon name="mdi:download" />} iconPlacement="end">Download</UpButton>
        <UpButton variant="solid" color="primary" shape="circle" icon={<Icon name="mdi:plus" />} />
      </div>
    </section>

    {/* Block */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">撑满 Block</h3>
      <div class="w-[400px] space-y-2">
        <UpButton variant="solid" color="primary" block>Primary Block</UpButton>
        <UpButton variant="outlined" block>Default Block</UpButton>
      </div>
    </section>

    {/* Link href */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">链接 Link href</h3>
      <div class="flex gap-3">
        <UpButton variant="link" color="primary" href="https://github.com" target="_blank">GitHub</UpButton>
        <UpButton variant="outlined" href="https://solidjs.com" target="_blank">SolidJS</UpButton>
      </div>
    </section>
  </div>
};

export default ButtonPage;
