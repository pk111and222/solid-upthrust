import { Component, createSignal } from "solid-js";
import { Splitter } from 'upthrust-ui';

const { Panel } = Splitter

const boxClass = 'h-full w-full flex items-center justify-center text-on-surface';

const wrapClass = 'border border-outline-variant rounded-lg overflow-hidden';

const labelClass = 'text-[14px] text-on-surface-variant mb-2';

const formatSizes = (sizes: number[]) =>
  sizes.map((s) => `${Math.round(s)}px`).join(' / ')

const SplitterPage: Component = () => {
  // 实时尺寸展示：onResize 拖拽中持续触发，onResizeEnd 松手触发
  const [basicSizes, setBasicSizes] = createSignal<number[]>([])
  const [boundSizes, setBoundSizes] = createSignal<number[]>([])

  return <div class="space-y-8">
    {/* Basic */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">基础用法（水平 / 垂直）</h3>
      <div class="space-y-3">
        <div>
          <div class={labelClass}>水平 two panes</div>
          <div class={`${wrapClass} h-[200px]`}>
            <Splitter layout="horizontal">
              <Panel>
                <div class={`${boxClass} bg-primary/5`}>Panel 1</div>
              </Panel>
              <Panel>
                <div class={`${boxClass} bg-primary/10`}>Panel 2</div>
              </Panel>
            </Splitter>
          </div>
        </div>
        <div>
          <div class={labelClass}>垂直 layout="vertical"</div>
          <div class={`${wrapClass} h-[240px]`}>
            <Splitter layout="vertical">
              <Panel>
                <div class={`${boxClass} bg-primary/5`}>Top</div>
              </Panel>
              <Panel>
                <div class={`${boxClass} bg-primary/10`}>Bottom</div>
              </Panel>
            </Splitter>
          </div>
        </div>
      </div>
    </section>

    {/* defaultSize */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">默认尺寸 defaultSize（px 与 % 混用）</h3>
      <div class={labelClass}>
        首帧即按 defaultSize 渲染（无闪烁）；容器测量完成后归一化为 px，总和守恒
      </div>
      <div class={`${wrapClass} h-[200px]`}>
        <Splitter layout="horizontal">
          <Panel defaultSize="40%">
            <div class={`${boxClass} bg-primary/5`}>40%</div>
          </Panel>
          <Panel defaultSize={240}>
            <div class={`${boxClass} bg-primary/10`}>240px</div>
          </Panel>
          <Panel>
            <div class={`${boxClass} bg-primary/15`}>auto</div>
          </Panel>
        </Splitter>
      </div>
    </section>

    {/* onResize */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">拖拽回调 onResize / onResizeEnd</h3>
      <div class={labelClass}>sizes(px) 实时显示 —— 拖动下方分割线观察总和不变</div>
      <div class={`${wrapClass} h-[200px] mb-3`}>
        <Splitter layout="horizontal" onResize={setBasicSizes} onResizeEnd={setBasicSizes}>
          <Panel defaultSize="30%">
            <div class={`${boxClass} bg-primary/5`}>Panel 1</div>
          </Panel>
          <Panel>
            <div class={`${boxClass} bg-primary/10`}>Panel 2</div>
          </Panel>
          <Panel>
            <div class={`${boxClass} bg-primary/15`}>Panel 3</div>
          </Panel>
        </Splitter>
      </div>
      <div class="text-[13px] font-mono text-on-surface-variant rounded bg-surface-variant/40 px-md py-xs">
        sizes: {basicSizes().length ? formatSizes(basicSizes()) : '拖动分割线试试 →'}
      </div>
    </section>

    {/* min / max */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">边界约束 min / max</h3>
      <div class={labelClass}>
        中间面板 min=160px、max=320px —— 拖到边界即停，另一侧随之到顶
      </div>
      <div class={`${wrapClass} h-[200px] mb-3`}>
        <Splitter layout="horizontal" onResize={setBoundSizes} onResizeEnd={setBoundSizes}>
          <Panel min={120}>
            <div class={`${boxClass} bg-primary/5`}>min 120</div>
          </Panel>
          <Panel min={160} max={320}>
            <div class={`${boxClass} bg-primary/10`}>160 ~ 320</div>
          </Panel>
          <Panel min={120}>
            <div class={`${boxClass} bg-primary/15`}>min 120</div>
          </Panel>
        </Splitter>
      </div>
      <div class="text-[13px] font-mono text-on-surface-variant rounded bg-surface-variant/40 px-md py-xs">
        sizes: {boundSizes().length ? formatSizes(boundSizes()) : '拖动分割线试试 →'}
      </div>
    </section>

    {/* resizable=false */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">固定面板 resizable=&#123;false&#125;</h3>
      <div class={labelClass}>
        resizable=false 的面板相邻分割线禁用：样式变淡、tabindex=-1、aria-disabled="true"
      </div>
      <div class={`${wrapClass} h-[200px]`}>
        <Splitter layout="horizontal">
          <Panel>
            <div class={`${boxClass} bg-primary/5`}>可拖拽</div>
          </Panel>
          <Panel resizable={false} defaultSize={200}>
            <div class={`${boxClass} bg-surface-variant/60`}>固定 200px</div>
          </Panel>
          <Panel>
            <div class={`${boxClass} bg-primary/15`}>可拖拽</div>
          </Panel>
        </Splitter>
      </div>
    </section>

    {/* Keyboard */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">键盘操作</h3>
      <div class="space-y-2 text-[14px] text-on-surface-variant">
        <div>Tab 聚焦分割线（focus 时显示主色描边）后：</div>
        <ul class="list-disc pl-lg space-y-1">
          <li><code class="text-on-surface">←</code> / <code class="text-on-surface">→</code>（垂直布局为 <code class="text-on-surface">↑</code> / <code class="text-on-surface">↓</code>）：步进 16px</li>
          <li><code class="text-on-surface">Home</code> / <code class="text-on-surface">End</code>：跳到最小 / 最大边界</li>
          <li>每一步都遵守 min / max 与总和守恒，并同步 aria-valuenow</li>
        </ul>
      </div>
      <div class={`${wrapClass} h-[160px] mt-4`}>
        <Splitter layout="horizontal">
          <Panel defaultSize="50%">
            <div class={`${boxClass} bg-primary/5`}>按 Tab 聚焦中间分割线</div>
          </Panel>
          <Panel min={100}>
            <div class={`${boxClass} bg-primary/10`}>← → Home End</div>
          </Panel>
        </Splitter>
      </div>
    </section>
  </div>
};

export default SplitterPage;
