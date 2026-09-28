import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { buildMenuNodes, createMenu, getMenuKeyOffset, type MenuConfig } from '../../../competence/src/menu'

const items = [
  { key: 'a', label: 'A' },
  { key: 'sub1', label: 'Sub1', children: [
    { type: 'group' as const, label: 'G', children: [{ key: 'b', label: 'B' }] },
    { key: 'sub2', label: 'Sub2', children: [{ key: 'c', label: 'C' }] },
  ] },
  { type: 'divider' as const },
  { key: 'd', label: 'D', disabled: true },
]

let dispose = () => {}
afterEach(() => dispose())
const setup = (config: Partial<MenuConfig> = {}) => createRoot(d => { dispose = d; return createMenu({ items, ...config }) })

// 路径注册：分组不进入路径，无 key 的分组 / 分割线得到稳定位置 key。
it('[menu.headless.paths] groups are skipped in key paths', () => {
  const nodes = buildMenuNodes(items)
  expect(nodes.map(n => n.key)).toEqual(['a', 'sub1', 'menu-divider-2', 'd'])
  const menu = setup()
  expect(menu.pathOf('b')).toEqual(['sub1', 'b'])
  expect(menu.pathOf('c')).toEqual(['sub1', 'sub2', 'c'])
  expect([...menu.subPathKeys('sub1')].sort()).toEqual(['b', 'c', 'sub2'])
})

// 点击：onClick 先于 onSelect，keyPath 叶子在前，itemData 与 item 同一对象；禁用项不响应。
it('[menu.headless.click] click order, keyPath and itemData', () => {
  const calls: string[] = []
  const onClick = vi.fn((_info: unknown) => { calls.push('click') })
  const onSelect = vi.fn(() => calls.push('select'))
  const menu = setup({ onClick, onSelect })
  menu.click('c'); flush()
  expect(calls).toEqual(['click', 'select'])
  const info = onClick.mock.calls[0]![0] as any
  expect(info.keyPath).toEqual(['c', 'sub2', 'sub1'])
  expect(info.itemData).toBe(info.item)
  expect(menu.selectedKeys()).toEqual(['c'])
  expect(menu.isChildSelected('sub1')).toBe(true)
  menu.click('d'); flush()
  expect(onClick).toHaveBeenCalledTimes(1)
})

// 多选：再次点击取消选中并触发 onDeselect；单选非 inline 点击关闭全部弹层。
it('[menu.headless.multiple] deselect and popup close', () => {
  const onDeselect = vi.fn()
  const onOpenChange = vi.fn()
  const multi = setup({ multiple: true, onDeselect, defaultSelectedKeys: ['a'] })
  multi.click('a'); flush()
  expect(onDeselect).toHaveBeenCalledOnce()
  expect(multi.selectedKeys()).toEqual([])
  dispose()
  const single = setup({ defaultOpenKeys: ['sub1'], onOpenChange })
  single.click('a'); flush()
  expect(onOpenChange).toHaveBeenLastCalledWith([])
})

// 展开：非 inline 关闭父级连带关闭下级；同批次连续操作读取同步镜像不丢写。
it('[menu.headless.open] cascade close and batched writes', () => {
  const menu = setup()
  menu.openChange('sub1', true)
  menu.openChange('sub2', true)
  flush()
  expect(menu.openKeys()).toEqual(['sub1', 'sub2'])
  menu.openChange('sub1', false); flush()
  expect(menu.openKeys()).toEqual([])
})

// 收起：inline + inlineCollapsed 派生为 vertical；收起清空展开项，回到 inline 恢复缓存。
it('[menu.headless.collapse] derived mode and inline cache', () => {
  const [collapsed, setCollapsed] = createSignal(false, { ownedWrite: true })
  const onOpenChange = vi.fn()
  // getter 不能经对象展开传入（展开会求值一次，丢失响应性）。
  const menu = createRoot(d => { dispose = d; return createMenu({ items, mode: 'inline', defaultOpenKeys: ['sub1'], get inlineCollapsed() { return collapsed() }, onOpenChange }) })
  flush()
  expect(menu.mode()).toBe('inline')
  setCollapsed(true); flush()
  expect(menu.mode()).toBe('vertical')
  expect(menu.inlineCollapsed()).toBe(true)
  expect(menu.openKeys()).toEqual([])
  expect(onOpenChange).toHaveBeenLastCalledWith([])
  setCollapsed(false); flush()
  expect(menu.mode()).toBe('inline')
  expect(menu.openKeys()).toEqual(['sub1'])
})

// 键盘偏移表（rc getOffset）：inline Enter 切换、水平一级 ↓ 进入、vertical Esc 回父级。
it('[menu.headless.keyOffset] offset table', () => {
  expect(getMenuKeyOffset('inline', true, 'Enter')).toEqual({ inlineTrigger: true })
  expect(getMenuKeyOffset('horizontal', true, 'ArrowDown')).toEqual({ offset: 1, sibling: false })
  expect(getMenuKeyOffset('horizontal', true, 'ArrowRight')).toEqual({ offset: 1, sibling: true })
  expect(getMenuKeyOffset('vertical', false, 'Escape')).toEqual({ offset: -1, sibling: false })
  expect(getMenuKeyOffset('inline', false, 'ArrowLeft')).toBeNull()
})
