import type { PageMeta } from '../../../routing'
import { Demo, DemoGrid, Section, CodeBlock, ApiTable } from '../../../components/Content'
import api from './skeleton-api.json'
import buttonApi from './skeleton-button-api.json'
import avatarApi from './skeleton-avatar-api.json'
import inputApi from './skeleton-input-api.json'
import nodeApi from './skeleton-node-api.json'
import basicSource from '../../../examples/skeleton/basic.tsx?raw'
import compositionSource from '../../../examples/skeleton/composition.tsx?raw'
import widthSource from '../../../examples/skeleton/width.tsx?raw'
import avatarSource from '../../../examples/skeleton/avatar.tsx?raw'
import activeSource from '../../../examples/skeleton/active.tsx?raw'
import loadingSource from '../../../examples/skeleton/loading.tsx?raw'
import buttonSource from '../../../examples/skeleton/button.tsx?raw'
import avatar_partSource from '../../../examples/skeleton/avatar-part.tsx?raw'
import inputSource from '../../../examples/skeleton/input.tsx?raw'
import nodeSource from '../../../examples/skeleton/node.tsx?raw'
import styleSource from '../../../examples/skeleton/style.tsx?raw'
import themeSource from '../../../examples/skeleton/theme.tsx?raw'
export const meta: PageMeta = {
  title: 'Skeleton 骨架屏', description: '为首次加载的内容提供结构占位。', group: '组件', order: 180,
}
export default function Page() {
  return <>
    <Section id="usage" title="使用方式">
      <p>适用于内容结构已知的首次加载。主组件组合标题、段落和头像；四个子组件可单独组成列表、表单或图表占位。它们都是公开组件。</p>
      <CodeBlock code={"import { Skeleton, SkeletonButton, SkeletonAvatar, SkeletonInput, SkeletonNode } from 'upthrust-ui'"} />
    </Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="skeleton/basic" title="基本使用" description="默认展示一个标题和三行段落，loading 默认 true。" source={basicSource} />
      <Demo id="skeleton/composition" title="标题与段落" description="title 和 paragraph 独立开关，零行保留标题。" source={compositionSource} />
      <Demo id="skeleton/width" title="行数与宽度" description="数字为像素；字符串为 CSS 长度。数组缺项使用全宽。" source={widthSource} />
      <Demo id="skeleton/avatar" title="头像组合" description="头像支持数字或 CSS 长度，以及圆形、方形。" source={avatarSource} />
      <Demo id="skeleton/active" title="动画与圆角" description="active 开启渐变动画；round 控制标题和段落圆角。" source={activeSource} />
      <Demo id="skeleton/loading" title="切换真实内容" description="loading=false 直接渲染 children；业务容器提供加载状态。" source={loadingSource} />
      <Demo id="skeleton/style" title="自定义样式" description="class/style 仅影响主组件的占位容器。" source={styleSource} />
      <Demo id="skeleton/theme" title="主题与动画" description="静态色块和动画都使用 outlineVariant；遵循减少动态效果偏好。" source={themeSource} />
    </DemoGrid></Section>
    <Section id="api" title="Skeleton API"><ApiTable rows={api} /></Section>
    <Section id="parts-api" title="独立子组件">
      <p>下面四个组件可独立使用，也可通过具名导入使用。它们始终显示占位，不接收 loading；需要切换真实内容时，由外层条件渲染控制。</p>
    </Section>
    <Section id="skeleton-button" title="Skeleton.Button 按钮占位">
      <p>用于按钮位置的占位，默认 80×32px。它是装饰元素，不是真实按钮，不能点击或提交表单。</p>
      <p>size 决定高度：small 为 24px，middle 为 32px，large 为 40px，数字为像素。默认和 round 形状的宽度为高度的 2.5 倍；circle 宽高相同。block 优先将宽度设为 100%，此时不保证圆形。</p>
      <CodeBlock code={"import { SkeletonButton } from 'upthrust-ui'\n// 等价于 Skeleton.Button"} />
      <Demo id="skeleton/button" title="按钮占位" description="三种形状与尺寸，block 优先占满容器。占位本身不能点击。" source={buttonSource} />
      <h3 class="mt-8 mb-4 text-lg font-semibold">Skeleton.Button API</h3>
      <ApiTable rows={buttonApi} />
    </Section>
    <Section id="skeleton-avatar" title="Skeleton.Avatar 头像占位">
      <p>用于独立头像位置的占位，默认 32×32px、圆形。shape="square" 可切换为方形。</p>
      <p>size 同时决定宽高：small 为 24px，middle 为 32px，large 为 40px，数字为像素。这里不接受 CSS 长度字符串；需要 3rem 等尺寸时使用 style。主组件的 avatar.size 则可以直接接受 CSS 字符串。</p>
      <CodeBlock code={"import { SkeletonAvatar } from 'upthrust-ui'\n// 等价于 Skeleton.Avatar"} />
      <Demo id="skeleton/avatar-part" title="独立头像" description="预设尺寸为 24、32、40px，也可用数字指定像素值。" source={avatar_partSource} />
      <h3 class="mt-8 mb-4 text-lg font-semibold">Skeleton.Avatar API</h3>
      <ApiTable rows={avatarApi} />
    </Section>
    <Section id="skeleton-input" title="Skeleton.Input 输入框占位">
      <p>用于输入框位置的占位，默认 160×32px。它不是真实输入框，不接受输入，也不提供 value 或 onChange。</p>
      <p>size 只决定高度：small 为 24px，middle 为 32px，large 为 40px，数字为像素。宽度默认保持 160px；block 设为 100%，需要其他宽度时使用 style。</p>
      <CodeBlock code={"import { SkeletonInput } from 'upthrust-ui'\n// 等价于 Skeleton.Input"} />
      <Demo id="skeleton/input" title="输入框占位" description="默认宽度为 160px，block 时为容器宽度。" source={inputSource} />
      <h3 class="mt-8 mb-4 text-lg font-semibold">Skeleton.Input API</h3>
      <ApiTable rows={inputApi} />
    </Section>
    <Section id="skeleton-node" title="Skeleton.Node 自定义占位">
      <p>用于图片、图表等自定义内容的占位，默认 100×100px。children 可放图标或其他装饰内容。</p>
      <p>不传 size 时为 100px；显式 small/middle/large 分别为 24/32/40px，数字为像素，均同时设置宽高。使用 style 可设置矩形尺寸。整个节点带 aria-hidden，不要在 children 中放按钮、链接或其他可聚焦控件。</p>
      <CodeBlock code={"import { SkeletonNode } from 'upthrust-ui'\n// 等价于 Skeleton.Node"} />
      <Demo id="skeleton/node" title="自定义占位" description="Node 默认 100×100px；children 只放装饰内容，不放交互控件。" source={nodeSource} />
      <h3 class="mt-8 mb-4 text-lg font-semibold">Skeleton.Node API</h3>
      <ApiTable rows={nodeApi} />
    </Section>
    <Section id="contracts" title="行为与边界">
      <p>loading 默认 true；false 时直接输出 children，不保留占位容器。主组件 class/style 只控制加载分支。切换加载会替换当前显示的 DOM；需要跨加载阶段保留的业务状态应放在 Skeleton 外部。</p>
      <p>默认标题与三行段落均为全宽，不自动缩短最后一行。paragraph.width 为单值时应用到所有行；数组按下标匹配，缺项全宽，多余项忽略。rows 向下取整，负数、NaN、Infinity 归零。</p>
      <p>主组件头像默认 32px、圆形，avatar.size 支持数字像素或 CSS 长度字符串。独立子组件的尺寸规则见各自章节。</p>
      <p>四个子组件只显示占位，不提供 loading、disabled 或点击行为。Node.children 只能放装饰内容，不能放可聚焦控件。所有占位设置 aria-hidden；业务区域请自行设置 aria-busy 或状态说明，参考切换真实内容示例。</p>
      <p>active 默认 false，开启后使用主题 outlineVariant 的渐变；系统开启减少动态效果时停止动画。Skeleton 不读取 ConfigProvider 的 componentSize/componentDisabled/components 默认值，只继承主题 CSS 变量；不承诺与其他库 API 完全一致。</p>
      <p>ref 返回 SkeletonIns，只有 loading() getter，没有主动切换或 DOM 操作方法。</p>
    </Section>
  </>
}
