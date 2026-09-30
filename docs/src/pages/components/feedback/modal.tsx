import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import basic from '../../../examples/modal/basic.tsx?raw'
import asyncDemo from '../../../examples/modal/async.tsx?raw'
import footer from '../../../examples/modal/footer.tsx?raw'
import footerRender from '../../../examples/modal/footer-render.tsx?raw'
import loading from '../../../examples/modal/loading.tsx?raw'
import mask from '../../../examples/modal/mask.tsx?raw'
import position from '../../../examples/modal/position.tsx?raw'
import buttonProps from '../../../examples/modal/button-props.tsx?raw'
import modalRender from '../../../examples/modal/modal-render.tsx?raw'
import width from '../../../examples/modal/width.tsx?raw'
import staticDemo from '../../../examples/modal/static.tsx?raw'
import styleClass from '../../../examples/modal/style-class.tsx?raw'
import modalApi from './modal-api.json'
import modalStaticApi from './modal-static-api.json'

export const meta: PageMeta = { title: 'Modal 对话框', description: '模态对话框。', group: '组件', order: 185 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>需要用户处理事务，又不希望跳转页面以致打断工作流程时，可以使用 Modal 在当前页面正中打开一个浮层，承载相应的操作。</p><CodeBlock code={"import { Modal } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="modal/basic" title="基本" description="第一个对话框。" source={basic} />
      <Demo id="modal/async" title="异步关闭" description="onOk 返回 Promise：确定按钮 loading，resolve 后关闭，reject 保持打开。" source={asyncDemo} />
      <Demo id="modal/footer" title="自定义页脚" description="传入 footer 替换默认的取消 / 确定。" source={footer} />
      <Demo id="modal/footer-render" title="自定义页脚渲染函数" description="footer 为函数时拿到默认节点与 OkBtn / CancelBtn。" source={footerRender} />
      <Demo id="modal/loading" title="加载中" description="loading 显示骨架屏并隐藏页脚。" source={loading} />
      <Demo id="modal/mask" title="遮罩" description="mask 对象：enabled / blur / closable。" source={mask} />
      <Demo id="modal/position" title="自定义位置" description="style.top 调整位置，centered 垂直居中。" source={position} />
      <Demo id="modal/button-props" title="自定义页脚按钮属性" description="okButtonProps / cancelButtonProps。" source={buttonProps} />
      <Demo id="modal/modal-render" title="自定义渲染对话框" description="modalRender 包裹容器，实现拖拽。" source={modalRender} />
      <Demo id="modal/width" title="自定义宽度" description="width 数字、字符串或断点对象。" source={width} />
      <Demo id="modal/static" title="静态方法" description="Modal.info / success / error / warning / confirm，返回 update / destroy。" source={staticDemo} />
      <Demo id="modal/style-class" title="自定义语义结构的样式和类" description="classNames / styles 对象或函数。" source={styleClass} />
    </DemoGrid></Section>
    <Section id="modal-api" title="Modal API"><ApiTable rows={modalApi} /></Section>
    <Section id="modal-static-api" title="Modal.method()"><ApiTable rows={modalStaticApi} /></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/modal-cn/">Ant Design Modal</a> 的公开示例与 antd 6 源码：容器 20px 24px、标题 16px / 600、关闭按钮 32px 距角 12px、页脚上间距 12px、缩放 + 淡入 0.3s 与 antd 一致。Modal 与 Drawer 共用 headless <code>createDialog</code> 与同一弹层栈：Escape 只关闭最上层，焦点锁定在最上层，滚动锁计数嵌套。</p><p>与 antd 的差异：未实现 useModal / contextHolder（静态方法直接挂载到 body，不继承 ConfigProvider 上下文）、mousePosition 缩放原点、RTL；wireframe 主题与 component token 示例未移植。</p></Section>
  </>
}
