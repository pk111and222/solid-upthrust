import Layout from 'upthrust-ui/source/Layout'

const { Header, Footer, Sider, Content } = Layout

/** 各区域着色，只为看清结构；Header/Footer/Content/Sider 本身自带默认配色。 */
const header = 'justify-center text-on-primary bg-primary border-0'
const content = 'min-h-[120px] flex items-center justify-center text-on-primary bg-primary/70'
const footer = 'text-center text-on-primary bg-primary/85 border-0'
const sider = { class: 'text-on-primary bg-primary/85', classNames: { body: 'flex items-center justify-center' } }
const frame = 'rounded-lg overflow-hidden'

export default function Basic() {
  return <div class="flex flex-col gap-lg" data-layout-basic>
    <Layout class={frame} data-case="top">
      <Header class={header}>Header</Header>
      <Content class={content}>Content</Content>
      <Footer class={footer}>Footer</Footer>
    </Layout>

    <Layout class={frame} data-case="sider-left">
      <Header class={header}>Header</Header>
      <Layout>
        <Sider width="25%" {...sider}>Sider</Sider>
        <Content class={content}>Content</Content>
      </Layout>
      <Footer class={footer}>Footer</Footer>
    </Layout>

    <Layout class={frame} data-case="sider-right">
      <Header class={header}>Header</Header>
      <Layout>
        <Content class={content}>Content</Content>
        <Sider width="25%" {...sider}>Sider</Sider>
      </Layout>
      <Footer class={footer}>Footer</Footer>
    </Layout>

    <Layout class={frame} data-case="sider-full">
      <Sider width="25%" {...sider}>Sider</Sider>
      <Layout>
        <Header class={header}>Header</Header>
        <Content class={content}>Content</Content>
        <Footer class={footer}>Footer</Footer>
      </Layout>
    </Layout>
  </div>
}
