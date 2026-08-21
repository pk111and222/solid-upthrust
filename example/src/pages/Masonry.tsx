import { Component, For } from "solid-js";
import { Masonry } from 'upthrust-ui';

const itemClass = (height: number) =>
  `flex items-center justify-center rounded bg-surface-variant/60 text-on-surface text-[14px]`;

const heights = [80, 120, 96, 140, 104, 88, 132, 112, 92, 124, 100, 116];

const Items: Component<{ count: number; offset?: number }> = (props) => (
  <For each={heights.slice(0, props.count)}>
    {(h, i) => (
      <div class={itemClass(h)} style={{ height: `${h + (props.offset ?? 0)}px` }}>
        Item {i() + 1}
      </div>
    )}
  </For>
);

const MasonryPage: Component = () => {
  return <div class="space-y-8">
    {/* Fixed columns */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">基本使用（固定列数）</h3>
      <div class="border border-outline-variant rounded-lg p-sm">
        <Masonry columns={3}>
          <Items count={9} />
        </Masonry>
      </div>
    </section>

    {/* Responsive named breakpoints */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">响应式列数（命名断点）</h3>
      <p class="mb-2 text-[14px] text-on-surface-variant">
        columns={'{{ xs: 1, md: 2, xl: 4 }}'}：视口 ≥768px 双列、≥1200px 四列、更窄单列。拖动浏览器窗口观察。
      </p>
      <div class="border border-outline-variant rounded-lg p-sm">
        <Masonry columns={{ xs: 1, md: 2, xl: 4 }}>
          <Items count={12} />
        </Masonry>
      </div>
    </section>

    {/* Sequential vs round-robin */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">分配模式 sequential</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="text-[14px] text-on-surface-variant mb-2">轮询（默认）：12 项 5 列均匀轮转</div>
          <div class="border border-outline-variant rounded-lg p-sm">
            <Masonry columns={5}>
              <Items count={12} offset={-20} />
            </Masonry>
          </div>
        </div>
        <div>
          <div class="text-[14px] text-on-surface-variant mb-2">sequential：顺序填满（3/3/2/2/2，无空列）</div>
          <div class="border border-outline-variant rounded-lg p-sm">
            <Masonry columns={5} sequential>
              <Items count={12} offset={-20} />
            </Masonry>
          </div>
        </div>
      </div>
    </section>

    {/* Gutter */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">间距 gutter</h3>
      <div class="space-y-4">
        <div>
          <div class="text-[14px] text-on-surface-variant mb-2">命名档位 small(8) / middle(16) / large(24)</div>
          <div class="grid grid-cols-3 gap-4">
            <div class="border border-outline-variant rounded-lg p-sm"><Masonry columns={2} gutter="small"><Items count={4} offset={-30} /></Masonry></div>
            <div class="border border-outline-variant rounded-lg p-sm"><Masonry columns={2} gutter="middle"><Items count={4} offset={-30} /></Masonry></div>
            <div class="border border-outline-variant rounded-lg p-sm"><Masonry columns={2} gutter="large"><Items count={4} offset={-30} /></Masonry></div>
          </div>
        </div>
        <div>
          <div class="text-[14px] text-on-surface-variant mb-2">数值 24 与 数组 [24, 8]（列间距 24、条目间距 8）</div>
          <div class="grid grid-cols-2 gap-4">
            <div class="border border-outline-variant rounded-lg p-sm"><Masonry columns={3} gutter={24}><Items count={6} offset={-30} /></Masonry></div>
            <div class="border border-outline-variant rounded-lg p-sm"><Masonry columns={3} gutter={[24, 8]}><Items count={6} offset={-30} /></Masonry></div>
          </div>
        </div>
      </div>
    </section>
  </div>
};

export default MasonryPage;
