import type { JSX } from '@solidjs/web'
import Layout, { Header, Content, Footer } from 'upthrust-ui/source/Layout'
import Menu from 'upthrust-ui/source/Menu'
import { withBase, type DocRoute } from '../routing'

export interface DocumentProps {
  title: string; description: string; path: string; base: string; routes: DocRoute[]
  scripts: string[]; styles: string[]; canonical?: string; notFound?: boolean; children: JSX.Element
}
export function Document(props: DocumentProps) {
  const groups = ['开始使用', '研发指南', '组件'] as const
  const menu = () => <Menu mode="inline" selectedKeys={[props.path]}
    class="!border-0 !bg-transparent [&_[role=menuitem]]:!p-0 [&_[role=menuitem]]:!h-auto [&_[role=menuitem]]:!rounded-lg [&_[role=menuitem]]:mb-1"
    items={groups.map(group => ({ key:group, label:group, type:'group', children:props.routes.filter(route => route.meta.group === group).map(route => ({key:route.path,label:route.meta.title})) }))}
    renderLabel={item => item.type === 'group' ? <span class="text-[11px] tracking-wider text-slate-400">{item.label}</span> :
      <a class="block w-full px-4 py-2.5 text-[13px] no-underline text-inherit transition-colors hover:text-blue-600" href={withBase(props.base,item.key)} aria-current={item.key === props.path ? 'page' : undefined}>{item.label}</a>} />
  const componentPage = props.path.startsWith('/components/general/')
  return <html lang="zh-CN">
    <head>
      <meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{`${props.title} · Solid Upthrust`}</title><meta name="description" content={props.description} />
      <meta name="theme-color" content="#ffffff" />
      {props.notFound && <meta name="robots" content="noindex" />}
      {props.canonical && <link rel="canonical" href={props.canonical} />}
      {props.styles.map(href => <link rel="stylesheet" href={href} />)}
    </head>
    <body data-docs-shell class="m-0 bg-white font-sans text-slate-800 antialiased" style={{'--upthrust-colors-primary':'37 99 235','--upthrust-colors-surface':'255 255 255','--upthrust-colors-outline-variant':'226 232 240'}}>
      <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-white focus:p-4">跳至正文</a>
      <Layout class="min-h-screen !bg-white">
        <Header class="sticky top-0 z-30 !h-16 !px-5 md:!px-8 !bg-white/95 backdrop-blur !border-slate-200/80 justify-between">
          <a href={withBase(props.base,'/')} class="flex items-center gap-3 text-slate-900 no-underline">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">↗</span>
            <span class="font-semibold text-lg tracking-tight">Solid Upthrust</span>
          </a>
          <nav aria-label="主导航" class="flex items-center gap-6 text-[13px] font-medium">
            <a href={withBase(props.base,'/guide/')} class="hidden sm:block text-slate-500 no-underline hover:text-blue-600">开发指南</a>
            <a href={withBase(props.base,'/components/')} class="text-blue-600 no-underline">组件</a>
            <span class="hidden md:block border-l border-slate-200 pl-6 text-slate-400 font-normal">Solid 2 RC</span>
          </nav>
        </Header>
        <div data-mobile-menu class="md:hidden border-b border-slate-200 bg-slate-50 px-5">
          <details><summary class="py-3 text-sm cursor-pointer">文档目录</summary><nav aria-label="移动文档目录" class="pb-4">{menu()}</nav></details>
        </div>
        <Layout hasSider class="!items-start !bg-white">
          <aside class="hidden md:block sticky top-16 h-[calc(100vh-4rem)] w-[248px] shrink-0 overflow-y-auto border-r border-slate-200/80 px-4 pt-6 pb-12">
            <nav aria-label="文档目录">{menu()}</nav>
            <div class="mt-10 px-4 text-[11px] text-slate-400 leading-6">面向 SolidJS 的企业级组件库</div>
          </aside>
          <Content class="!bg-white min-w-0">
            <div class="flex min-w-0">
              <article id="main-content" tabindex={-1} class="outline-none min-w-0 flex-1 px-5 py-9 md:px-10 lg:px-14 lg:py-12 scroll-mt-24">
                <div class="mb-4 flex items-center gap-2 text-xs text-slate-400"><span>{componentPage ? '组件 / 通用' : '文档'}</span><span>/</span><span class="text-slate-600">{props.title}</span></div>
                <h1 class="m-0 mb-5 text-[32px] md:text-[38px] leading-tight tracking-tight font-semibold text-slate-900">{props.title}</h1>
                <p class="m-0 mb-9 text-[15px] leading-7 text-slate-500 max-w-4xl">{props.description}</p>
                {props.children}
                <Footer class="!bg-white !px-0 !pt-7 !mt-16 !text-xs !border-slate-200 !text-slate-400">Solid Upthrust · 基于 Solid 2 构建</Footer>
              </article>
              {componentPage && <aside class="hidden 2xl:block sticky top-28 w-44 shrink-0 self-start pt-14 pr-6 text-xs">
                <p class="mb-4 font-medium text-slate-900">本页内容</p>
                <nav aria-label="本页内容" class="border-l border-slate-200 flex flex-col gap-4 pl-4 text-slate-500">
                  <a href="#usage" class="text-inherit no-underline hover:text-blue-600">使用方式</a>
                  <a href="#examples" class="text-inherit no-underline hover:text-blue-600">代码演示</a>
                  <a href="#api" class="text-inherit no-underline hover:text-blue-600">API</a>
                  <a href="#contracts" class="text-inherit no-underline hover:text-blue-600">注意事项</a>
                </nav>
              </aside>}
            </div>
          </Content>
        </Layout>
      </Layout>
      {props.scripts.map(src => <script type="module" src={src}></script>)}
    </body>
  </html>
}
