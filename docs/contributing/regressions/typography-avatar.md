# C09 Typography / Avatar

状态：已验收（2026-09-26；下述支持范围与 Chromium 环境）。范围仅 Typography 四个子组件、Avatar / AvatarGroup 及必要依赖路径。

## 契约与修复

对照当日 [Ant Design Typography](https://ant.design/components/typography-cn/) 和 [Avatar](https://ant.design/components/avatar-cn/) 页面（页面版本 6.6.5）组织示例、API 和差异说明；不宣称全 API 兼容。

- Typography：主题字号不再被默认 twMerge 当成颜色吞掉；Title/Link 保留语义色；对象形式的单行省略生效，行内元素具备裁剪盒；动作与文本分开，省略不遮住编辑/复制按钮，编辑框不裁剪。
- Link：disabled 去掉 href、设置 aria-disabled/tabindex；新窗口提供默认安全 rel，显式 rel 优先；补齐继承的复制/编辑/多行省略，动作按钮位于 anchor 外，避免嵌套可交互元素。
- 编辑：受控初始 draft，保存/取消防止同一编辑会话重复提交，键盘保存/取消恢复图标焦点，输入法和 Shift+Enter 保留编辑；受控 editing 由父层关闭，失焦保存亦调用 onEnd。
- 复制：同步锁防止同一轮连续调用重复启动；卸载后异步获取的文案不写剪贴板；重试清除旧成功反馈，onCopy 内同步销毁也不会泄漏计时器；已启动写入完成后不再通知已销毁组件；清理反馈计时器。
- Avatar：class 生效；图片失败后 src/srcSet 更新重试，错误回调更新资源不会污染新资源；回退顺序图片→图标→字符；保留 JSX，Unicode 码点截断、maxCount=0 有效。
- 尺寸逻辑归 competence/avatar.ts；固定尺寸无 resize 监听，响应式启停与卸载清理；独立头像及固定尺寸组中的响应式成员不再被默认 context 的假视口覆盖。
- AvatarGroup：浏览器复现打开浮层后降低 maxCount 触发 DOM insertBefore 错误；隐藏列表增加稳定成员包装，降低/恢复数量及移除浮层均通过（render/Avatar 的 group.move 用例）。class、maxStyle 生效，组默认值允许成员覆盖；maxPopoverTrigger 复用已回归 Popover，隐藏成员可实际访问。
- **行为变化**：AvatarGroup.maxCount 表示可见头像数，+N 另计；旧实现预留一位给 +N。断点改为 sm=576/md=768/lg=992/xl=1200/xxl=1600，稀疏对象不再自动混入未配置档位。命名尺寸仍为 large=64/middle=40/small=28。
- 保留差异：Typography 仅 CSS 省略，无展开/后缀/中间省略、HTML clipboard、autoSize 等；Avatar 按末尾字符缩写，无自动缩字/gap、crossOrigin/draggable、新版 max 对象或 Avatar.Group 静态属性。文档不提供这些未实现能力的假演示。

## 能力映射

源码：`packages/components/lib/{Typography,Avatar}/{index.tsx,styles.ts}`；逻辑：`packages/competence/src/{typography,avatar}.ts`；公开入口 `packages/components/lib/index.ts`（本轮没有改 UI barrel）。

| 能力 ID / 覆盖 | example / docs 示例 | L1 | L2 | L3 | L4 |
| --- | --- | --- | --- | --- | --- |
| typography.type / decoration / title.level / attributes：所有类型、七装饰、五级标题、class/style/children | Typography.tsx；typography/basic,title,text,paragraph | 纯展示无状态，L3/L4 覆盖 | smoke/Typography/exports | render/Typography/contracts | browser/Typography/contracts：paint |
| typography.ellipsis：布尔/对象单行、多行、动态清除、动作组合 | typography/ellipsis | CSS 无独立状态 | 同上 | contracts：ellipsis | ellipsis / dev |
| typography.edit：非受控、受控、maxLength=0、禁用、开始/保存/取消、重复事件、IME/换行/失焦、焦点 | typography/editable,controlled | headless/Typography/state：edit、disabled | 同上 | editing、Typography 原有两用例 | edit / controlled / ellipsis |
| typography.copy：默认/指定/异步/空文案、防重、成功/错误、卸载/计时器、fallback | typography/copyable,link | state：copy | 同上 | editing：fallback；Typography：嵌套纯文本 | copy |
| typography.link：href/target/rel、禁用、语义色、动作分离 | typography/link | 无独立导航状态 | 同上 | contracts：link | link |
| avatar.size：三档/数值/非法回退、六断点边界/稀疏、动态启停/清理 | Avatar.tsx；avatar/basic,responsive | headless/Avatar/size | smoke/Avatar/exports | render/Avatar/contracts：responsive、dispose、defaults | browser/Avatar/contracts：paint、responsive、dev |
| avatar.image / children：src/srcSet/alt、错误回调、false、资源更新、回调竞态、icon/JSX/Unicode/maxCount | avatar/types,recovery,characters | 纯 UI 回退由 L3 验证 | 同上 | contracts：image、children | image / characters |
| avatar.group：继承/覆盖、class/style/maxStyle、计数边界、动态成员、重叠、三种 trigger | avatar/group,overflow | 无额外组状态，复用 Popover | 同上 | contracts：group | group / overflow |
| avatar.badge：仅组合路径，不验收 Badge 全物料 | avatar/badge | 不重复 Badge 逻辑 | 同上 | 不重复已有 Badge 契约 | characters |
| SSR 页面和独立子组件 API | general/typography；data-display/avatar；各 Demo 同文件 ?raw | 不改路由逻辑 | — | 不改站点挂载逻辑 | 两物料 ssr 用例 |

完整测试路径以 `packages/testing/<层>/<Material>/` 为前缀；`.test.ts(x)` / `.spec.ts` 后缀省略。所有本轮用例附中文说明，未复制全套属性笛卡尔积。

## 验证记录

环境：Node 22.22.0，pnpm 11.16.0，solid-js / @solidjs/web 2.0.0-rc.0（锁文件与安装版本未升级）。当前工作区已有大量 C07/C08 等修改，均保留。

日志目录：`output/c09-typography-avatar/`。

| 命令 / 证据 | 结果 |
| --- | --- |
| 原有 Typography 基线 | 1 文件 2 条通过（baseline.log） |
| 修复前新增 DOM 缺陷用例 | 11 条失败，原有 2 条通过（repro.log） |
| `pnpm --dir packages/testing run test headless/Typography headless/Avatar render/Typography render/Avatar smoke/Typography smoke/Avatar` | 8 文件 83 条通过（target.log） |
| `pnpm run typecheck` / `pnpm run typecheck:docs` / `pnpm --dir packages/testing run typecheck:browser` | 最终源码、示例和浏览器用例均通过 |
| `pnpm run build` | 已通过；保留 example 超 500kB chunk 提示 |
| `pnpm run build:docs` | 已通过，45 个静态页面，base=/ |
| `pnpm --dir packages/testing exec playwright test --config playwright.typography-avatar.config.ts` | 28 条通过，docs 16 + example 12；其中开发绘制 2 条、目标原始 SSR 2 条（browser.log） |
| `pnpm test --maxWorkers=2` | 228 文件、2486 条通过（full.log），无跳过 |
| 收尾 Typography 行内宽度补修后的定向复核 | headless/Typography + render/Typography 41 条通过；同一 Playwright 配置 `--grep typography` 14 条通过（typography-target.log、browser-typography-final.log）；类型、生产和 docs 构建再通过。Avatar 与其依赖未再改动，复用已通过证据，未重复全库测试 |
| `git diff --check` | 已通过 |

补验截图已实际查看：`output/playwright/c09/typography-ellipsis.png`，包含单行/多行、省略后编辑、固定 180px 的 Text/Link 操作组合。Avatar 溢出截图也已查看；专项输出目录随后被 Typography 定向运行替换，不把已删除截图列为持久证据。17 个独立 docs 示例与 example 复用同一实现。

开发浏览器日志仍有此前 Popover/Trigger 已记录的 `STRICT_READ_UNTRACKED` 警告，本轮三种触发、动态迁移、收起及卸载均通过；完整 B01/B04 警告清理仍按原台账执行。Typography 新增的初始草稿快照用 `untrack` 明确表达一次性读取，定向开发验收无该警告。

## 范围边界

- 只验收当前工作区源码和 Chromium；跨浏览器、npm 全新消费者、正式发布与完整 B01/B04 仍留原台账。
- docs 未部署；本轮只新增组件页面/导航项，无路由、base、SSR/CSR 框架变更，按台账 1.4 使用目标页面 SSR/开发/生产用例，不重复全站双 base 套件。
- 未提交、推送或发布。类型声明由构建产生，没有手改 dist/types。
