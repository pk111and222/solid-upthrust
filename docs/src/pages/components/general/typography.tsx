import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import demo0 from '../../../examples/typography/basic.tsx?raw'
import demo1 from '../../../examples/typography/title.tsx?raw'
import demo2 from '../../../examples/typography/text.tsx?raw'
import demo3 from '../../../examples/typography/paragraph.tsx?raw'
import demo4 from '../../../examples/typography/link.tsx?raw'
import demo5 from '../../../examples/typography/editable.tsx?raw'
import demo6 from '../../../examples/typography/controlled.tsx?raw'
import demo7 from '../../../examples/typography/copyable.tsx?raw'
import demo8 from '../../../examples/typography/ellipsis.tsx?raw'
import baseApi from './typography-base-api.json'
import copyApi from './typography-copy-api.json'
import editApi from './typography-edit-api.json'
import titleApi from './typography-title-api.json'
import linkApi from './typography-link-api.json'

export const meta: PageMeta = { title: 'Typography 排版', description: '标题、段落、文本和链接，以及复制、编辑和省略。', group: '组件', order: 114 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>用于文章、说明与文本操作。Typography 是 Text、Title、Paragraph、Link 的命名空间对象，不能作为容器组件渲染。</p><CodeBlock code={"import { Typography, Text, Title, Paragraph, Link } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="typography/basic" title="文章排版" description="组合标题、段落与强调文本，建立清晰的信息层级。" source={demo0} />
      <Demo id="typography/title" title="标题组件" description="level 1–5 对应原生 h1–h5。标题也支持语义颜色与文字装饰。" source={demo1} />
      <Demo id="typography/text" title="文本与装饰" description="语义颜色、禁用及七种文字装饰可以组合使用。" source={demo2} />
      <Demo id="typography/paragraph" title="段落组件" description="Paragraph 渲染 div，默认有 1em 底部间距，适合组织长文本。" source={demo3} />
      <Demo id="typography/link" title="超链接组件" description="禁用链接不可跳转；新窗口默认添加安全 rel；复制操作位于链接旁。" source={demo4} />
      <Demo id="typography/editable" title="可编辑" description="点击图标编辑；Enter 保存、Escape 取消、Shift+Enter 换行，失焦也会保存。" source={demo5} />
      <Demo id="typography/controlled" title="受控编辑" description="父层管理 editing 和 text，保存或取消后由父层关闭编辑框。" source={demo6} />
      <Demo id="typography/copyable" title="可复制" description="支持自定义内容、异步内容、图标和提示，失败通过 onError 反馈。" source={demo7} />
      <Demo id="typography/ellipsis" title="省略号" description="明确设置宽度后单行截断；rows 控制多行。编辑/复制按钮保持可见，编辑框不被截断。" source={demo8} />
    </DemoGrid></Section>
    <Section id="text-api" title="Typography.Text API"><ApiTable rows={baseApi} /></Section>
    <Section id="title-api" title="Typography.Title API"><ApiTable rows={titleApi} /></Section>
    <Section id="paragraph-api" title="Typography.Paragraph API"><ApiTable rows={baseApi} /></Section>
    <Section id="link-api" title="Typography.Link API"><ApiTable rows={linkApi} /></Section>
    <Section id="copyable-api" title="copyable 复制配置 API"><ApiTable rows={copyApi} /></Section>
    <Section id="editable-api" title="editable 编辑配置 API"><ApiTable rows={editApi} /></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/typography-cn/">Ant Design Typography 6.6.5</a> 的示例分类。本库的省略仅实现 CSS 单行/多行裁剪，不包含展开收起、中间省略、后缀或测量回调；Text 也允许 rows。暂不支持 actions、语义槽位样式、HTML 剪贴板、自定义复制成功图标、编辑 autoSize 或文字点击触发。</p><p>复制优先使用浏览器 Clipboard API，无该 API 时尝试 execCommand；权限失败会调用 onError。编辑复杂 JSX 后保存为纯文本。非受控编辑结果保留在内部，如需由父层更新请传 editable.text。输入法 Enter 不提交，Shift+Enter 换行，Enter 保存、Escape 取消后恢复图标焦点，失焦保存保留外部焦点。</p></Section>
  </>
}
