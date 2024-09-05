// @unocss-include
import { Component, For } from "solid-js";

function camelToHyphen(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

const list = [
  'bg-primary',
  'bg-on-primary',
  'bg-primary-container',
  'bg-on-primary-container',
  'bg-secondary',
  'bg-on-secondary',
  'bg-secondary-container',
  'bg-on-secondary-container',
  'bg-tertiary',
  'bg-on-tertiary',
  'bg-tertiary-container',
  'bg-on-tertiary-container',
  'bg-error',
  'bg-on-error',
  'bg-error-container',
  'bg-on-error-container',
  'bg-background',
  'bg-on-background',
  'bg-surface',
  'bg-on-surface',
  'bg-surface-variant',
  'bg-on-surface-variant',
  'bg-outline',
  'bg-outline-variant',
  'bg-shadow',
  'bg-scrim',
  'bg-inverse-surface',
  'bg-inverse-on-surface',
  'bg-inverse-primary',
]

const Home = () => {
  return <div class="">
    色卡
    <div class="flex flex-wrap">
      <For each={list} fallback={<div>Loading...</div>}>
        {(item) => (<div class="basis-1/4 px-2">
          <div class={`w-full h-10 ${camelToHyphen(item)}`}>
          </div>
          <div>{item}</div>
        </div>)}
      </For>
    </div>
    gap
    <div class="w-2xl h-10 bg-primary-container mb-up-xm"></div>
    <div class="w-2xl h-10 bg-primary-container mb-up-ms"></div>
    <div class="w-2xl h-10 bg-primary-container mb-up-md"></div>
    <div class="w-2xl h-10 bg-primary-container mb-up-lg"></div>
    <div class="w-2xl h-10 bg-primary-container mb-up-xl"></div>

    
  </div>;
};

export default Home;