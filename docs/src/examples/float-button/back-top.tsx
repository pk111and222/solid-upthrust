import FloatButton from 'upthrust-ui/source/FloatButton'

// 回到顶部：target 指向演示内的滚动容器，滚动超过 visibilityHeight（这里 100px，默认 400）后淡入，点击 450ms 平滑回到顶部。
export default function BackTopDemo() {
  let pane: HTMLDivElement | undefined
  return <div style={{ position: 'relative', height: '240px', transform: 'translateZ(0)' }}>
    <div ref={el => { pane = el }} data-back-top-pane class="h-full overflow-auto rounded-lg border border-solid border-slate-200 px-md">
      <div style={{ height: '1200px' }} class="pt-md text-[13px] text-slate-500">向下滚动这个容器，右下角出现回到顶部按钮。</div>
    </div>
    <FloatButton.BackTop target={() => pane!} visibilityHeight={100} tooltip={<div>回到顶部</div>} />
  </div>
}
