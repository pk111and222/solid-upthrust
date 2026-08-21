import { Component, createSignal } from "solid-js";
import { Layout, Header, Footer, Content, Sider, Button as UpButton } from 'upthrust-ui';

// Demo alignment: each region carries a distinct, visible background so
// the layout structure reads at a glance — Header primary-tinted, Content
// neutral gray, Footer darker gray, Sider dark navy.
const contentStyle = 'flex items-center justify-center h-full text-on-surface-variant';

const LayoutPage: Component = () => {
  const [controlledCollapsed, setControlledCollapsed] = createSignal(false)
  const [eventLog, setEventLog] = createSignal<string[]>([])

  const log = (msg: string) => setEventLog((prev) => [msg, ...prev].slice(0, 5))

  return <div class="space-y-8">
    {/* Basic structure */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">基本结构</h3>
      <div class="border border-outline-variant rounded-lg overflow-hidden">
        <Layout class="h-[240px]">
          <Header class="bg-primary-container text-on-primary">Header</Header>
          <Content><div class={contentStyle}>Content</div></Content>
          <Footer>Footer</Footer>
        </Layout>
      </div>
    </section>

    {/* Sider layout */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">侧边布局 hasSider</h3>
      <div class="border border-outline-variant rounded-lg overflow-hidden">
        <Layout class="h-[240px]" hasSider>
          <Sider theme="light"><div class="p-md text-on-surface-variant">Sider</div></Sider>
          <Content><div class={contentStyle}>Content</div></Content>
        </Layout>
      </div>
    </section>

    {/* Collapsible */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">可折叠 collapsible</h3>
      <p class="mb-2 text-[14px] text-on-surface-variant">点击底部 trigger 或按 Tab 聚焦后按 Enter/Space 折叠（键盘可访问）。</p>
      <div class="border border-outline-variant rounded-lg overflow-hidden">
        <Layout class="h-[240px]" hasSider>
          <Sider collapsible theme="light">
            <div class="p-md whitespace-nowrap text-on-surface-variant">侧边栏内容</div>
          </Sider>
          <Content><div class={contentStyle}>Content</div></Content>
        </Layout>
      </div>
    </section>

    {/* Controlled collapsed */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">受控折叠 collapsed</h3>
      <div class="flex gap-3 mb-2">
        <UpButton size="small" onClick={() => setControlledCollapsed((v) => !v)}>
          {controlledCollapsed() ? '展开' : '折叠'}
        </UpButton>
      </div>
      <div class="border border-outline-variant rounded-lg overflow-hidden">
        <Layout class="h-[240px]" hasSider>
          <Sider collapsible theme="light" collapsed={controlledCollapsed()} onCollapse={(c) => log(`onCollapse: ${c}`)}>
            <div class="p-md text-on-surface-variant">受控侧边栏</div>
          </Sider>
          <Content><div class={contentStyle}>Content</div></Content>
        </Layout>
      </div>
    </section>

    {/* Sider themes */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">主题 theme</h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="border border-outline-variant rounded-lg overflow-hidden">
          <div class="text-[14px] text-on-surface-variant px-md pt-sm">theme="dark"（默认）</div>
          <Layout class="h-[200px]" hasSider>
            <Sider collapsible><div class="p-md">Dark Sider</div></Sider>
            <Content><div class={contentStyle}>Content</div></Content>
          </Layout>
        </div>
        <div class="border border-outline-variant rounded-lg overflow-hidden">
          <div class="text-[14px] text-on-surface-variant px-md pt-sm">theme="light"</div>
          <Layout class="h-[200px]" hasSider>
            <Sider collapsible theme="light"><div class="p-md">Light Sider</div></Sider>
            <Content><div class={contentStyle}>Content</div></Content>
          </Layout>
        </div>
      </div>
    </section>

    {/* Misc props */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">collapsedWidth / reverseArrow / trigger</h3>
      <div class="grid grid-cols-3 gap-4">
        <div class="border border-outline-variant rounded-lg overflow-hidden">
          <div class="text-[14px] text-on-surface-variant px-md pt-sm">collapsedWidth=40</div>
          <Layout class="h-[200px]" hasSider>
            <Sider collapsible collapsedWidth={40}><div class="p-md">40</div></Sider>
            <Content><div class={contentStyle}>Content</div></Content>
          </Layout>
        </div>
        <div class="border border-outline-variant rounded-lg overflow-hidden">
          <div class="text-[14px] text-on-surface-variant px-md pt-sm">reverseArrow</div>
          <Layout class="h-[200px]" hasSider>
            <Sider collapsible reverseArrow><div class="p-md">箭头反向</div></Sider>
            <Content><div class={contentStyle}>Content</div></Content>
          </Layout>
        </div>
        <div class="border border-outline-variant rounded-lg overflow-hidden">
          <div class="text-[14px] text-on-surface-variant px-md pt-sm">trigger=null（隐藏）</div>
          <Layout class="h-[200px]" hasSider>
            <Sider collapsible trigger={null}><div class="p-md">无 trigger</div></Sider>
            <Content><div class={contentStyle}>Content</div></Content>
          </Layout>
        </div>
      </div>
      <p class="mt-2 text-[12px] text-on-surface-variant">已知限制：collapsedWidth=0 时无浮动 trigger（暂未实现），折叠后侧边栏完全隐藏。</p>
    </section>

    {/* Breakpoint */}
    <section>
      <h3 class="text-[16px] font-medium mb-4 text-on-surface">响应式 breakpoint</h3>
      <p class="mb-2 text-[14px] text-on-surface-variant">breakpoint="md"：视口宽度低于 768px 时自动折叠，恢复时自动展开。</p>
      <div class="border border-outline-variant rounded-lg overflow-hidden">
        <Layout class="h-[200px]" hasSider>
          <Sider
            collapsible
            theme="light"
            breakpoint="md"
            onCollapse={(collapsed, type) => log(`onCollapse: ${collapsed} (${type})`)}
            onBreakpoint={(broken) => log(`onBreakpoint: ${broken}`)}
          >
            <div class="p-md">响应式侧边栏</div>
          </Sider>
          <Content><div class={contentStyle}>缩小浏览器窗口观察</div></Content>
        </Layout>
      </div>
      <div class="mt-2 text-[12px] text-on-surface-variant font-mono space-y-1">
        {eventLog().map((entry) => <div>{entry}</div>)}
      </div>
    </section>
  </div>
};

export default LayoutPage;
