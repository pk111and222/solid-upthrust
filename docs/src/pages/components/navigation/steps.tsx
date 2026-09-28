import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, Section } from '../../../components/Content'
import api from './steps-api.json'
import itemApi from './steps-item-api.json'
import basic from '../../../examples/steps/basic.tsx?raw'
import small from '../../../examples/steps/small.tsx?raw'
import icon from '../../../examples/steps/icon.tsx?raw'
import stepSwitch from '../../../examples/steps/step-switch.tsx?raw'
import vertical from '../../../examples/steps/vertical.tsx?raw'
import verticalSmall from '../../../examples/steps/vertical-small.tsx?raw'
import error from '../../../examples/steps/error.tsx?raw'
import progressDot from '../../../examples/steps/progress-dot.tsx?raw'
import customDot from '../../../examples/steps/custom-dot.tsx?raw'
import titlePlacement from '../../../examples/steps/title-placement.tsx?raw'
import clickable from '../../../examples/steps/clickable.tsx?raw'
import progress from '../../../examples/steps/progress.tsx?raw'
import variant from '../../../examples/steps/variant.tsx?raw'
import initial from '../../../examples/steps/initial.tsx?raw'
import styleClass from '../../../examples/steps/style-class.tsx?raw'
import headlessWizard from '../../../examples/steps/headless-wizard.tsx?raw'

export const meta: PageMeta = { title: 'Steps 步骤条', description: '引导用户按照流程完成任务的导航条。', group: '组件', order: 152 }

export default function Page() {
  return <>
    <Section id="usage" title="使用方式">
      <p>从 upthrust-ui 导入 Steps，用 items 描述步骤，current 指定当前步骤。当前步骤之前为 finish，之后为 wait，当前步骤取 status（默认 process）；单项的 status 可以覆盖推导结果。</p>
    </Section>
    <Demo id="steps/basic" title="基本用法" source={basic} />
    <Demo id="steps/small" title="迷你版" source={small} />
    <Demo id="steps/icon" title="带图标的步骤条" source={icon} />
    <Demo id="steps/step-switch" title="步骤切换" source={stepSwitch} />
    <Demo id="steps/vertical" title="竖直方向的步骤条" source={vertical} />
    <Demo id="steps/vertical-small" title="竖直方向的小型步骤条" source={verticalSmall} />
    <Demo id="steps/error" title="步骤运行错误" source={error} />
    <Demo id="steps/progress-dot" title="点状步骤条" source={progressDot} />
    <Demo id="steps/custom-dot" title="自定义点状步骤条" source={customDot} />
    <Demo id="steps/title-placement" title="标题位置" source={titlePlacement} />
    <Demo id="steps/clickable" title="可点击" source={clickable} />
    <Demo id="steps/progress" title="带有进度的步骤" source={progress} />
    <Demo id="steps/variant" title="变体" source={variant} />
    <Demo id="steps/initial" title="起始序号" source={initial} />
    <Demo id="steps/style-class" title="语义化 classNames / styles" source={styleClass} />
    <Demo id="steps/headless-wizard" title="Headless 向导" source={headlessWizard} />
    <Section id="api" title="StepsProps API"><ApiTable rows={api} /></Section>
    <Section id="item-api" title="StepItem"><ApiTable rows={itemApi} /></Section>
    <Section id="contracts" title="状态与边界">
      <p>点击规则：只有设置了 onChange 时步骤才可点击；disabled 的步骤与当前步骤点击不回调。组件不限制跳转方向，任意未禁用的步骤都可以直接到达（与 antd 一致）；需要“不能跳过未完成步骤”的向导，用 createSteps 的 navigateTo / canGoTo 自行把关（见 Headless 向导示例）。</p>
      <p>initial 语义：initial 改变显示编号的起点，current 与 onChange 的参数都以 initial 为基准。initial=3、点击第一项时 onChange(3)。</p>
      <p>percent：只作用于状态为 process 的当前步骤，在图标外叠加一个 Progress 圆环（默认 40px、small 32px，线宽 4，不显示文字）；点状模式与其他状态不显示。</p>
      <p>content 与 description 同义，同时设置时 content 优先。orientation 优先于 direction，titlePlacement 优先于 labelPlacement；竖直方向忽略 titlePlacement。progressDot 为真时等价 type="dot"，此时标题固定在点的下方居中。</p>
    </Section>
    <Section id="keyboard" title="键盘与可访问性">
      <p>可点击的步骤项整体为 role="button"、tabindex=0，可以用 Tab 聚焦，Enter / 空格触发 onChange。不可点击时不带 role 与 tabindex，不进入 Tab 序列。当前步骤带 aria-current="step"，禁用步骤带 aria-disabled="true"。图标中的对勾 / 叉号与连接线为 aria-hidden。</p>
    </Section>
    <Section id="headless" title="Headless API">
      <p>createSteps(config) 由 upthrust-competence 提供：受控或非受控的 current、按项推导状态 getStepStatus / isFinish / isProcess / isError、带前跳守卫的 canGoTo / navigateTo / next / prev（只能回退或前进一步），不带守卫的 goTo、reset，以及混合当前步骤 percent 的整体进度 percentOf。clickNavigable: false 关闭守卫。Steps 组件内部使用 clickNavigable: false，点击自由跳转。</p>
    </Section>
    <Section id="limits" title="暂不支持">
      <p>type="navigation" / "inline" / "panel" 三种类型；responsive 窄屏自动切换竖直；ellipsis 标题省略；ConfigProvider 的 steps 全局配置；RTL 方向。</p>
    </Section>
  </>
}
