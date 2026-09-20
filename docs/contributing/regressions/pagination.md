# Pagination 回归

状态：已验收（2026-09-20，当前源码工作区）。Node 22.22.0、pnpm 11.16.0、solid-js / @solidjs/web 2.0.0-rc.0，未改锁文件。保留接手时 Input 等未提交改动。依赖 Dropdown 沿用已有验收，仅追加本物料集成验证。

## 契约与修复

- 有效页码夹紧到当前总页数，修复 total 缩小后高亮消失及 itemRange 出现反向区间。保留请求页码，total 恢复时可恢复原页；纯 props 更新不发事件。
- 非法页码/容量有确定回退，非整数跳页和非法容量命令不污染状态；非有限 total 按 0 处理。容量选项去重、过滤无效值。
- 分页按钮明确 type=button；跳页 Enter 阻止表单默认提交，拒绝混合文本/小数/负数，忽略组合输入。
- disabled 保留禁用容量按钮；动态禁用销毁已打开菜单，避免残留可交互浮层。
- nav 与跳页输入有名称，页码保留 aria-current，省略号对辅助技术隐藏；按钮补可见键盘焦点。
- current/pageSize 独立受控，默认属性仅用于初始化；容量变化先 onShowSizeChange 后 onChange，同容量不重复通知。无公开子组件、UI ref；headless refs 与切片 API 已记录在公开文档。
- 不宣称兼容某个外部组件库版本。本轮未扩展 simple、responsive、可点击省略号或远程请求能力。

## 能力映射

源码：`packages/competence/src/pagination.ts`、`packages/components/lib/Pagination/{index.tsx,styles.ts}`；现有 UI/competence barrel 类型与命名导出完整，无需改动。

文档：`docs/src/pages/components/navigation/pagination.tsx` 与 `pagination-api.json`；8 个独立 `docs/src/examples/pagination/*.tsx`，文档仅 `?raw` 引入；`example/src/pages/Pagination.tsx` 复用这些真实交互示例。

| 能力 ID / props | 示例 | 验证位置（均在 packages/testing） |
| --- | --- | --- |
| pagination.range / numeric：total、current/defaultCurrent、pageSize/defaultPageSize，页码窗口、prev/next/goTo、slice/refs | basic、dynamic、slice | L1 headless/Pagination/pagination.test.ts（17 条原有契约）、boundaries.test.ts 的 range.dynamic/numeric.boundaries；L4 browser/Pagination/interactions.spec.ts 的 basic/dynamic/slice |
| pagination.controlled.size：两种状态与 onChange/onShowSizeChange、pageSizeOptions | controlled、page-size | L1 boundaries.test.ts 的 controlled.size；L3 render/Pagination/dropdown.test.tsx、contracts.test.tsx 的 props.presentation/options.lifecycle；L4 size |
| pagination.jumper / form：showQuickJumper、输入合法性和表单 | jumper | L3 contracts.test.tsx 的 form.buttons/jumper.validation；L4 form |
| pagination.disabled / props：disabled、hideOnSinglePage、showTotal、size、align、class/style | basic、appearance、disabled、dynamic | L3 contracts.test.tsx 的 disabled.dynamic/props.presentation/options.lifecycle；L4 layout/dynamic/basic/dev |
| pagination.exports.provider：公开类型、ConfigProvider 组件默认值、显式 props 优先、卸载 | 所有示例 | L2 smoke/Pagination/exports.test.tsx；公开 barrel 类型编译检查与生产 example 导入挂载 |

按契约选层，不重复四套矩阵：纯视觉无 L1；L2 只做入口/Provider/卸载；L3 不冒充 CSS/焦点绘制；L4 不重复所有数值边界。组件没有网络、计时器或异步请求，异步竞态不适用；Dropdown 延迟焦点和 portal 清理由集成用例覆盖。ConfigProvider 使用 components.Pagination 默认值，未扩展全局 componentSize/componentDisabled 适用名单。

## 实际验证

| 命令 / 检查 | 结果 |
| --- | --- |
| `pnpm --dir packages/testing run test headless/Pagination render/Pagination` 初始基线 | 2 文件、18 条通过 |
| 同范围失败复现 | 新用例 5 条失败；另补 options.lifecycle 复现打开后禁用不关闭 |
| `pnpm --dir packages/testing run test headless/Pagination render/Pagination smoke/Pagination` | 5 文件、27 条通过 |
| `pnpm test` | 136 文件、1382 条通过（仅收尾执行一次） |
| `pnpm run typecheck` | 通过 |
| `pnpm --dir packages/testing run typecheck:browser` | 通过 |
| `pnpm run build` | preset、competence、components、example 均通过；既有大 chunk 提示仍存在 |
| `pnpm run check:docs` | 类型与静态构建通过，17 页，根路径产物 |
| `DOCS_CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm --dir packages/testing exec playwright test --config playwright.pagination.config.ts` | 13 个场景：首轮 10 通过；3 失败为菜单定位冲突/未等待 160ms 焦点转移；修正为容量菜单定位及焦点条件等待后 `--last-failed` 3/3 通过。最终 docs 7、example 6 场景有通过证据，含开发绘制 |
| `git diff --check` | 通过 |

日志：本机 `/tmp/pagination-regression/` 中 baseline、reproduce、target、full、typecheck、browser-typecheck、build、docs-build、browser、browser-retry 的 `.log`；临时日志非永久归档。截图在 `packages/testing/test-results/pagination/` 的 size 场景输出目录，已实际查看 docs controlled.png：选中第 3 页、20 条/页及焦点环正常，截图捕获了菜单退出淡出过渡。浏览器 runner 已停止自身服务。

## 边界与交接

未改站点路由/base/SSR/公共框架，不重复双 base 通用套件；新页由根路径静态构建和目标页面浏览器验收覆盖。未做跨浏览器、独立安装消费者、完整 SSR、发布或部署验收；这些仍属 A/B/D 阶段。沿用既有开发环境 STRICT_READ_UNTRACKED / 多 Solid 实例提示的 B01 审计边界，不宣称全库框架问题已解决。

只完成 Pagination，不自动开始 Tree。没有共享逻辑修改；Table 等消费者通过全量 L1–L3 与生产构建检查，不代表完整 Table 回归已验收。
