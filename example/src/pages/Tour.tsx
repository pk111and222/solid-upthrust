import { createSignal } from 'solid-js'
import { Button, Divider, Tour } from 'upthrust-ui'
export default function TourPage() {
  let createTarget!: HTMLDivElement, filterTarget!: HTMLDivElement, reportTarget!: HTMLDivElement
  const [open, setOpen] = createSignal(false)
  const [current, setCurrent] = createSignal(0)
  const [interactiveCurrent, setInteractiveCurrent] = createSignal(0)
  const [interactive, setInteractive] = createSignal(false)
  const [custom, setCustom] = createSignal(false)
  const [count, setCount] = createSignal(0)
  const [confirmed, setConfirmed] = createSignal(false)
  const [status, setStatus] = createSignal('尚未开始', { ownedWrite: true })
  const start = () => { setCurrent(0); setOpen(true); setStatus('引导进行中') }
  return <div class="p-6 max-w-4xl">
    <h2 class="text-2xl font-bold mb-3">Tour 漫游式引导</h2>
    <p class="text-on-surface-variant mb-6">逐步介绍产品功能，支持目标高亮、自动滚动、异步步骤校验与自定义内容。</p>
    <div class="flex items-center gap-3 flex-wrap mb-4"><Button variant="solid" onClick={start}>开始工作台引导</Button><span role="status">{status()}</span></div>
    <div class="border border-solid border-outline-variant rounded p-4 bg-surface-container-low">
      <div class="flex items-center justify-between gap-4 flex-wrap"><div><h3 class="m-0 text-lg font-semibold">项目工作台</h3><p class="text-sm text-on-surface-variant">从创建项目到查看报告</p></div><div ref={createTarget}><Button variant="solid">创建项目</Button></div></div>
      <div ref={filterTarget} class="mt-4 flex gap-3 items-center flex-wrap"><label>项目状态 <select class="rounded border border-solid border-outline-variant p-2"><option>全部项目</option><option>进行中</option><option>已完成</option></select></label><span class="text-sm text-on-surface-variant">共 12 个项目</span></div>
      <div class="mt-4 h-[240px] overflow-auto border border-solid border-outline-variant rounded p-4" tabindex={0} aria-label="报告滚动区域"><p class="text-on-surface-variant">报告位于此滚动区域下方，引导会自动将目标滚入视口。</p><div class="h-[360px]" /><div ref={reportTarget} class="p-4 rounded bg-surface"><strong>项目汇总报告</strong><p class="text-sm">查看成员贡献、任务进度和交付情况。</p><Button>导出报告</Button></div></div>
    </div>
    <Tour open={open()} current={current()} onOpenChange={setOpen} onChange={setCurrent} gap={8} radius={8} width={380}
      onClose={(_, reason) => setStatus(`引导已关闭：${reason}`)} onFinish={() => setStatus('已完成全部步骤')}
      steps={[
        { target: () => createTarget, title: '创建你的第一个项目', description: '从这里创建项目，邀请成员并分配任务。', placement: 'bottom' },
        { target: () => filterTarget, title: '快速筛选项目', description: '根据项目状态缩小范围，找到正在处理的工作。', placement: 'right' },
        { target: () => reportTarget, title: '查看汇总报告', description: '即使目标位于嵌套滚动区域内，也会自动滚动并持续跟随位置。', placement: 'top' },
        { title: '准备就绪', description: '无目标的步骤居中展示，适合欢迎页、总结或尚未出现的目标。', type: 'primary' },
      ]} />
    <Divider />
    <h3 class="text-lg font-semibold">允许操作目标 · 异步校验</h3>
    <p class="text-sm text-on-surface-variant">此引导不显示遮罩。先勾选确认，再进入下一步；模拟校验期间禁止重复切换。</p>
    <label class="flex items-center gap-2 mb-3"><input type="checkbox" checked={confirmed()} onChange={e => setConfirmed(e.currentTarget.checked)} />我已确认项目设置</label>
    <div class="flex items-center gap-3 flex-wrap"><Button onClick={() => { setConfirmed(false); setInteractiveCurrent(0); setInteractive(true) }}>开始交互引导</Button><button id="tour-interactive-target" class="rounded border border-solid border-primary text-primary px-3 py-2" onClick={() => setCount(count() + 1)}>目标按钮：已点击 {count()} 次</button></div>
    <Tour open={interactive()} onOpenChange={setInteractive} current={interactiveCurrent()} onChange={setInteractiveCurrent} mask={false} disabledInteraction={false}
      beforeChange={async (next) => { if (next === 1 && !confirmed()) { setStatus('请先勾选“我已确认项目设置”'); return false } await new Promise(resolve => setTimeout(resolve, 500)); return true }}
      onFinish={() => setStatus('交互引导已完成')}
      steps={[{ target: () => document.getElementById('tour-interactive-target'), title: '试着操作目标', description: '可以点击目标按钮、勾选页面上的确认项，然后点击下一步。' }, { target: () => document.getElementById('tour-missing-target'), title: '校验成功', description: '目标不存在时自动居中，不会阻塞后续操作。' }]} />
    <Divider />
    <h3 class="text-lg font-semibold">主题与自定义页脚</h3>
    <p class="text-sm text-on-surface-variant">覆盖内容、步骤指示和按钮文案。此例允许点击遮罩关闭，也可按 Escape 退出。</p>
    <Button onClick={() => setCustom(true)}>打开自定义引导</Button>
    <Tour open={custom()} onOpenChange={setCustom} type="primary" width={420} maskClosable showSkip={false}
      indicatorsRender={(index, total) => <span>进度 {index + 1} / {total}</span>}
      footerRender={instance => <button class="rounded border border-solid border-current px-3 py-2 ml-auto" disabled={instance.pending()} onClick={() => { void instance.next() }}>立即体验</button>}
      steps={[{ title: '让团队协作更简单', cover: <div class="p-6 bg-primary-container text-on-primary-container text-2xl font-bold">欢迎使用工作台</div>, description: '标题、描述和封面均支持 JSX；也可以通过实例实现自己的步骤导航。' }]} />
  </div>
}
