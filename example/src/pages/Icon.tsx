import { Component } from "solid-js";
import { Icon } from 'upthrust-ui';

const IconPage: Component = () => {
  return <>
    <h3>基本用法</h3>
    <p class="text-on-surface-variant text-sm mb-xs">使用 "collection:icon-name" 格式，与 icones.js 一致</p>
    <div class="flex items-center gap-4">
      <Icon name="mdi:home" size="small" />
      <Icon name="mdi:home" size="middle" />
      <Icon name="mdi:home" size="large" />
      <Icon name="mdi:home" size={40} />
    </div>

    <h3 class="mt-lg">多图标集合</h3>
    <p class="text-on-surface-variant text-sm mb-xs">
      使用 "collection:icon-name" 格式，与 icones.js 一致
    </p>
    <div class="flex items-center gap-4">
      <Icon name="mdi:account-circle" size="large" />
      <Icon name="mdi:github" size="large" />
      <Icon name="mdi:language-typescript" size="large" color="primary" />
      <Icon name="mdi:nodejs" size="large" color="success" />
      <Icon name="mdi:language-css3" size="large" color="success" />
    </div>

    <h3 class="mt-lg">颜色</h3>
    <div class="flex items-center gap-4">
      <Icon name="mdi:heart" color="primary" size="large" />
      <Icon name="mdi:heart" color="secondary" size="large" />
      <Icon name="mdi:heart" color="success" size="large" />
      <Icon name="mdi:heart" color="warning" size="large" />
      <Icon name="mdi:heart" color="danger" size="large" />
      <Icon name="mdi:heart" color="inherit" size="large" />
    </div>

    <h3 class="mt-lg">旋转动画</h3>
    <div class="flex items-center gap-4">
      <Icon name="mdi:loading" spin size="large" />
      <Icon name="mdi:refresh" spin size="large" color="primary" />
    </div>

    <h3 class="mt-lg">角度旋转</h3>
    <div class="flex items-center gap-4">
      <Icon name="mdi:arrow-right" size="large" />
      <Icon name="mdi:arrow-right" rotate={90} size="large" />
      <Icon name="mdi:arrow-right" rotate={180} size="large" />
      <Icon name="mdi:arrow-right" rotate={270} size="large" />
    </div>

    <h3 class="mt-lg">自定义尺寸</h3>
    <div class="flex items-center gap-4">
      <Icon name="mdi:star" size={12} />
      <Icon name="mdi:star" size={16} />
      <Icon name="mdi:star" size={24} />
      <Icon name="mdi:star" size={32} />
      <Icon name="mdi:star" size={48} />
      <Icon name="mdi:star" size="3rem" />
    </div>
  </>
};

export default IconPage;
