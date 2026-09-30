import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import basic from '../../../examples/drawer/basic.tsx?raw'
import placement from '../../../examples/drawer/placement.tsx?raw'
import resizable from '../../../examples/drawer/resizable.tsx?raw'
import loading from '../../../examples/drawer/loading.tsx?raw'
import extra from '../../../examples/drawer/extra.tsx?raw'
import renderInCurrent from '../../../examples/drawer/render-in-current.tsx?raw'
import formDemo from '../../../examples/drawer/form.tsx?raw'
import multiLevel from '../../../examples/drawer/multi-level.tsx?raw'
import size from '../../../examples/drawer/size.tsx?raw'
import mask from '../../../examples/drawer/mask.tsx?raw'
import closablePlacement from '../../../examples/drawer/closable-placement.tsx?raw'
import styleClass from '../../../examples/drawer/style-class.tsx?raw'
import drawerApi from './drawer-api.json'

export const meta: PageMeta = { title: 'Drawer 抽屉', description: '屏幕边缘滑出的浮层面板。', group: '组件', order: 186 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>抽屉从父窗体边缘滑入，覆盖住部分父窗体内容。用户在抽屉内操作时不必离开当前任务，操作完成后可以平滑地回到原任务。</p><CodeBlock code={"import { Drawer } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="drawer/basic" title="基础抽屉" description="基础抽屉，点击触发按钮抽屉从右滑出，点击遮罩区关闭。" source={basic} />
      <Demo id="drawer/placement" title="自定义位置" description="自定义位置，点击触发按钮抽屉从相应的位置滑出。" source={placement} />
      <Demo id="drawer/resizable" title="可调整大小" description="resizable 拖动内沿调整尺寸，maxSize 限制上限。" source={resizable} />
      <Demo id="drawer/loading" title="加载中" description="loading 显示骨架屏。" source={loading} />
      <Demo id="drawer/extra" title="额外操作" description="extra 放在头部右侧，适合放置操作按钮。" source={extra} />
      <Demo id="drawer/render-in-current" title="渲染在当前 DOM" description="getContainer={false} 渲染在当前位置（父元素需定位）。" source={renderInCurrent} />
      <Demo id="drawer/form" title="抽屉表单" description="在抽屉中使用表单。" source={formDemo} />
      <Demo id="drawer/multi-level" title="多层抽屉" description="在抽屉内打开新的抽屉，下层被推开 180px。" source={multiLevel} />
      <Demo id="drawer/size" title="预设宽度" description="size 预设 default（378）/ large（736）或自定义数字。" source={size} />
      <Demo id="drawer/mask" title="遮罩" description="mask 对象：enabled / blur / closable。" source={mask} />
      <Demo id="drawer/closable-placement" title="关闭按钮位置" description="closable.placement 为 end 时关闭按钮在头部最右。" source={closablePlacement} />
      <Demo id="drawer/style-class" title="自定义语义结构的样式和类" description="classNames / styles。" source={styleClass} />
    </DemoGrid></Section>
    <Section id="drawer-api" title="Drawer API"><ApiTable rows={drawerApi} /></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/drawer-cn/">Ant Design Drawer</a> 的公开示例与 antd 6 源码：头部 16px 24px、关闭按钮 24px 位于标题前、主体 24px、页脚 8px 16px、无圆角、滑入 + 0.7→1 淡入 0.3s、拖拽柄 4px、多层 push 180px 与 antd 一致。不再提供默认的确定 / 取消页脚（与 antd 一致），需要时使用 footer 或 extra。</p><p>与 antd 的差异：未实现 RTL、component token 示例；push 只由上层 Drawer 触发（上层 Modal 不推开抽屉，与 antd 相同）。</p></Section>
  </>
}
