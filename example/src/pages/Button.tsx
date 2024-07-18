import { Component } from "solid-js";
import { Button as UpButton } from 'upthrust-ui';

const Button: Component = () => {
  return <>
    <UpButton type="secondary">secondary-button</UpButton>
    <UpButton type="primary">primary-button</UpButton>
    <UpButton type="dashed">dashed-button</UpButton>
    <UpButton type="danger">danger-button</UpButton>
    <UpButton type="link">link-button</UpButton>
    <UpButton type="text">text-button</UpButton>
    <UpButton type="primary" size="large">large-button</UpButton>
    <UpButton type="primary" size="small">small-button</UpButton>
    <UpButton type="primary" size="medium">medium-button</UpButton>
  </>
};

export default Button;