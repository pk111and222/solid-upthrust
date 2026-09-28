import { createSteps } from 'upthrust-competence'
import Steps from 'upthrust-ui/source/Steps'
import Button from 'upthrust-ui/source/Button'

const items = [{ title: '填写信息' }, { title: '确认订单' }, { title: '支付' }, { title: '完成' }]

export default function HeadlessWizard() {
  // createSteps 的 navigateTo 自带守卫：可以回到已完成步骤或前进一步，不能跳过未完成的步骤。
  const wizard = createSteps({ items })
  return <div class="flex flex-col gap-md">
    <Steps current={wizard.current()} items={items} onChange={step => wizard.navigateTo(step)} />
    <div class="flex gap-xs">
      <Button disabled={!wizard.canGoTo(wizard.current() - 1)} onClick={() => wizard.prev()}>上一步</Button>
      <Button type="primary" disabled={!wizard.canGoTo(wizard.current() + 1)} onClick={() => wizard.next()}>下一步</Button>
      <Button onClick={() => wizard.reset()}>重置</Button>
    </div>
    <output data-current={wizard.current()} data-percent={wizard.percentOf()}>current = {String(wizard.current())}；进度 {String(wizard.percentOf())}%</output>
  </div>
}
