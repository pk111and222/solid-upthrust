import { Component, createSignal } from "solid-js";
import { Alert, Button as UpButton } from 'upthrust-ui';

const AlertPage: Component = () => {
  const [closedText, setClosedText] = createSignal('')

  return <div class="space-y-8">
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
  </div>
};

export default AlertPage;
