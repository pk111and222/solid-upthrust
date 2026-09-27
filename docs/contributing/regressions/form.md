# Form 回归（C07）

状态：本轮验收通过（2026-09-24 收尾）。范围为当前源码工作区、本机 Chromium、docs 静态站和 example 构建；不代表 Firefox/WebKit、打包消费者或线上部署验收。

## 对标范围

本轮按 Ant Design 6 Form 文档的示例矩阵扩展 Form 单物料回归，覆盖 27 个 docs Demo：基本使用、布局、复杂控件、禁用、反馈状态、同步/异步校验、监听、校验时机、validateOnly、normalize、自定义文案、条件字段、动态列表、嵌套列表、移动排序、复杂列表、自定义列表、preserve、字段变更事件、自定义物料、嵌套表单、登录、注册、高级搜索、日期时间、上传和实例方法。

## 公开契约

- Form 创建或接收 `createForm()` 实例；Form.Item 使用 NamePath 注册字段，第一方控件从 FormItemContext 获取 value、onChange、id、disabled、size 和校验状态。
- 支持 `initialValues`、Item `initialValue`、`preserve`、`clearOnDestroy`、布局/尺寸/禁用、requiredMark、colon、labelWrap、tooltip、help、extra、hasFeedback 和显式校验状态。
- 支持 required、type、min/max、pattern、enum、warningOnly、validator、validateFirst、validateDebounce、dependencies、normalize、getValueFromEvent、validateOnly 和 dirty 校验选项。
- 支持 `Form.List` 增删、批量删除、移动、稳定 key、嵌套列表和列表行内相对依赖；删除/移动后会按稳定 key 重新解析字段路径。
- 支持 `getFieldValue`、`getFieldsValue`、`getFieldsError`、`setFieldValue`、`setFieldsValue`、`setFields`、`resetFields`、`validateFields`、`submit` 和 `watch`。
- `onChange` 以字段值为主，不复制 React 子节点；自定义控件使用 render props 或 FormItemContext 协议。

## 文件与覆盖映射

| 能力 ID | 源码与公开类型 | example 演示 | docs 页面 / 示例 | L1 | L2 | L3 | L4 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `form.field.value-reset` | `packages/competence/src/form.ts`、`formField.ts`；`packages/components/lib/Form/Item.tsx`、`Input/context.ts`、`Input/index.tsx` | `example/src/pages/Form.tsx` 基础表单 | `docs/src/examples/form/basic.tsx` | `headless/Form/field.test.ts` | `smoke/Form/exports.test.tsx` | `render/Form/contracts.test.tsx` | `browser/Form/interactions.spec.ts` basic |
| `form.validation.rules` | `packages/competence/src/formValidate.ts`、`formField.ts` | 基础表单、异步邀请码 | `validation.tsx`、`trigger.tsx`、`validate-only.tsx`、`messages.tsx` | `headless/Form/validate.test.ts` | `smoke/Form/exports.test.tsx` | `render/Form/contracts.test.tsx` | `browser/Form/interactions.spec.ts` validation |
| `form.dependencies.watch` | `packages/competence/src/form.ts`、`formField.ts` | Form 页面依赖/监听区 | `watch.tsx`、`conditional.tsx`、`register.tsx` | `headless/Form/field.test.ts` | `smoke/Form/exports.test.tsx` | `render/Form/contracts.test.tsx` | docs browser custom/nested |
| `form.list.dynamic` | `packages/competence/src/formList.ts`、`form.ts`；`Form/List.tsx`、`Form/Item.tsx` | Form 页面列表区 | `list.tsx`、`list-nested.tsx`、`list-move.tsx`、`list-complex.tsx`、`custom-list.tsx` | `headless/Form/list.test.ts` | `smoke/Form/exports.test.tsx` | `render/Form/contracts.test.tsx` | `browser/Form/interactions.spec.ts` list |
| `form.custom-nested` | `Form/context.ts`、`Form/Item.tsx`、`Form/List.tsx` | Form 页面 headless/custom 区 | `custom.tsx`、`nested.tsx`、`controls.tsx` | `headless/Form/field.test.ts` | `smoke/Form/exports.test.tsx` | `render/Form/contracts.test.tsx` | `browser/Form/interactions.spec.ts` custom/nested |
| `form.layout-feedback` | `Form/index.tsx`、`Form/Item.tsx`、`Form/styles.ts` | Form 页面布局/反馈区 | `layout.tsx`、`disabled.tsx`、`feedback.tsx`、`search.tsx` | `headless/Form/form.test.ts` | `smoke/Form/exports.test.tsx` | `render/Form/contracts.test.tsx` | `browser/Form/interactions.spec.ts` layout |

## 实现与修复证据

1. Form.List 增加稳定 row descriptor/key，删除和移动后重新解析路径，补齐嵌套列表和自定义列表场景。
2. Form.Item 接入 dependencies，并在列表行内追加当前行前缀；异步校验、warningOnly、validateDebounce 和旧结果淘汰沿用 headless 校验引擎。
3. Form 接入 `clearOnDestroy`、原生 submit/reset、Form 实例 ref 和 reset 广播；Button `htmlType="reset"` 能调用 Form 实例重置。
4. 修复受控 Input 在字段 reset 为 `undefined` 时回退内部旧值的问题：Form.Item 上下文中的 Input 空值现在写为受控空字符串，真实浏览器重置后 DOM 与 store 一致。
5. docs 从 5 个示例扩展到 27 个独立 Demo，静态 HTML 同时保留正文、API 表和所有示例源码；每个 Demo 实际挂载状态为 `ready`。

## 验证记录

| 命令 | 结果 | 未通过 / 未运行原因 |
| --- | --- | --- |
| `pnpm --dir packages/testing exec vitest run headless/Form render/Form smoke/Form --reporter=dot` | 9 个文件、107 条通过 | 无 |
| `pnpm run typecheck` | 通过 | 无 |
| `pnpm run typecheck:docs` | 通过 | 无 |
| `pnpm --dir packages/testing run typecheck:browser` | 通过 | 无 |
| `pnpm run build:docs` | 36 个文档页面预渲染通过 | Vite 仅报告 example 既有大 chunk 警告 |
| `pnpm --dir example run build` | 通过 | Vite 仅报告既有大 chunk 警告 |
| `pnpm --dir packages/testing exec playwright test --config playwright.form.config.ts --reporter=line` | 14 条计划、10 条通过、4 条按项目条件跳过；docs/example 双项目均通过各自适用用例 | 跳过项由测试明确限制项目（docs-only/example-only），不是失败 |
| 静态页 Demo 挂载检查 | 27/27 `data-demo-state=ready` | 无 |

## 未决项

- 当前 L4 仅验证 Chromium；未宣称 Firefox/WebKit 和真实生产部署通过。
- 尚未实现或不承诺 Ant Design 6 的 `Form.Provider`、`Form.ErrorList`、静态 `Form.useForm`/`Form.useFormInstance`/`Form.useWatch`、`scrollToFirstError`、`validateFieldsAndScroll` 和 message API；页面差异与 FAQ 已说明替代方式。
- 不修改 dist 生成物；组件包构建产物由现有 build 流程生成。

## Docs 展示与交互补修（2026-09-24）

状态：本次 Form/Input 展示与交互专项通过；全库仍有下述 3 条独立箭头用例失败，不能把此次结果称为全量验收通过。保留接手时尚未提交的 Form 回归成果。

### 缺陷与改动

- **连续输入失焦**：开发模式连续键入 `abcdef` 只能保留 `a`，焦点回到 BODY。Form.Item 将 Solid 的零参数 JSX accessor 当作带参 render props，订阅字段值后重建 Input。现在只调用带参数的 renderer，并只读取一次 children。自定义编辑示例使用稳定的组合组件和上下文，不用随值重建的 render props。
- **反馈图标**：从 Form 的绝对定位改为 Input 后缀中的独立槽，与清除、计数一起居中排列；其他控件使用旁侧反馈位置。示例补齐 error/warning/success/validating 四态。
- **布局、标签**：inline 现在真正横向排列并可换行；水平标签列遵循左右对齐。三个布局分别展示多个字段和操作区。同名字段使用实例唯一 ID，避免同页多个 Demo 的 label 串联。
- **列表**：嵌套联系人提供新增/删除用户、新增/删除电话、空状态和提交；复杂列表使用区块和采购明细两层结构，提供增删、校验、重置和结果。移动列表的行号随索引更新，保留节点身份。手机将窄列分行，避免输入框被挤窄。
- **按钮和结果区**：并列按钮通过 Flex/Space 或 flex gap 排列，不给 Button 增加隐式外边距；统一结果区间距和换行。修复前序 Form 接入时 Button props 展开造成的 loading/disabled 响应式丢失，以及重复重置。
- **额外发现**：`component="div"` 正确生成 div；外部 Form 实例接收 UI 初始值和提交回调，显式 setCallbacks 不再被初始化 config 覆盖。嵌套表单使用实例提交；注册确认密码校验成功时结束 callback；自定义校验文案补齐 label 变量，warningOnly 增加实际可操作示例。

### 能力映射

| 能力 ID | 实现与示例 | 验证 |
| --- | --- | --- |
| `form.render.accessor` / `form.browser.typing` | Form/Item.tsx；basic/custom/list 示例；example Form 基础区 | L3 零参数 accessor、节点身份与焦点；L4 开发和生产逐字输入 7 个 Demo |
| `form.render.feedback` / `form.browser.feedback-affixes` | Form/Item.tsx、styles.ts、Input/context.ts、index.tsx；feedback 示例、example 密码区 | L3 单反馈槽；L4 四态几何、计数、清除、焦点 |
| `form.render.unique-id` / `form.browser.layouts` | Form/Item.tsx、Form/styles.ts；layout/search 示例、example inline 区 | L3 ID 关联；L4 标签点击焦点、三种布局和按钮间距 |
| `form.render.list-labels` / `form.browser.nested-list` / `form.browser.complex-list` | formList.ts；list-nested/list-complex/list-move/custom-list | L3 移动节点与行号；L4 两层增删、删除父项后编辑/提交、空态恢复、重置、手机宽度 |
| `form.render.container` / `form.render.reset-once` / `form.render.external-props` | Form/index.tsx、Button/index.tsx、form.ts；nested/custom/register | L3 容器、重置次数、外部回调；L4 嵌套提交、自定义回填、注册成功 |

新增 DOM 契约集中于 `render/Form/contracts.test.tsx`；真实展示契约在 `browser/Form/presentation.spec.ts`，更新现有 `interactions.spec.ts`。沿用 L1/L2 既有 Form 用例，不为纯展示重复构造 headless/smoke 测试。Select 的 ID 断言同步为唯一 ID 格式，不弱化标签关联契约。

### 实际验证

本机 Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0，未升级依赖。日志和已查看的截图在 `output/playwright/form-fix/`。

| 命令/检查 | 结果 |
| --- | --- |
| Form + Input + Select + Button 定向 Vitest（`headless/Form render/Form smoke/Form render/Input render/Select render/Button --maxWorkers=2`） | 17 文件、212 条通过 |
| 根类型、docs 类型、browser 类型 | 通过 |
| `pnpm run build:docs` / `pnpm run build` | 通过；36 页 SSR，example 仍有原有大 chunk 提示 |
| Form Playwright（`--config playwright.form.config.ts --workers=2`） | 19 条通过、4 条既有项目条件跳过（example 不重复 docs-only 用例） |
| 手机布局调整后定向 Playwright | 3 条通过（手机可用宽度、两级联系人、复杂采购单），见 `mobile-final.log` |
| 全量 Vitest（`--maxWorkers=2`） | 194 文件，1628 条通过、3 条失败 |
| `git diff --check` | 通过 |

全量失败明确为 `headless/Tooltip/tooltip.test.ts` 的 arrow-enabled、`render/Tooltip/content.test.tsx` 与 `render/Popover/content.test.tsx` 的 arrow。单独重跑这三个文件，29 条通过、同样 3 条失败；对应 Tooltip/Popover/Trigger 实现未在本次修改。此处记录为其他物料/共享浮层待处理问题，不删测试、不改断言掩盖失败。（2026-09-26 已修复：根因是共享 Trigger 零尺寸守卫与 happy-dom 零矩形，用例补几何桩后通过，详见 [flex.md](flex.md) 全量失败修复。）开发模式仍有已有 STRICT_READ_UNTRACKED 警告。

本次未改变路由、base 或站点框架，因此未重跑双 base 通用套件；未部署线上，未验证 Firefox/WebKit。

### 电话 / 明细删除操作对齐补验（2026-09-26）

用户指出删除电话、删除明细按钮低于输入框。浏览器断言复现三种动态行（联系人、采购明细、键值）的按钮均偏低 16px：自定义 `mb-md` 与示例 `mb-0` 同时保留，按钮又按字段包含外边距的底部对齐。仅调整三个 docs 示例的紧凑字段为 `!mb-0`，电话按钮桌面使用 `sm:self-start`，手机仍独立右对齐；不改变全局 Form.Item 间距。

- 新增/补充 L4 实际 bounding box 对齐断言，修复前电话、明细、键值三项均失败（16px 偏移）。
- 修复后 `nested-list|complex-list|custom-list-alignment|mobile` 4 条通过；docs/browser 类型检查、docs 静态构建、`git diff --check` 通过。
- 已查看多条电话和两条明细截图：`output/playwright/form-fix/phone-aligned.png`、`details-aligned.png`。此次为示例布局修正，沿用之前的生产组件测试结果。

### 错误提示展开后的明细对齐（2026-09-26）

前次只覆盖正常字段状态，遗漏用户截图中的必填校验错误。新增桌面/手机测试执行新增空明细 → 提交报错 → 填入有效值 → 错误消失 → 删除；旧布局在桌面报错后数量框相对物品输入框下移 23.98px。

复杂列表与键值行改为顶部对齐，操作区也使用无 name 的 FormItem 和不可见标签占位，复用同样的标签/控件高度，不再以包含校验提示的整行底部定位按钮。错误提示只扩展自己的字段高度。此次仅改 docs 示例。

- 错误前后对齐、复杂列表交互、键值行、手机宽度共 5 条浏览器用例通过。
- docs/browser 类型、docs 静态构建、`git diff --check` 通过。
- 已实际查看错误状态截图 `output/playwright/form-fix/details-validation-aligned.png`，物品输入、数量和删除按钮保持同一水平线。
