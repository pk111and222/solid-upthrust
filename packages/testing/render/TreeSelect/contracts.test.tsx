import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import TreeSelect from '../../../components/lib/TreeSelect'
import Form, { FormItem } from '../../../components/lib/Form'
import type { FormInstance } from '../../../competence/src/form'
import { mount } from '../../utils/mount'

const nodes = [
  { value: 'parent', label: '父节点', children: [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }] },
]
let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })
const key = (el: HTMLElement, name: string) => { el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true })); flush() }

// 单选点击树节点应提交一次并关闭浮层。
it('[tree-select.single.pointer] row click selects and closes', () => {
  const change = vi.fn()
  const view = mount(() => <TreeSelect treeData={nodes} defaultOpen defaultExpandAll virtual={false} onChange={change} />); dispose = view.dispose
  const row = document.querySelector<HTMLElement>('[role="treeitem"][aria-label="乙"]')!
  row.querySelector<HTMLElement>('div')?.click(); flush()
  expect(change).toHaveBeenCalledWith('b', nodes[0].children[1])
  expect(view.host.querySelector('[role="combobox"]')?.getAttribute('aria-expanded')).toBe('false')
})

// 默认展开必须同时驱动浮层、ARIA 与初始树节点。
it('[tree-select.open.default] defaultOpen mounts the tree', () => {
  const view = mount(() => <TreeSelect treeData={nodes} defaultOpen virtual={false} />); dispose = view.dispose
  const box = view.host.querySelector('[role="combobox"]')!
  expect(box.getAttribute('aria-expanded')).toBe('true')
  expect(document.querySelector('[role="tree"]')).not.toBeNull()
})

// 搜索输入的方向键和 Enter 应提交当前树节点，不能只关闭浮层。
it('[tree-select.search.keyboard] search input commits active row', () => {
  const change = vi.fn()
  const view = mount(() => <TreeSelect treeData={nodes} showSearch defaultOpen defaultExpandAll virtual={false} onChange={change} />); dispose = view.dispose
  const input = view.host.querySelector('input')!
  key(input, 'ArrowDown'); key(input, 'Enter')
  expect(change).toHaveBeenCalledWith('a', nodes[0].children[0])
  expect(view.host.querySelector('[role="combobox"]')?.textContent).toContain('甲')
})

// Form.Item 字段选择与重置都要同步 UI；受控清空为 undefined 时也应去掉旧标签。
it('[tree-select.form.field] writes field and resets controlled value', () => {
  let form: FormInstance | undefined
  const select = vi.fn()
  const view = mount(() => <Form ref={instance => { form = instance }} initialValues={{ place: 'a' }}>
    <FormItem name="place"><TreeSelect treeData={nodes} defaultOpen defaultExpandAll virtual={false} onSelect={select} /></FormItem>
  </Form>); dispose = view.dispose
  const box = view.host.querySelector('[role="combobox"]')!
  expect(box.textContent).toContain('甲')
  const row = [...document.querySelectorAll<HTMLElement>('[role="treeitem"]')].find(el => el.getAttribute('aria-label') === '乙')!
  row.querySelector<HTMLElement>('div')?.click(); flush()
  expect(select).toHaveBeenCalledWith('b', nodes[0].children[1])
  expect(form?.getFieldValue('place')).toBe('b')
  expect(box.textContent).toContain('乙')
  form?.setFieldValue('place', undefined); flush()
  expect(box.textContent).not.toContain('乙')
  form?.resetFields(); flush()
  expect(box.textContent).toContain('甲')
})

// 表单内的复选节点点击也必须穿过 Portal 写回字段。
it('[tree-select.form.check] checkbox updates multiple field', () => {
  let form: FormInstance | undefined
  const view = mount(() => <Form ref={instance => { form = instance }} initialValues={{ places: [] }}>
    <FormItem name="places"><TreeSelect treeData={nodes} mode="multiple" defaultOpen virtual={false} /></FormItem>
  </Form>); dispose = view.dispose
  const row = document.querySelector<HTMLElement>('[role="treeitem"][aria-label="父节点"]')!
  const checkbox = row.querySelector<HTMLElement>('div > span:nth-child(2)')!
  checkbox.click(); flush()
  expect(form?.getFieldValue('places')).toEqual(['parent'])
  expect(row.getAttribute('aria-checked')).toBe('true')
})

// 非复选多选点击树行应产生标签，再点同一行应取消。
it('[tree-select.multiple.rows] row selection works without checkboxes', () => {
  const view = mount(() => <TreeSelect treeData={nodes} mode="multiple" treeCheckable={false} defaultOpen virtual={false} />); dispose = view.dispose
  const box = view.host.querySelector('[role="combobox"]')!
  const row = document.querySelector<HTMLElement>('[role="treeitem"][aria-label="父节点"]')!
  expect(row.getAttribute('aria-checked')).toBeNull()
  row.querySelector<HTMLElement>('div')?.click(); flush()
  expect(box.textContent).toContain('父节点')
  row.querySelector<HTMLElement>('div')?.click(); flush()
  expect(box.textContent).not.toContain('父节点')
})

// In checkbox mode both the row body and checkbox toggle the same node once.
it('[tree-select.multiple.check-row] row body toggles checkbox selection', () => {
  const changed = vi.fn()
  const view = mount(() => <TreeSelect treeData={nodes} mode="multiple" defaultOpen defaultExpandAll virtual={false} onChange={changed} />); dispose = view.dispose
  const row = document.querySelector<HTMLElement>('[role="treeitem"][aria-label="甲"]')!
  const body = row.querySelector<HTMLElement>('div')!
  body.click(); flush()
  expect(row.getAttribute('aria-checked')).toBe('true')
  expect(changed).toHaveBeenLastCalledWith(['a'], [nodes[0].children[0]])
  body.click(); flush()
  expect(row.getAttribute('aria-checked')).toBe('false')
  expect(changed).toHaveBeenLastCalledWith([], [])
})

// 显式受控 open 应只发请求；禁用时不能展开浮层。
it('[tree-select.open.controlled] external open and disabled state win', () => {
  const [open, setOpen] = createSignal(false, { ownedWrite: true })
  const [disabled, setDisabled] = createSignal(false, { ownedWrite: true })
  const changed = vi.fn()
  const view = mount(() => <TreeSelect treeData={nodes} open={open()} disabled={disabled()} onOpenChange={changed} />); dispose = view.dispose
  const box = view.host.querySelector<HTMLElement>('[role="combobox"]')!
  box.click(); flush()
  expect(changed).toHaveBeenCalledExactlyOnceWith(true)
  expect(box.getAttribute('aria-expanded')).toBe('false')
  setOpen(true); flush()
  expect(box.getAttribute('aria-expanded')).toBe('true')
  setDisabled(true); flush()
  expect(box.getAttribute('aria-expanded')).toBe('false')
})

// 清空与标签移除应支持按钮 click，且不能让选择器意外展开。
it('[tree-select.tags.actions] clear and remove are accessible buttons', () => {
  const changed = vi.fn(), cleared = vi.fn(), deselected = vi.fn()
  const view = mount(() => <TreeSelect treeData={nodes} mode="multiple" treeCheckable={false}
    allowClear defaultValue={['a', 'b']} maxTagCount={1} onChange={changed} onClear={cleared} onDeselect={deselected} />); dispose = view.dispose
  const box = view.host.querySelector<HTMLElement>('[role="combobox"]')!
  expect(box.textContent).toContain('+1')
  const remove = box.querySelector<HTMLButtonElement>('button[aria-label="移除 甲"]')!
  remove.click(); flush()
  expect(changed).toHaveBeenLastCalledWith(['b'], [nodes[0].children[1]])
  expect(deselected).toHaveBeenCalledWith('a', nodes[0].children[0])
  expect(box.getAttribute('aria-expanded')).toBe('false')
  box.querySelector<HTMLButtonElement>('button[aria-label="清空"]')!.click(); flush()
  expect(changed).toHaveBeenLastCalledWith([], [])
  expect(cleared).toHaveBeenCalledOnce()
  expect(box.getAttribute('aria-expanded')).toBe('false')
})

// Clear is opt-in like Select and its native pointer handler never opens the dropdown.
it('[tree-select.clear.opt-in] allowClear gates the accessible clear button', async () => {
  const cleared = vi.fn()
  const view = mount(() => <TreeSelect treeData={nodes} defaultValue="a" allowClear onClear={cleared} />); dispose = view.dispose
  const box = view.host.querySelector<HTMLElement>('[role="combobox"]')!
  const clear = box.querySelector<HTMLButtonElement>('button[aria-label="清空"]')!
  clear.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }))
  clear.click(); flush()
  expect(cleared).toHaveBeenCalledOnce()
  expect(box.getAttribute('aria-expanded')).toBe('false')
  expect(box.querySelector('.i-mdi-chevron-down')).toBeNull()
  await vi.waitFor(() => expect(box.querySelector('.i-mdi-chevron-down')).not.toBeNull())
  const noClear = mount(() => <TreeSelect treeData={nodes} defaultValue="a" />)
  expect(noClear.host.querySelector('button[aria-label="清空"]')).toBeNull()
  noClear.dispose()
})

// TreeSelect 选中后清除按钮替代箭头；虚拟列表只保留自身的滚动视口。
it('[tree-select.clear.virtual-scroll] clear replaces arrow and virtual list owns scrolling', () => {
  const view = mount(() => <TreeSelect treeData={nodes} defaultOpen defaultValue="a" allowClear />); dispose = view.dispose
  const box = view.host.querySelector<HTMLElement>('[role="combobox"]')!
  expect(box.querySelector('button[aria-label="清空"]')).not.toBeNull()
  expect(box.querySelector('.i-mdi-chevron-down')).toBeNull()
  expect(document.querySelectorAll('[data-virtual-list="true"]')).toHaveLength(1)
  const popup = document.querySelector('[style*="max-content"]')!
  expect(popup.querySelectorAll('.overflow-y-auto')).toHaveLength(0)
  expect(popup.querySelectorAll('[style*="overflow-y"]')).toHaveLength(1)
})

// TreeSelect 虚拟面板的宽度以输入框为最小值，树内容可决定最终宽度。
it('[tree-select.popup.content-width] popup uses content width with selector minimum', () => {
  const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return this.getAttribute('role') === 'combobox'
      ? new DOMRect(0, 0, 240, 32)
      : new DOMRect(0, 0, 0, 0)
  })
  try {
    const view = mount(() => <TreeSelect treeData={nodes} defaultOpen />); dispose = view.dispose
    const popup = document.querySelector<HTMLElement>('[tabindex="-1"][style*="min-width"]')!
    expect(popup.style.width).toBe('max-content')
    expect(popup.style.minWidth).toBe('240px')
  } finally { measure.mockRestore() }
})

// 显式设置选择器宽度时，TreeSelect 弹层严格沿用该宽度。
it('[tree-select.popup.explicit-width] explicit selector width overrides content sizing', () => {
  const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return this.getAttribute('role') === 'combobox' ? new DOMRect(0, 0, 180, 32) : new DOMRect(0, 0, 0, 0)
  })
  try {
    const view = mount(() => <TreeSelect treeData={nodes} defaultOpen style={{ width: '180px' }} />); dispose = view.dispose
    const popup = document.querySelector<HTMLElement>('[tabindex="-1"][style*="width"]')!
    expect(popup.style.width).toBe('180px')
    expect(popup.style.minWidth).toBe('')
  } finally { measure.mockRestore() }
})

// Dropdown presentation props are forwarded to the shared tree renderer.
it('[tree-select.tree.appearance] forwards lines and custom icons', () => {
  const view = mount(() => <TreeSelect treeData={nodes} defaultOpen defaultExpandAll virtual={false} treeLine treeIcon indent={30}
    icon={node => <span data-custom-node-icon={node.value}>★</span>} titleRender={node => <strong>{node.label}</strong>} />); dispose = view.dispose
  expect(document.querySelector('[data-custom-node-icon="parent"]')?.textContent).toBe('★')
  expect(document.querySelector('[role="treeitem"][aria-label="父节点"] strong')?.textContent).toBe('父节点')
  expect(document.querySelector('[role="group"]')?.getAttribute('style')).toContain('15px')
  expect(document.querySelector('[role="group"]')?.className).toContain('border-l')
})

// 搜索只保留匹配路径；空结果与展示属性仍呈现在真实 DOM。
it('[tree-select.search.presentation] filter, empty and visual props', () => {
  const search = vi.fn()
  const view = mount(() => <TreeSelect treeData={nodes} showSearch defaultOpen defaultExpandAll virtual={false}
    onSearch={search} notFoundContent="无匹配" size="small" status="error" id="place" class="custom-tree-select" style={{ width: '240px' }} />); dispose = view.dispose
  const box = view.host.querySelector<HTMLElement>('[role="combobox"]')!
  expect(box.id).toBe('place')
  expect(box.className).toContain('h-control-sm')
  expect(box.getAttribute('aria-invalid')).toBe('true')
  expect(box.getAttribute('aria-controls')).toBe(document.querySelector('[role="tree"]')?.id)
  expect((view.host.querySelector('.custom-tree-select') as HTMLElement).style.width).toBe('240px')
  const input = view.host.querySelector<HTMLInputElement>('input')!
  input.value = '乙'; input.dispatchEvent(new InputEvent('input', { bubbles: true })); flush()
  expect(search).toHaveBeenLastCalledWith('乙')
  expect(document.querySelector('[role="treeitem"][aria-label="乙"]')).not.toBeNull()
  expect(document.querySelector('[role="treeitem"][aria-label="甲"]')).toBeNull()
  input.value = '没有'; input.dispatchEvent(new InputEvent('input', { bubbles: true })); flush()
  expect(document.body.textContent).toContain('无匹配')
  expect(box.getAttribute('aria-controls')).toBeNull()
})
