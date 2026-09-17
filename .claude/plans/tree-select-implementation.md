# TreeSelect + Tree 实现计划

## 目标

全量实现树选择：一个共享 headless 核心 + 两个 UI 组件（独立 `Tree` 展示组件 + `TreeSelect` 选择器），antd 语义，含测试与 example 页。

## 架构（遵循 packages 分层）

```
packages/competence/src/tree.ts        ← 新 headless：createTree + createTreeSelect
packages/components/lib/Tree/           ← Tree 展示组件（index.tsx + styles.ts）
packages/components/lib/TreeSelect/    ← TreeSelect 选择器（index.tsx + styles.ts）
example/src/pages/Tree.tsx, TreeSelect.tsx
```

### 共享底座决策

- **不直接复用 createSelection**：antd 的勾选联动语义（SHOW_PARENT 折叠）和 value 形态（"checked key 集合"）与 createSelection 的 maxSelect/replace 语义不匹配。但**沿用它的 controlled-mirror 模式**（内部 signal 为真相 + effect 同步受控值——见 selection.ts:300 的注释）和 `replaceAll` 单次原子写的教训（Solid 2 batch 内逐 key select 会互相覆盖）。
- **createTrigger 照旧由 UI 层持有**（Select/Cascader 同款）。
- 节点类型 `TreeSelectNode = { value, label, disabled?, selectable?, children? }`（antd fieldNames 用 value/label 别名实现，本轮不做 fieldNames 重映射）。

## headless: createTree（tree.ts 第一段）

antd Tree 的状态核心，Tree 与 TreeSelect 共用：

- **treeData 索引**：`nodeIndex` memo（value → { node, parent, children, level, path }），参考 cascader.ts:141 的深度优先索引。
- **expandedKeys**：受控或内部 signal；`defaultExpandAll` 派生初始全展开（叶子父节点集合）。
- **checkable 级联**（严格 antd）：
  - 内部存储 `checkedKeys`（受控或 signal）。
  - 勾选父节点 = 勾选全部**可勾选**子节点（disabled 子节点保持原状态——antd 行为）；取消同理。
  - `halfCheckedKeys` 派生：部分子节点勾选的父节点。
  - 批量写走单次 emit（防 Solid 2 batch 覆盖）。
- **selectedKeys**：行选中（单选语义，click 高亮），`selectable: false` 的节点不可选中。
- **搜索**：`searchValue` + 匹配节点集合；**展开派生**：搜索时自动展开命中节点的祖先链（antd 行为），`filteredNodes` 返回保持树形但只含命中路径的结构。
- API：`expandedKeys/expand/collapse/toggleExpand/isExpanded/checkedKeys/halfCheckedKeys/check/uncheck/toggleCheck/checkState(key)（'checked'|'indeterminate'|'unchecked'）/selectedKeys/select/isSelected/isDisabled/hasChildren/getNode/searchValue/setSearchValue/searching/matchTree/clear`。

## headless: createTreeSelect（tree.ts 第二段，组合 createTree）

- 值模型：single → key | undefined；multiple → key[]。
- **checkable + SHOW_PARENT 默认策略**：`value` 只含"完全勾选的最高节点"——父勾选即代表全部子级；`checkStrictly`（不联动，父子独立，显示 checkbox 且 value 含全部勾选 key）作为可选开关。
- 搜索复用 createTree 的 searchValue；下拉打开时重置。
- onSelect/onDeselect/onChange/onClear/onSearch 回调（antd 签名，nodes 一并上报）。
- **maxTagCount 为纯 UI 层关注**（headless 不存）。

## UI: Tree 组件（packages/components/lib/Tree/）

- 递归 `TreeNodeRender`（Solid 自引用组件，参考 Menu 的 MenuItemRender 模式）。
- 展开动画：`grid-rows-[0fr/1fr]` 方案（Collapse 已验证的 grid-template-rows 动画，比 Menu 的 max-h 更可靠——Menu 的 max-h-96 会截断深树）。
- 缩进：`padding-left: level * 24px` 内联（非 UnoCSS 任意值，深度是动态值）。
- switcher：`i-mdi-chevron-right` + rotate-90（Collapse 同款）；叶子节点占位保持对齐。
- checkable：复用 Cascader 的 checkbox 视觉族（14px 方框 + check/minus mark，styles.ts 里拷贝一份 tree 前缀版）。
- props：treeData、checkable、selectable、defaultExpandAll、expandedKeys/selectedKeys/checkedKeys（受控）、onExpand/onSelect/onCheck、showLine（可选导向线）。
- **不做**：拖拽、虚拟滚动（用户已确认）、右键菜单。

## UI: TreeSelect 组件（packages/components/lib/TreeSelect/）

- 选择器框：完整复用 Select 的 selector 视觉族（selector/tag/clear/arrow class 从 Select/styles.ts 拷贝 tree 前缀版——或直接 import Select 的样式函数？**决策：拷贝**，包间可维护性同 Cascader 做法）。
- 单选：点击节点即选中+关闭；显示 label。
- multiple：tags 列表 + maxTagCount 折叠（参考 Cascader 的 displayedTags/omittedCount 模式）。
- checkable：multiple + checkbox 联动（SHOW_PARENT）。
- 下拉面板：内嵌 Tree 组件（open 状态由 trigger 驱动传入 Tree 的 expandedKeys 受控不受控内聚）。
- 搜索：选择器内联搜索输入（Select 模式）+ Tree 的搜索态。
- Form.Item 集成：useFormItem + onChange 路由（Cascader 模式：form.onChange 在 machine onChange 里调用）。

## 测试（vitest，参考 cascader.test.ts 结构）

`packages/competence/src/tree.test.ts`：
- 索引/path 派生
- expand/toggleExpand 受控与默认
- checkable 级联：父勾→全子勾、半选派生、disabled 子节点豁免、取消
- SHOW_PARENT：value 折叠（父完整勾选时 value 只含父）
- checkStrictly 独立勾选
- selectedKeys 单选、selectable:false
- 搜索：匹配、祖先自动展开、清空恢复
- TreeSelect：single/multiple 值形态、onChange 签名、clear、labelInValue 不做（保持轻量）

## 导出注册

- competence/src/index.ts：`export * from './tree'`
- components/lib/index.ts：Tree、TreeSelect + 类型
- example/src/router.ts：两页注册到「数据录入」（Tree 放「数据展示」更贴 antd 分类——**决策：Tree → 数据展示，TreeSelect → 数据录入**）

## 明确不做（本轮）

- fieldNames 自定义字段名
- 拖拽、右键
- 虚拟滚动（height 限制 + overflow-auto 即可）
- treeCheckStrictly 之外的 SHOW_CHILD 策略（SHOW_PARENT 是 antd 默认且够用）

## 验证

1. `npx vitest run packages/competence/src/tree.test.ts` 全绿
2. `npx tsc --noEmit` 三包通过
3. `pnpm --dir packages/competence run build && pnpm --dir packages/components run build`
4. example 页面在 dev server 手工过一遍（交给用户验证）

## 预估文件

| 文件 | 预估行数 |
|---|---|
| competence/src/tree.ts | ~420 |
| competence/src/tree.test.ts | ~350 |
| components/lib/Tree/index.tsx | ~260 |
| components/lib/Tree/styles.ts | ~180 |
| components/lib/TreeSelect/index.tsx | ~380 |
| components/lib/TreeSelect/styles.ts | ~200（大半是 selector 族拷贝） |
| example 两页 | ~200 |
