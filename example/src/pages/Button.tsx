import { Component, createSignal } from "solid-js";
import { Button as UpButton } from 'upthrust-ui';

const Icon: Component = () => {
  return <div class='inline-block align-text-bottom mr-2 i-mdi-alarm'></div>
}

const Button: Component = () => {
  
  const btnClick = (e) => {
    console.log(e, '点击事件')
  }

  return <>
    <UpButton type="default">default-button</UpButton>
    <UpButton type="primary">primary-button</UpButton>
    <UpButton type="dashed">dashed-button</UpButton>
    <UpButton type="danger">danger-button</UpButton>
    <UpButton type="link">link-button</UpButton>
    <UpButton type="text">text-button</UpButton>
    <div class="h-1 mt-2"> </div>
    <UpButton type="primary" size="small" >small-button</UpButton>
    <UpButton type="primary" size="medium">medium-button</UpButton>
    <UpButton type="primary" size="large">large-button</UpButton>
    <UpButton type="primary" loading={true}>large-button</UpButton>
    <UpButton type="primary" disabled={true}>large-button</UpButton>
    <UpButton type="primary" icon={Icon} onClick={btnClick}>large-button</UpButton>
    <div class="w-2xl mt-2">
      <UpButton type="primary" block>large-button</UpButton>
      <UpButton type="link" href="baidu.com">link</UpButton>
      <UpButton type="default" href="baidu.com" target="_blank">link</UpButton>
    </div>
    <div class="w-2xl mt-2">
      <UpButton type="primary" onClick={(e) => console.log(e, 1)}>event</UpButton>
      <UpButton disabled onClick={(e) => console.log(e, 1)}>event</UpButton>
      <UpButton loading onClick={(e) => console.log(e, 1)}>event</UpButton>
    </div>
  </>
};

export default Button;