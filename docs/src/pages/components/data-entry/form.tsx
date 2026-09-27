import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import formApi from './form-api.json'
import itemApi from './form-item-api.json'
import listApi from './form-list-api.json'
import basic from '../../../examples/form/basic.tsx?raw'
import validation from '../../../examples/form/validation.tsx?raw'
import list from '../../../examples/form/list.tsx?raw'
import custom from '../../../examples/form/custom.tsx?raw'
import nested from '../../../examples/form/nested.tsx?raw'
import layout from '../../../examples/form/layout.tsx?raw'
import controls from '../../../examples/form/controls.tsx?raw'
import disabled from '../../../examples/form/disabled.tsx?raw'
import feedback from '../../../examples/form/feedback.tsx?raw'
import watch from '../../../examples/form/watch.tsx?raw'
import trigger from '../../../examples/form/trigger.tsx?raw'
import validateOnly from '../../../examples/form/validate-only.tsx?raw'
import normalize from '../../../examples/form/normalize.tsx?raw'
import messages from '../../../examples/form/messages.tsx?raw'
import conditional from '../../../examples/form/conditional.tsx?raw'
import listNested from '../../../examples/form/list-nested.tsx?raw'
import listMove from '../../../examples/form/list-move.tsx?raw'
import listComplex from '../../../examples/form/list-complex.tsx?raw'
import preserve from '../../../examples/form/preserve.tsx?raw'
import fields from '../../../examples/form/fields.tsx?raw'
import login from '../../../examples/form/login.tsx?raw'
import register from '../../../examples/form/register.tsx?raw'
import search from '../../../examples/form/search.tsx?raw'
import dateTime from '../../../examples/form/date-time.tsx?raw'
import upload from '../../../examples/form/upload.tsx?raw'
import programmatic from '../../../examples/form/programmatic.tsx?raw'
import customList from '../../../examples/form/custom-list.tsx?raw'

export const meta: PageMeta = { title: 'Form 表单', description: '字段收集、校验、动态列表、依赖和自定义控件。', group: '组件', order: 250 }

export default function FormPage() { return <>
  <Section id="usage" title="使用方式">
    <p>Form 由数据引擎与 UI 协议组成：Form 创建或接收 createForm() 实例，Form.Item 注册 NamePath 字段，首方控件通过 FormItemContext 接收 value、onChange、disabled、size、id 和校验状态。</p>
    <CodeBlock code={'import Form, { FormItem, FormList } from \'upthrust-ui/source/Form\'\nimport Input from \'upthrust-ui/source/Input\'\n\n<Form onFinish={values => console.log(values)}>\n  <FormItem name="username" label="用户名" rules={[{ required: true }]}>\n    <Input />\n  </FormItem>\n</Form>'} />
    <p>显式控件属性优先于 Form.Item 注入；显式 onChange 会接管写入，若仍需字段同步请在回调中调用 useFormItem().onChange。Solid 版本不复制 React 子节点，而是使用上下文协议。</p>
    <p>并列操作按钮使用 Flex gap={8} wrap="wrap" 或 Space 统一留白；Button 自身不设置外边距。带参 render props 适合派生展示，编辑控件建议直接作为子组件，使用 Form.Item 上下文保持节点与焦点稳定。</p>
  </Section>
  <Section id="examples" title="示例"><DemoGrid>
    <Demo id="form/basic" title="基本使用：收集、提交与重置" source={basic}/>
    <Demo id="form/layout" title="表单布局：水平、垂直与内联" source={layout}/>
    <Demo id="form/controls" title="复杂控件：Select、Checkbox、Radio、Switch 与 InputNumber" source={controls}/>
    <Demo id="form/disabled" title="表单禁用" source={disabled}/>
    <Demo id="form/feedback" title="校验状态、反馈图标与辅助信息" source={feedback}/>
    <Demo id="form/validation" title="同步、异步、warningOnly 与失败回调" source={validation}/>
    <Demo id="form/watch" title="字段监听：实时计算派生值" source={watch}/>
    <Demo id="form/trigger" title="校验时机与手动校验" source={trigger}/>
    <Demo id="form/validate-only" title="仅校验：不写入错误状态" source={validateOnly}/>
    <Demo id="form/normalize" title="normalize：提交前转换字段值" source={normalize}/>
    <Demo id="form/messages" title="自定义校验文案" source={messages}/>
    <Demo id="form/conditional" title="条件字段与字段联动" source={conditional}/>
    <Demo id="form/list" title="动态增减表单项" source={list}/>
    <Demo id="form/list-nested" title="动态增减嵌套字段" source={listNested}/>
    <Demo id="form/list-move" title="动态列表排序" source={listMove}/>
    <Demo id="form/list-complex" title="复杂的动态增减表单项" source={listComplex}/>
    <Demo id="form/custom-list" title="自定义列表行与操作" source={customList}/>
    <Demo id="form/preserve" title="preserve：字段卸载后的值处理" source={preserve}/>
    <Demo id="form/fields" title="表单数据变更事件" source={fields}/>
    <Demo id="form/custom" title="自定义物料与实例回填" source={custom}/>
    <Demo id="form/nested" title="嵌套结构与表单套表单" source={nested}/>
    <Demo id="form/login" title="登录框" source={login}/>
    <Demo id="form/register" title="注册新用户与确认密码" source={register}/>
    <Demo id="form/search" title="高级搜索与内联表单" source={search}/>
    <Demo id="form/date-time" title="时间类控件" source={dateTime}/>
    <Demo id="form/upload" title="校验并提交上传控件" source={upload}/>
    <Demo id="form/programmatic" title="表单方法调用" source={programmatic}/>
  </DemoGrid></Section>
  <Section id="validation" title="校验与依赖">
    <p>规则支持 async-validator 的常用类型校验和自定义 validator；validator 可以返回 Promise，也可以使用 callback。validateFirst 为 true 时串行短路，parallel 时第一个失败先返回；较新的校验会淘汰旧结果，避免异步乱序覆盖。</p>
    <p>dependencies 只对已编辑字段触发级联校验；Form.List 内的相对依赖会追加当前列表行路径。validateOnly 只运行规则而不写入错误状态，dirty 只校验已编辑字段。</p>
    <p>当前不支持 antd 的 message API、scrollToFirstError、validateFieldsAndScroll、Form.Provider、Form.useWatch 静态 Hook；对应能力请使用 onFinishFailed、form.watch、原生 focus 或应用层协调。</p>
  </Section>
  <Section id="instance" title="Form 实例">
    <p>通过 ref 读取 getFieldValue/getFieldsValue/getFieldsError，使用 setFieldValue/setFieldsValue/setFields 更新，resetFields 重置，validateFields 校验，submit 执行校验并触发 onFinish。watch(pathOrSelector) 返回 Solid signal，并附带 dispose。</p>
    <p>initialValues 只初始化一次；不要把它当作响应式受控值。需要异步回填或编辑切换时调用 setFieldsValue，切换记录时先 resetFields 再写入新值。</p>
  </Section>
  <Section id="api" title="FormProps API"><ApiTable rows={formApi}/></Section>
  <Section id="item-api" title="FormItemProps API"><ApiTable rows={itemApi}/></Section>
  <Section id="list-api" title="FormListProps API"><ApiTable rows={listApi}/></Section>
  <Section id="accessibility" title="布局、样式与可访问性">
    <p>horizontal 为默认布局，labelWidth、labelAlign、labelWrap 控制标签列；vertical 将标签置于控件上方，inline 适合紧凑查询条件。requiredMark、colon、tooltip、help、extra 和 hasFeedback 都有独立语义，不要只依赖颜色表达错误。</p>
    <p>有 name 的 Item 自动生成稳定 id 并将 label for 指向控件；自定义物料应透传 id、disabled、aria-invalid，并提供可访问名称。当前真实浏览器回归覆盖 Chromium；不据此宣称 Firefox/WebKit 已验证。</p>
  </Section>
  <Section id="differences" title="与 Ant Design 6 的差异">
    <p>本实现参考 Ant Design 6 Form 的字段、规则、列表和实例组织，但不是 API 完全兼容实现。组件使用 Solid 2 的 signal/context 模型，onChange 以 value 为主，子组件不通过 cloneElement 注入；默认校验文案为中文。</p>
    <p>已覆盖：Form.Item、Form.List、嵌套 NamePath、initialValues/initialValue、preserve、动态增删、依赖、异步校验、warningOnly、validateFirst、validateDebounce、normalize、getValueFromEvent、reset/submit 和自定义上下文物料。未实现或尚未承诺的差异以本页限制为准。</p>
  </Section>
  <Section id="recipes" title="常见用法与边缘场景">
    <p><strong>初始值与回填：</strong>initialValues 只在表单实例初始化时读取；编辑页拿到接口数据后使用 setFieldsValue，切换记录时先 resetFields 再写入。字段级 initialValue 适合动态 Item，Form.List 的初始数组优先放在 Form.List 的 initialValue 或 Form 的 initialValues 中。</p>
    <p><strong>动态列表：</strong>Form.List 的 fields.name 是当前索引，fields.key 是稳定渲染键。遍历时使用 keyed，字段使用 [field.name, 'property']；嵌套列表继续把当前行路径传给下一级 Form.List。删除、移动后不要缓存旧索引，依赖当前 field descriptor 解析路径。</p>
    <p><strong>自定义物料：</strong>编辑型控件使用上下文协议或响应式 props；带参 render props 在字段值变化时会重新执行，适合派生展示。第一方物料通过 FormItemContext 接收 value、onChange、id、disabled、size 和校验状态。自定义控件必须透传 id、aria-invalid、disabled，并在 onChange 中把值交给 Form.Item，而不是只修改本地 signal。</p>
    <p><strong>表单套表单：</strong>嵌套的 Form 拥有独立实例和提交边界；内层使用 component="div" 与实例 submit()，内层提交不会触发外层 onFinish。若业务只是分组而不是独立提交，请使用 Form.Item 的无 name 布局区域，避免不必要地创建嵌套原生 form。</p>
    <p><strong>校验边缘：</strong>async validator 应在过期请求完成后忽略旧结果；依赖字段只重新校验已经编辑的字段。validateOnly 适合提交前预检，warningOnly 不阻止提交，validateDebounce 适合远程校验。组件当前不提供 scrollToFirstError，请在 onFinishFailed 中根据 errorFields 自行聚焦。</p>
  </Section>
  <Section id="faq" title="FAQ">
    <p><strong>为什么改变 initialValues 不会更新表单？</strong>这是一次性初始化配置。响应式业务数据应调用 setFieldsValue；不要把 initialValues 当作受控 value。</p>
    <p><strong>为什么 Form.List 行内依赖要写相对路径？</strong>Form.Item 会自动追加当前列表行前缀，因此同一行字段依赖写 ['price']，不要手工拼接数组索引；嵌套列表按当前层级继续使用相对路径。</p>
    <p><strong>为什么自定义控件没有自动写入？</strong>Solid 没有 React 的 cloneElement 注入。使用第一方控件，或通过 useFormItem 协议同步值；如果显式传入 onChange，它会优先于上下文协议。</p>
    <p><strong>何时使用 FormInstance？</strong>用户输入优先由 Form.Item 管理；接口回填、重置、校验、读取快照、跨字段联动和提交按钮放在表单外时，再通过 form/ref 使用命令式 API。</p>
  </Section>
</> }
