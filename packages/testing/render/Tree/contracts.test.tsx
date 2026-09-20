import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Tree, { TreeInPanel } from '../../../components/lib/Tree'
import { createTree } from '../../../competence/src/tree'
import { mount } from '../../utils/mount'
const nodes = [{ value: 'p', label: 'Parent', children: [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta', disabled: true }] }, { value: 'z', label: 'Last' }]
let dispose = () => {}
afterEach(() => { dispose(); flush() })
// 由 checkedKeys 隐式开启复选时，树容器也必须声明多选语义。
it('[tree.check.implicit] exposes checkbox and multiselect semantics', () => {
  const view = mount(() => <Tree treeData={nodes} defaultCheckedKeys={['a']} defaultExpandAll />); dispose = view.dispose
  expect(view.host.querySelector('[role="tree"]')?.getAttribute('aria-multiselectable')).toBe('true')
  expect(view.host.querySelector('[aria-label="Alpha"]')?.getAttribute('aria-checked')).toBe('true')
})
// titleRender 内的输入框处理自己的空格和方向键，不应操作所在树节点。
it('[tree.keyboard.embedded] preserves embedded input keyboard behavior', () => {
  const changed = vi.fn()
  const view = mount(() => <Tree treeData={nodes} onSelect={changed} titleRender={node => <input aria-label={`编辑 ${node.label}`} />} />); dispose = view.dispose
  const input = view.host.querySelector('input')!
  input.focus(); input.click(); flush()
  expect(document.activeElement).toBe(input)
  const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
  input.dispatchEvent(event); flush()
  expect(event.defaultPrevented).toBe(false); expect(changed).not.toHaveBeenCalled()
})
// 受控搜索被父层拒绝时，原生输入值与过滤结果必须保持一致。
it('[tree.search.controlled] restores rejected input and accepts parent updates', () => {
  const [value, setValue] = createSignal('', { ownedWrite: true })
  const searched = vi.fn()
  const view = mount(() => <Tree treeData={nodes} showSearch searchValue={value()} onSearch={searched} />); dispose = view.dispose
  const input = view.host.querySelector('input')!
  input.value = 'Alpha'; input.dispatchEvent(new Event('input', {bubbles:true})); flush()
  expect(searched).toHaveBeenCalledExactlyOnceWith('Alpha'); expect(input.value).toBe('')
  setValue('Beta'); flush(); expect(input.value).toBe('Beta')
  expect(view.host.querySelector('[aria-label="Alpha"]')).toBeNull()
})
// 禁用复选框点击不能窃取当前启用节点的焦点。
it('[tree.disabled.focus] keeps focus out of disabled checkbox rows', () => {
  const view = mount(() => <Tree treeData={nodes} checkable defaultExpandAll />); dispose = view.dispose
  const enabled = view.host.querySelector<HTMLElement>('[aria-label="Alpha"]')!
  enabled.focus()
  const disabled = view.host.querySelector<HTMLElement>('[aria-label="Beta"]')!
  disabled.querySelectorAll<HTMLElement>(':scope > div > span')[1].click(); flush()
  expect(document.activeElement).toBe(enabled)
})
// TreeSelect 共用虚拟面板过滤无结果时也应提供空态。
it('[tree.panel.empty] renders empty content in virtual mode', () => {
  let rootDispose = () => {}
  const machine = createRoot(d => { rootDispose=d; return createTree({treeData:[]}) })
  const view = mount(() => <TreeInPanel machine={machine} />); dispose = () => {view.dispose();rootDispose()}
  expect(view.host.textContent).toContain('暂无数据')
})
// 默认单选不显示复选框，方向键展开后仅活跃节点参与 Tab 顺序。
it('[tree.keyboard.navigation] expands selects and checks DOM contracts', async () => {
  const select = vi.fn(), expand = vi.fn()
  const view = mount(() => <Tree treeData={nodes} onSelect={select} onExpand={expand} />); dispose = view.dispose
  const parent = view.host.querySelector<HTMLElement>('[aria-label="Parent"]')!
  expect(parent.hasAttribute('aria-checked')).toBe(false)
  parent.focus(); parent.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));flush();await Promise.resolve()
  expect(parent.getAttribute('aria-expanded')).toBe('true');expect(expand).toHaveBeenCalledExactlyOnceWith(['p'],expect.objectContaining({expanded:true}))
  parent.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));flush();await Promise.resolve()
  const alpha=view.host.querySelector<HTMLElement>('[aria-label="Alpha"]')!
  expect(document.activeElement).toBe(alpha);expect(view.host.querySelectorAll('[role="treeitem"][tabindex="0"]')).toHaveLength(1)
  alpha.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true}));flush()
  expect(alpha.getAttribute('aria-selected')).toBe('true');expect(select).toHaveBeenCalledExactlyOnceWith(['a'],expect.objectContaining({selected:true}))
})
// 受控展开、选择与复选只发请求，父层更新后才改变对应 DOM。
it('[tree.controlled.states] rejects and accepts all controlled states', () => {
  const [keys,setKeys]=createSignal<Array<string|number>>([], {ownedWrite:true})
  const check=vi.fn(),select=vi.fn(),expand=vi.fn()
  const view=mount(()=><Tree treeData={nodes} expandedKeys={keys()} selectedKeys={keys()} checkedKeys={keys()} onCheck={check} onSelect={select} onExpand={expand} />);dispose=view.dispose
  const row=view.host.querySelector<HTMLElement>('[aria-label="Parent"]')!, strip=row.firstElementChild as HTMLElement
  strip.click();flush();expect(select).toHaveBeenCalledOnce();expect(row.getAttribute('aria-selected')).toBe('false')
  strip.querySelectorAll<HTMLElement>('span')[0].click();flush();expect(expand).toHaveBeenCalledOnce();expect(row.getAttribute('aria-expanded')).toBe('false')
  row.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true}));flush();expect(check).toHaveBeenCalledOnce();expect(row.getAttribute('aria-checked')).toBe('false')
  setKeys(['p']);flush();expect(row.getAttribute('aria-selected')).toBe('true');expect(row.getAttribute('aria-expanded')).toBe('true');expect(row.getAttribute('aria-checked')).toBe('true')
})
// 非受控搜索覆盖提示、自定义空态、清空恢复和数据更新；样式及 ref 指向外层。
it('[tree.presentation.search] updates filtering and custom presentation', () => {
  const [data,setData]=createSignal(nodes,{ownedWrite:true});let root:HTMLDivElement|undefined
  const view=mount(()=><Tree ref={el=>{root=el}} treeData={data()} showSearch searchPlaceholder="查找" notFoundContent="无匹配" showIcon showLine indent={32} class="custom-tree" style={{width:'200px'}} aria-label="分类" titleRender={n=><b>{n.label}</b>} icon={()=><i data-custom-icon />} />);dispose=view.dispose
  expect(root).toBe(view.host.firstElementChild);expect(root?.className).toContain('custom-tree');expect(root?.style.width).toBe('200px')
  expect(view.host.querySelector('[role="tree"]')?.getAttribute('aria-label')).toBe('分类');expect(view.host.querySelector('b')?.textContent).toBe('Parent');expect(view.host.querySelector('[data-custom-icon]')).not.toBeNull()
  const input=view.host.querySelector('input')!;expect(input.placeholder).toBe('查找')
  input.value='New';input.dispatchEvent(new Event('input',{bubbles:true}));flush();expect(view.host.textContent).toContain('无匹配')
  setData([{value:'new',label:'New'}]);flush();expect(view.host.querySelector('[aria-label="New"]')).not.toBeNull()
  input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));flush();expect(input.value).toBe('')
})
