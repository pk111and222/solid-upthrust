# 类型检查门禁修复（2026-09-16）

状态：已修复；根级类型检查从 95 条诊断归零。未修改 strict、include/exclude、依赖版本，未删除测试或用 any/忽略指令屏蔽错误。

## 契约与修改

| 能力 ID | 根因与修复 | 源码 / 示例 | 验证 |
| --- | --- | --- | --- |
| form.types.defaults | Form/Field/List 可省略配置错误声明成必填 getter；改成可选只读属性，仍接受 getter | packages/competence/src/form.ts、formField.ts、formList.ts | headless/Form/types.test.ts；原有 Form 用例 |
| form.types.watch | NamePath 的默认 any 吞掉选择器参数类型；watch 通知实际传路径列表；setFields 支持单段字符串路径 | packages/competence/src/formUtils.ts、form.ts | 同上，精确断言嵌套路径及批量 reset 通知 |
| form.types.validator | 聚合校验 promise 的元素实际为 RuleError，声明多套一层数组；callback 校验器缺第三参数声明 | packages/competence/src/formValidate.ts、formField.ts | headless/Form/validate.test.ts、types.test.ts；异步测试释放函数使用属性避免闭包控制流错误收窄 |
| button.ref.optional | Solid 2 signal 保存尚未挂载/已经卸载的 DOM，类型必须包含 undefined | packages/competence/src/button.ts | 现有 Button 用例；根级类型检查 |
| image-group.sources.optional | 缺失 src 的成员仍占据预览组索引，不应过滤；sources 返回类型包含 undefined | packages/competence/src/imageGroup.ts | headless/Image/preview-group.test.ts 新增精确索引用例 |
| selection.readonly、select.label | readonly 只支持 boolean，删除不可达函数分支；Select 去除随后被 spread 重复覆盖的同名属性 | packages/competence/src/selection.ts、select.ts | 现有共享数值和 Select 用例 |
| preset.color.invalid | Material 色板可能返回 null；显式报无效颜色错误，不静默生成空主题 | packages/preset/src/theme/colors/material.ts | headless/preset/material.test.ts；既有 preset 用例 |
| preset.types.output | 已安装 vite-plugin-dts 5 的声明目录参数为 outDirs | packages/preset/vite.config.ts | 生产构建及声明生成 |
| drawer.example.close | 示例使用不存在的 onOk；统一沿用真实 onClose API，void 回调不返回 signal setter 的 boolean | example/src/pages/Drawer.tsx | browser/Drawer/example.spec.ts，确定/取消都关闭受控抽屉 |
| empty.example.image | JSX.Element 需要组件实例，而非 Component 函数 | example/src/pages/Empty.tsx | browser/Empty/example.spec.ts，简洁 SVG 和添加数据切换 |
| example.render.entry | Solid 2 的 DOM 入口为 @solidjs/web | example/src/index.tsx | example 构建及上述浏览器测试 |
| testing.platform.types | matchMedia mock 缺完整 DOM 协议；List 泛型被局部回调参数错误缩窄 | packages/testing/utils/matchMedia.ts；headless/Layout、Masonry、List | 完整 EventTarget/MediaQueryListEvent 及原用例，不降低生产 API 类型要求 |

以上测试路径相对 `packages/testing/`。新增用例均有中文备注；测试辅助逻辑不互相导入测试文件。原始 95 条诊断是少量根因的连锁结果，并非 95 个独立运行时缺陷。

## 验证记录

- `pnpm run typecheck`：通过，0 条错误（修改前 95 条）。生产构建后再次检查仍通过。
- `pnpm --dir packages/testing run typecheck`：通过。
- `pnpm --dir packages/testing run typecheck:browser`：通过。
- `pnpm test`：86 个文件、1056 条通过。
- `pnpm run build`：通过，包括三个生产包、声明和 example；仍有 example 大 chunk 提示。
- `pnpm run check:docs`：通过，10 个文档静态页面。
- Drawer/Empty 浏览器回归：2 条全部通过。见 `playwright.typecheck.config.ts`，使用构建后的 example 产物。
- `git diff --check`：通过。

复跑浏览器：先 `pnpm run build`，再执行 `pnpm --dir packages/testing exec playwright test --config playwright.typecheck.config.ts`。本机用 `DOCS_CHROMIUM_PATH` 指向已安装 Chrome。

本次修复恢复类型门禁，不代替后续逐物料的完整功能/API/视觉回归；没有发布或部署。
