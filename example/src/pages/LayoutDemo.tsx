import { Component } from "solid-js";
import { Layout, Header, Footer, Content, Sider, Divider } from 'upthrust-ui';

const LayoutPage: Component = () => {
  const headerStyle = { background: '#0055ff', color: 'white', 'text-align': 'center' as const }
  const contentStyle = { background: '#d4e3ff', color: '#333', padding: '24px', 'min-height': '120px', 'text-align': 'center' as const }
  const siderStyle = { background: '#003db3', color: 'white', padding: '24px', 'text-align': 'center' as const }
  const footerStyle = { background: '#002266', color: 'white', 'text-align': 'center' as const }

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-semibold mb-4">Layout 布局</h2>

      <h3 class="text-lg font-medium mb-2">上中下布局</h3>
      <Layout class="mb-8">
        <Header style={headerStyle}>Header</Header>
        <Content style={contentStyle}>Content</Content>
        <Footer style={footerStyle}>Footer</Footer>
      </Layout>

      <Divider />

      <h3 class="text-lg font-medium mb-2">侧边栏布局</h3>
      <Layout hasSider class="mb-8" style={{ height: '240px' }}>
        <Sider width={200} style={siderStyle}>Sider</Sider>
        <Layout>
          <Header style={headerStyle}>Header</Header>
          <Content style={contentStyle}>Content</Content>
          <Footer style={footerStyle}>Footer</Footer>
        </Layout>
      </Layout>

      <Divider />

      <h3 class="text-lg font-medium mb-2">右侧边栏</h3>
      <Layout hasSider class="mb-8" style={{ height: '240px' }}>
        <Layout>
          <Header style={headerStyle}>Header</Header>
          <Content style={contentStyle}>Content</Content>
          <Footer style={footerStyle}>Footer</Footer>
        </Layout>
        <Sider width={200} style={siderStyle}>Sider</Sider>
      </Layout>

      <Divider />

      <h3 class="text-lg font-medium mb-2">顶部-侧边布局</h3>
      <Layout class="mb-8" style={{ height: '300px' }}>
        <Header style={headerStyle}>Header</Header>
        <Layout hasSider>
          <Sider width={200} collapsible style={siderStyle}>Sider</Sider>
          <Content style={contentStyle}>Content</Content>
        </Layout>
      </Layout>
    </div>
  )
}

export default LayoutPage
