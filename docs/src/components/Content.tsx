import type { JSX } from '@solidjs/web'
import Table, { type TableColumnType } from 'upthrust-ui/source/Table'
import Button from 'upthrust-ui/source/Button'
import { useSite } from '../context'
import { withBase } from '../routing'

export function DocLink(props: { href: string; children: JSX.Element }) {
  return <a class="text-blue-600 no-underline hover:underline underline-offset-4" href={withBase(useSite().base, props.href)}>{props.children}</a>
}
export function Section(props: { id: string; title: string; children: JSX.Element }) {
  return <section aria-labelledby={props.id} class="my-10 scroll-mt-24">
    <h2 id={props.id} class="mb-5 text-[22px] font-semibold tracking-tight text-slate-900 scroll-mt-24">{props.title}</h2>
    <div class="text-[14px] leading-7 text-slate-600 space-y-4">{props.children}</div>
  </section>
}
function highlight(code: string) {
  return code.split(/(\/\/[^\n]*|'[^'\n]*'|"[^"\n]*"|\b(?:import|from|export|default|function|return|const|let|true|false)\b)/g).map(token => {
    const color = token.startsWith('//') ? 'text-slate-400' : /^['"]/.test(token) ? 'text-emerald-700' : /^(import|from|export|default|function|return|const|let|true|false)$/.test(token) ? 'text-violet-600' : ''
    return <span class={color}>{token}</span>
  })
}
export function CodeBlock(props: { code: string; language?: string }) {
  return <pre class="m-0 overflow-x-auto bg-slate-50/80 px-5 py-5 text-[12px] leading-[1.9] text-slate-700 font-mono" tabindex={0}>
    <code data-language={props.language ?? 'tsx'}>{highlight(props.code.trim())}</code>
  </pre>
}
export function Demo(props: { id: string; title: string; description?: string; source: string; minHeight?: number }) {
  return <section id={`demo-${props.id.replaceAll('/','-')}`} class="mb-6 min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-sm scroll-mt-24" aria-label={props.title} data-demo-section>
    <div data-demo={props.id} data-demo-state="pending" class="p-7 md:p-8 flex flex-col justify-center" style={{ 'min-height': `${props.minHeight ?? 132}px` }}>
      <p role="status" class="text-xs text-slate-400">示例加载中…</p>
    </div>
    <noscript><p class="px-6 pb-4 text-sm">请启用 JavaScript 查看交互示例。文档正文与源码不受影响。</p></noscript>
    <div class="border-t border-slate-100 px-6 py-4">
      <h3 class="m-0 text-sm font-semibold text-slate-900">{props.title}</h3>
      {props.description && <p class="m-0 mt-2 text-[13px] leading-6 text-slate-500">{props.description}</p>}
    </div>
    <details class="group border-t border-slate-100">
      <summary class="cursor-pointer select-none list-none px-6 py-2.5 text-xs text-slate-400 hover:text-blue-600 flex justify-between"><span>TSX</span><span class="group-open:hidden">〈/〉 展开代码</span><span class="hidden group-open:inline">〈/〉 收起代码</span></summary>
      <div class="flex justify-end px-4 py-1 border-t border-slate-100 bg-slate-50"><span data-copy-code><Button size="small" type="text">复制代码</Button></span></div>
      <CodeBlock code={props.source} />
    </details>
  </section>
}
export function DemoGrid(props: {children: JSX.Element}) {
  return <div class="grid grid-cols-1 xl:grid-cols-2 gap-x-6 items-start">{props.children}</div>
}
export interface ApiRow {name:string; type:string; default:string; description:string}
export function ApiTable(props: { rows: ApiRow[] }) {
  const columns: TableColumnType<ApiRow>[] = [
    {key:'name',dataIndex:'name',title:'属性',width:160,render:value => <code class="font-mono text-[12px] font-semibold text-slate-800">{String(value)}</code>},
    {key:'description',dataIndex:'description',title:'说明',width:360},
    {key:'type',dataIndex:'type',title:'类型',width:260,render:value => <code class="font-mono text-[12px] text-blue-600 break-words">{String(value)}</code>},
    {key:'default',dataIndex:'default',title:'默认值',width:130,render:value => <code class="font-mono text-[12px] text-slate-500">{String(value)}</code>},
  ]
  return <div data-api-table class="overflow-x-auto rounded-lg border border-slate-200 [&_th]:!bg-slate-50 [&_th]:!text-slate-600 [&_th]:!font-medium [&_td]:!align-top [&_td]:!py-4 [&_td]:!leading-6 [&_td]:!whitespace-normal [&_td]:!text-[13px]">
    <Table dataSource={props.rows} columns={columns} rowKey="name" pagination={false} size="middle" bordered={false} aria-label="API 属性表格" />
  </div>
}
