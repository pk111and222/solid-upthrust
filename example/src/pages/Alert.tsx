import { Component, createSignal } from "solid-js";
import { Alert } from 'upthrust-ui';

const Icon: Component = () => {
  return <div class='inline-block align-text-bottom mr-2 i-mdi-alarm'></div>
}

const Button: Component = () => {
  
  return <div>
    <Alert />
  </div>
}