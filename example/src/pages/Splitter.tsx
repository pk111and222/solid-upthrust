import { Component } from "solid-js";
import { Splitter, Divider } from 'upthrust-ui';

const { Panel } = Splitter

const SplitterPage: Component = () => {
  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-semibold mb-4">Splitter 分割面板</h2>

      <h3 class="text-lg font-medium mb-2">水平分割</h3>
      <div class="border border-solid border-outline/20 rounded-lg overflow-hidden" style={{ height: '200px' }}>
        <Splitter layout="horizontal">
          <Panel>
            <div class="h-full flex items-center justify-center bg-primary/5">Panel 1</div>
          </Panel>
          <Panel>
            <div class="h-full flex items-center justify-center bg-primary/10">Panel 2</div>
          </Panel>
        </Splitter>
      </div>

      <Divider />

      <h3 class="text-lg font-medium mb-2">垂直分割</h3>
      <div class="border border-solid border-outline/20 rounded-lg overflow-hidden" style={{ height: '300px' }}>
        <Splitter layout="vertical">
          <Panel>
            <div class="h-full flex items-center justify-center bg-primary/5">Top Panel</div>
          </Panel>
          <Panel>
            <div class="h-full flex items-center justify-center bg-primary/10">Bottom Panel</div>
          </Panel>
        </Splitter>
      </div>

      <Divider />

      <h3 class="text-lg font-medium mb-2">三面板分割</h3>
      <div class="border border-solid border-outline/20 rounded-lg overflow-hidden" style={{ height: '200px' }}>
        <Splitter layout="horizontal">
          <Panel>
            <div class="h-full flex items-center justify-center bg-primary/5">Left</div>
          </Panel>
          <Panel>
            <div class="h-full flex items-center justify-center bg-primary/10">Center</div>
          </Panel>
          <Panel>
            <div class="h-full flex items-center justify-center bg-primary/15">Right</div>
          </Panel>
        </Splitter>
      </div>
    </div>
  )
}

export default SplitterPage
