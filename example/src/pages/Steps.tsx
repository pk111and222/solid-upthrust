import type { Component } from 'solid-js'
import Basic from '../../../docs/src/examples/steps/basic'
import Small from '../../../docs/src/examples/steps/small'
import Icon from '../../../docs/src/examples/steps/icon'
import StepSwitch from '../../../docs/src/examples/steps/step-switch'
import Vertical from '../../../docs/src/examples/steps/vertical'
import VerticalSmall from '../../../docs/src/examples/steps/vertical-small'
import ErrorStatus from '../../../docs/src/examples/steps/error'
import ProgressDot from '../../../docs/src/examples/steps/progress-dot'
import CustomDot from '../../../docs/src/examples/steps/custom-dot'
import TitlePlacement from '../../../docs/src/examples/steps/title-placement'
import Clickable from '../../../docs/src/examples/steps/clickable'
import ProgressDemo from '../../../docs/src/examples/steps/progress'
import Variant from '../../../docs/src/examples/steps/variant'
import Initial from '../../../docs/src/examples/steps/initial'
import StyleClass from '../../../docs/src/examples/steps/style-class'
import HeadlessWizard from '../../../docs/src/examples/steps/headless-wizard'

const StepsPage: Component = () => (
  <div class="p-6 max-w-5xl flex flex-col gap-8">
    <div>
      <h2 class="text-2xl font-bold mb-2">Steps 步骤条</h2>
      <p class="text-on-surface-variant">引导用户按照流程完成任务的导航条。</p>
    </div>
    <section data-steps-demo="basic"><h3 class="text-lg font-semibold mb-3">基本用法</h3><Basic /></section>
    <section data-steps-demo="small"><h3 class="text-lg font-semibold mb-3">迷你版</h3><Small /></section>
    <section data-steps-demo="icon"><h3 class="text-lg font-semibold mb-3">带图标的步骤条</h3><Icon /></section>
    <section data-steps-demo="step-switch"><h3 class="text-lg font-semibold mb-3">步骤切换</h3><StepSwitch /></section>
    <section data-steps-demo="vertical"><h3 class="text-lg font-semibold mb-3">竖直方向的步骤条</h3><Vertical /></section>
    <section data-steps-demo="vertical-small"><h3 class="text-lg font-semibold mb-3">竖直方向的小型步骤条</h3><VerticalSmall /></section>
    <section data-steps-demo="error"><h3 class="text-lg font-semibold mb-3">步骤运行错误</h3><ErrorStatus /></section>
    <section data-steps-demo="progress-dot"><h3 class="text-lg font-semibold mb-3">点状步骤条</h3><ProgressDot /></section>
    <section data-steps-demo="custom-dot"><h3 class="text-lg font-semibold mb-3">自定义点状步骤条</h3><CustomDot /></section>
    <section data-steps-demo="title-placement"><h3 class="text-lg font-semibold mb-3">标题位置</h3><TitlePlacement /></section>
    <section data-steps-demo="clickable"><h3 class="text-lg font-semibold mb-3">可点击</h3><Clickable /></section>
    <section data-steps-demo="progress"><h3 class="text-lg font-semibold mb-3">带有进度的步骤</h3><ProgressDemo /></section>
    <section data-steps-demo="variant"><h3 class="text-lg font-semibold mb-3">变体</h3><Variant /></section>
    <section data-steps-demo="initial"><h3 class="text-lg font-semibold mb-3">起始序号</h3><Initial /></section>
    <section data-steps-demo="style-class"><h3 class="text-lg font-semibold mb-3">语义化 classNames / styles</h3><StyleClass /></section>
    <section data-steps-demo="headless-wizard"><h3 class="text-lg font-semibold mb-3">Headless 向导</h3><HeadlessWizard /></section>
  </div>
)

export default StepsPage
