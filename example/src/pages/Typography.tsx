import Demo0 from '../../../docs/src/examples/typography/basic'
import Demo1 from '../../../docs/src/examples/typography/title'
import Demo2 from '../../../docs/src/examples/typography/text'
import Demo3 from '../../../docs/src/examples/typography/paragraph'
import Demo4 from '../../../docs/src/examples/typography/link'
import Demo5 from '../../../docs/src/examples/typography/editable'
import Demo6 from '../../../docs/src/examples/typography/controlled'
import Demo7 from '../../../docs/src/examples/typography/copyable'
import Demo8 from '../../../docs/src/examples/typography/ellipsis'
export default function Page() {
  return <div class="p-6 max-w-5xl"><h2 class="text-2xl font-semibold mb-6">Typography</h2>
    <section data-typography-demo="basic" class="mb-8"><h3 class="text-lg font-semibold mb-3">文章排版</h3><p class="mb-4 text-sm text-on-surface-variant">组合标题、段落与强调文本，建立清晰的信息层级。</p><Demo0 /></section>
    <section data-typography-demo="title" class="mb-8"><h3 class="text-lg font-semibold mb-3">标题组件</h3><p class="mb-4 text-sm text-on-surface-variant">level 1–5 对应原生 h1–h5。标题也支持语义颜色与文字装饰。</p><Demo1 /></section>
    <section data-typography-demo="text" class="mb-8"><h3 class="text-lg font-semibold mb-3">文本与装饰</h3><p class="mb-4 text-sm text-on-surface-variant">语义颜色、禁用及七种文字装饰可以组合使用。</p><Demo2 /></section>
    <section data-typography-demo="paragraph" class="mb-8"><h3 class="text-lg font-semibold mb-3">段落组件</h3><p class="mb-4 text-sm text-on-surface-variant">Paragraph 渲染 div，默认有 1em 底部间距，适合组织长文本。</p><Demo3 /></section>
    <section data-typography-demo="link" class="mb-8"><h3 class="text-lg font-semibold mb-3">超链接组件</h3><p class="mb-4 text-sm text-on-surface-variant">禁用链接不可跳转；新窗口默认添加安全 rel；复制操作位于链接旁。</p><Demo4 /></section>
    <section data-typography-demo="editable" class="mb-8"><h3 class="text-lg font-semibold mb-3">可编辑</h3><p class="mb-4 text-sm text-on-surface-variant">点击图标编辑；Enter 保存、Escape 取消、Shift+Enter 换行，失焦也会保存。</p><Demo5 /></section>
    <section data-typography-demo="controlled" class="mb-8"><h3 class="text-lg font-semibold mb-3">受控编辑</h3><p class="mb-4 text-sm text-on-surface-variant">父层管理 editing 和 text，保存或取消后由父层关闭编辑框。</p><Demo6 /></section>
    <section data-typography-demo="copyable" class="mb-8"><h3 class="text-lg font-semibold mb-3">可复制</h3><p class="mb-4 text-sm text-on-surface-variant">支持自定义内容、异步内容、图标和提示，失败通过 onError 反馈。</p><Demo7 /></section>
    <section data-typography-demo="ellipsis" class="mb-8"><h3 class="text-lg font-semibold mb-3">省略号</h3><p class="mb-4 text-sm text-on-surface-variant">明确设置宽度后单行截断；rows 控制多行。编辑/复制按钮保持可见，编辑框不被截断。</p><Demo8 /></section>
  </div>
}
