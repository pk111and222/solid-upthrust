import { Component } from "solid-js";
import { Icon } from 'upthrust-ui';

const IconPage: Component = () => {
  return <>
    <h3>基本尺寸</h3>
    <div class="flex items-center gap-4">
      <Icon name="home" size="small" />
      <Icon name="home" size="medium" />
      <Icon name="home" size="large" />
      <Icon name="home" size={40} />
    </div>

    <h3 class="mt-4">颜色</h3>
    <div class="flex items-center gap-4">
      <Icon name="heart" color="primary" size="large" />
      <Icon name="heart" color="secondary" size="large" />
      <Icon name="heart" color="success" size="large" />
      <Icon name="heart" color="warning" size="large" />
      <Icon name="heart" color="danger" size="large" />
    </div>

    <h3 class="mt-4">旋转动画</h3>
    <div class="flex items-center gap-4">
      <Icon name="loading" spin size="large" />
      <Icon name="refresh" spin size="large" color="primary" />
    </div>

    <h3 class="mt-4">角度旋转</h3>
    <div class="flex items-center gap-4">
      <Icon name="arrow-right" size="large" />
      <Icon name="arrow-right" rotate={90} size="large" />
      <Icon name="arrow-right" rotate={180} size="large" />
      <Icon name="arrow-right" rotate={270} size="large" />
    </div>

    <h3 class="mt-4">多种图标</h3>
    <div class="flex items-center gap-4">
      <Icon name="account" size="large" />
      <Icon name="bell" size="large" />
      <Icon name="check-circle" size="large" color="success" />
      <Icon name="close-circle" size="large" color="danger" />
      <Icon name="alert-circle" size="large" color="warning" />
      <Icon name="information" size="large" color="primary" />
    </div>
  </>
};

export default IconPage;
