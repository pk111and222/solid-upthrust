import { Component, createSignal } from "solid-js";
import { Alert, Button as UpButton } from 'upthrust-ui';

const AlertPage: Component = () => {
  const [closedText, setClosedText] = createSignal('')

  return <div class="p-6 max-w-4xl space-y-8">
    <h2 class="text-2xl font-bold mb-4">Alert 警告提示</h2>
    <p class="text-on-surface-variant mb-6">警告提示，展现需要关注的信息。四种类型（success/info/warning/error），支持可关闭、含描述、banner 模式、自定义操作与图标。</p>
    {/* Basic types */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">基本使用</h3>
      <div class="space-y-3">
        <Alert type="success" message="Success Text" />
        <Alert type="info" message="Info Text" />
        <Alert type="warning" message="Warning Text" />
        <Alert type="error" message="Error Text" />
      </div>
    </section>

    {/* Closable */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">可关闭的警告提示</h3>
      <div class="space-y-3">
        <Alert type="warning" message="Warning Text" closable />
        <Alert type="error" message="Error Text" closable onClose={() => setClosedText('错误提示已关闭')} />
      </div>
      {closedText() && <p class="mt-2 text-[14px] text-on-surface-variant">{closedText()}</p>}
    </section>

    {/* With description */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">含描述信息</h3>
      <div class="space-y-3">
        <Alert
          type="success"
          message="Success Text"
          description="Success Description Success Description Success Description"
        />
        <Alert
          type="info"
          message="Info Text"
          description="Info Description Info Description Info Description"
          closable
        />
      </div>
    </section>

    {/* Banner */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">顶部公告 banner</h3>
      <Alert message="Warning Text" type="warning" banner closable />
    </section>

    {/* No icon */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">无图标</h3>
      <Alert message="Success Text" type="success" showIcon={false} />
    </section>

    {/* Action */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">自定义操作 action</h3>
      <Alert
        message="Info Text"
        type="info"
        action={<UpButton variant="link" color="primary" size="small">不再显示</UpButton>}
        closable
      />
      <p class="mt-2 text-[14px] text-on-surface-variant">action 与关闭按钮同时存在时自动避让（action 右侧预留 × 的空间）；关闭时整体淡出并塌缩。</p>
    </section>

    {/* Custom close behavior */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">关闭后回调 afterClose</h3>
      <Alert
        message="Warning Text"
        type="warning"
        closable
        afterClose={() => console.log('afterClose: 警告提示已完全关闭')}
      />
    </section>

    {/* Arbitrary-value transition demo — the preset patches wind4's whitelist */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">任意值 transition（含 translate/scale）</h3>
      <p class="mb-sm text-[14px] text-on-surface-variant">
        wind4 的 transition-[...] 属性白名单不含 translate/scale，直接写会静默失效回退成 all。
        本主题的 preset 已拦截并扩展白名单——任意值列表里写 translate/scale/rotate 也能正确生成。
      </p>
      <div class="transition-[opacity,transform,translate,scale] duration-mid ease-upthrust hover:opacity-60 hover:scale-95 hover:translate-y-1 p-md rounded-lg border border-solid border-outline-variant/40 cursor-pointer">
        hover 我试试 —— opacity + scale + translate 同时过渡
      </div>
    </section>
  </div>
};

export default AlertPage;
