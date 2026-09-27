import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import basic from '../../../examples/tag/basic.tsx?raw'
import colorful from '../../../examples/tag/colorful.tsx?raw'
import control from '../../../examples/tag/control.tsx?raw'
import checkable from '../../../examples/tag/checkable.tsx?raw'
import icon from '../../../examples/tag/icon.tsx?raw'
import status from '../../../examples/tag/status.tsx?raw'
import customize from '../../../examples/tag/customize.tsx?raw'
import disabled from '../../../examples/tag/disabled.tsx?raw'
import semantic from '../../../examples/tag/semantic.tsx?raw'
import tagApi from './tag-tag-api.json'
import checkableApi from './tag-checkable-api.json'
import groupApi from './tag-group-api.json'

export const meta: PageMeta = { title: 'Tag 标签', description: '进行标记和分类的小标签，支持可选标签与标签组。', group: '组件', order: 164 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>用于标记事物的属性和维度，或进行分类。CheckableTag 与 CheckableTagGroup 既是具名导出，也挂在 Tag 静态属性上。</p><CodeBlock code={"import { Tag, CheckableTag, CheckableTagGroup } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="tag/basic" title="基本" description="基本标签、链接子元素、可关闭（onClose 中 preventDefault 阻止关闭）、自定义关闭图标与 href 标签。" source={basic} />
      <Demo id="tag/colorful" title="多彩标签" description="13 个预设色板与任意自定义颜色，均支持 filled / solid / outlined 三种变体。" source={colorful} />
      <Demo id="tag/control" title="动态添加和删除" description="用数组生成标签；首个标签不可删除，双击编辑，过长文字截断并用 Tooltip 展示全文。" source={control} />
      <Demo id="tag/checkable" title="可选择标签" description="CheckableTag 实现类似 Checkbox 的效果；CheckableTagGroup 支持单选（可取消为 null）与多选。" source={checkable} />
      <Demo id="tag/icon" title="图标按钮" description="icon 与文字之间保持 7px；可选标签同样支持图标。" source={icon} />
      <Demo id="tag/status" title="预设状态的标签" description="success / processing / warning / error / default 五种状态，三种变体。" source={status} />
      <Demo id="tag/customize" title="自定义关闭按钮" description="closeIcon 可以是文字或图标；closeLabel 或 closable 对象的 aria-label 提供无障碍名称。" source={customize} />
      <Demo id="tag/disabled" title="禁用标签" description="禁用后不应用颜色、不可关闭或切换，href 被移除。" source={disabled} />
      <Demo id="tag/semantic" title="自定义语义结构的样式和类" description="通过 classNames / styles 定制 root、icon、content、close 以及标签组的 root、item。" source={semantic} />
    </DemoGrid></Section>
    <Section id="tag-api" title="Tag API"><ApiTable rows={tagApi} /></Section>
    <Section id="checkable-api" title="CheckableTag API"><p>与 antd 一致使用 role="checkbox"：点击或 Space 切换（按住重复不切换），Enter 不切换。</p><ApiTable rows={checkableApi} /></Section>
    <Section id="group-api" title="CheckableTagGroup API"><ApiTable rows={groupApi} /></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/tag-cn/">Ant Design Tag 6.6.5</a> 的基本、多彩、动态增删、可选、图标、状态、自定义关闭、禁用与语义化示例。默认变体为 filled（无描边）；bordered 已废弃且不再产生描边，描边请用 variant="outlined"。预设色板取 antd 色板第 1/3/6/7 级；processing / error 与默认色跟随主题 token。</p><p>与 antd 的差异：关闭按钮使用原生 button（天然支持 Tab / Enter / Space）；CheckableTag 额外支持非受控 defaultChecked；classNames / styles 不支持函数形式；未接入 ConfigProvider 的组件禁用与全局配置；不提供添加动画与拖拽排序示例（antd 依赖第三方动画/拖拽库）；RTL 未处理。</p></Section>
  </>
}
