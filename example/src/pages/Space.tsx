import { Component } from "solid-js";
import { Space, Compact, Button as UpButton } from 'upthrust-ui';

const cardClass = 'inline-flex items-center justify-center rounded bg-surface-variant/60 text-on-surface w-[80px] h-[48px]';

const SpacePage: Component = () => {
  return <div class="space-y-8">
    {/* Sizes */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">尺寸 size（默认 small=8px）</h3>
      <div class="space-y-3">
        <div><span class="text-[14px] text-on-surface-variant mr-md">small(8)</span>
          <Space size="small"><div class={cardClass} /><div class={cardClass} /><div class={cardClass} /></Space>
        </div>
        <div><span class="text-[14px] text-on-surface-variant mr-md">middle(16)</span>
          <Space size="middle"><div class={cardClass} /><div class={cardClass} /><div class={cardClass} /></Space>
        </div>
        <div><span class="text-[14px] text-on-surface-variant mr-md">large(24)</span>
          <Space size="large"><div class={cardClass} /><div class={cardClass} /><div class={cardClass} /></Space>
        </div>
        <div><span class="text-[14px] text-on-surface-variant mr-md">数值 32</span>
          <Space size={32}><div class={cardClass} /><div class={cardClass} /><div class={cardClass} /></Space>
        </div>
        <div><span class="text-[14px] text-on-surface-variant mr-md">数组 [24, 'small']（水平 24 / 垂直 8，配合 wrap 观察）</span>
          <Space size={[24, 'small']} wrap>
            {Array.from({ length: 8 }, () => <div class={cardClass} />)}
          </Space>
        </div>
      </div>
    </section>

    {/* Direction & align */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">方向 direction 与 对齐 align</h3>
      <div class="flex flex-wrap gap-x-lg">
        <div>
          <div class="text-[14px] text-on-surface-variant mb-2">vertical</div>
          <Space direction="vertical">
            <div class={cardClass} /><div class={cardClass} /><div class={cardClass} />
          </Space>
        </div>
        <div>
          <div class="text-[14px] text-on-surface-variant mb-2">vertical + align="end"</div>
          <Space direction="vertical" align="end">
            <div class={cardClass} /><div class="w-[120px] h-[48px] inline-flex items-center justify-center rounded bg-surface-variant/60 text-on-surface" /><div class={cardClass} />
          </Space>
        </div>
        <div>
          <div class="text-[14px] text-on-surface-variant mb-2">horizontal + align="baseline"</div>
          <Space align="baseline">
            <span class="text-[24px] text-on-surface">大字</span>
            <span class="text-[12px] text-on-surface-variant">小字 baseline</span>
          </Space>
        </div>
      </div>
    </section>

    {/* Wrap & block */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">换行 wrap 与 撑满 block</h3>
      <div class="space-y-3">
        <div class="w-[360px] border border-outline-variant rounded-lg p-sm">
          <Space wrap size="middle">
            {Array.from({ length: 6 }, (_, i) => <UpButton>按钮 {i + 1}</UpButton>)}
          </Space>
        </div>
        <div class="w-[360px] border border-outline-variant rounded-lg p-sm">
          <Space block size="middle">
            <div class="flex-1 h-[48px] rounded bg-surface-variant/60" />
            <div class="w-[80px] h-[48px] rounded bg-surface-variant/60" />
          </Space>
        </div>
      </div>
    </section>

    {/* Split */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">分隔符 split</h3>
      <Space split={<span class="text-on-surface-variant">|</span>}>
        <a class="text-primary cursor-pointer">链接一</a>
        <a class="text-primary cursor-pointer">链接二</a>
        <a class="text-primary cursor-pointer">链接三</a>
      </Space>
    </section>

    {/* Compact */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">紧凑 Compact</h3>
      <div class="space-y-4">
        <div>
          <div class="text-[14px] text-on-surface-variant mb-2">普通 Space（有间隙、各自圆角）</div>
          <Space size="small">
            <UpButton>按钮一</UpButton><UpButton>按钮二</UpButton><UpButton variant="solid" color="primary">按钮三</UpButton>
          </Space>
        </div>
        <div>
          <div class="text-[14px] text-on-surface-variant mb-2">Compact（贴合、圆角裁剪、边框合并）</div>
          <Compact>
            <UpButton>按钮一</UpButton><UpButton>按钮二</UpButton><UpButton variant="solid" color="primary">按钮三</UpButton>
          </Compact>
        </div>
        <div>
          <div class="text-[14px] text-on-surface-variant mb-2">Compact 垂直方向</div>
          <Compact direction="vertical">
            <UpButton block>按钮一</UpButton><UpButton block>按钮二</UpButton>
          </Compact>
        </div>
        <div>
          <div class="text-[14px] text-on-surface-variant mb-2">单子元素（圆角完整保留）</div>
          <Compact><UpButton>唯一按钮</UpButton></Compact>
        </div>
        <div>
          <div class="text-[14px] text-on-surface-variant mb-2">Space.Compact 命名空间用法（等价）</div>
          <Space.Compact>
            <UpButton>按钮一</UpButton><UpButton>按钮二</UpButton>
          </Space.Compact>
        </div>
      </div>
    </section>
  </div>
};

export default SpacePage;
