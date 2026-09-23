import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Transfer from '../../../components/lib/Transfer'
import { mount } from '../../utils/mount'

const data = [
  { key: 0, title: '甲', description: '设计团队' },
  { key: 1, title: '乙', description: '研发团队', disabled: true },
  { key: 2, title: '丙', description: '设计团队' },
]
let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })
const checkbox = (host: HTMLElement, label: string) => host.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!
const button = (host: HTMLElement, label: string) => host.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!

// 左右列表应按目标键分区，数字零、禁用行、初始选中与公开外观属性都可见。
it('[transfer.render.partition] paints source and target panels with item semantics', () => {
  const view = mount(() => <Transfer dataSource={data} defaultTargetKeys={[0]} defaultSelectedKeys={[2]}
    titles={['候选成员', '已分配成员']} id="members" class="custom-transfer" style={{ width: '520px' }}
    listStyle={{ height: '180px' }} status="error" />); dispose = view.dispose
  const group = view.host.querySelector<HTMLElement>('[role="group"]')!
  const panels = group.querySelectorAll<HTMLElement>('section')
  expect(group.id).toBe('members')
  expect(group.className).toContain('custom-transfer')
  expect(group.style.width).toBe('520px')
  expect(panels).toHaveLength(2)
  expect(panels[0].getAttribute('aria-label')).toBe('候选成员')
  expect(panels[1].getAttribute('aria-label')).toBe('已分配成员')
  expect(panels[0].style.height).toBe('180px')
  expect(panels[0].className).toContain('border-error')
  expect(panels[0].textContent).toContain('1 / 2')
  expect(panels[1].textContent).toContain('0 / 1')
  expect(checkbox(group, '丙').checked).toBe(true)
  expect(checkbox(group, '乙').disabled).toBe(true)
  expect(group.querySelector('[title="设计团队"]')).not.toBeNull()
})

// 勾选、移入与移回应按方向报告实际键集合，且只清除已移动项的临时选择。
it('[transfer.render.move] moves selected rows and reports direction', () => {
  const change = vi.fn(), selection = vi.fn()
  const view = mount(() => <Transfer dataSource={data} onChange={change} onSelectChange={selection} />); dispose = view.dispose
  checkbox(view.host, '甲').click(); flush()
  expect(selection).toHaveBeenLastCalledWith([0], [])
  button(view.host, '移入右侧').click(); flush()
  expect(change).toHaveBeenLastCalledWith([0], 'right', [0])
  expect(selection).toHaveBeenLastCalledWith([], [])
  expect(view.host.querySelector('section[aria-label="已选项"]')?.textContent).toContain('甲')
  checkbox(view.host, '甲').click(); flush()
  button(view.host, '移回左侧').click(); flush()
  expect(change).toHaveBeenLastCalledWith([], 'left', [0])
  expect(view.host.querySelector('section[aria-label="待选项"]')?.textContent).toContain('甲')
})

// 搜索仅改变可见行；全选只处理命中项，隐藏的已选项和禁用项保持原状。
it('[transfer.render.search-bulk] filters and bulk-selects visible enabled rows', () => {
  const search = vi.fn(), selection = vi.fn()
  const view = mount(() => <Transfer dataSource={data} showSearch searchPlaceholder="按团队查找"
    defaultSelectedKeys={[2]} onSearch={search} onSelectChange={selection} />); dispose = view.dispose
  const input = view.host.querySelector<HTMLInputElement>('input[type="search"]')!
  expect(input.placeholder).toBe('按团队查找')
  input.value = '甲'; input.dispatchEvent(new InputEvent('input', { bubbles: true })); flush()
  expect(search).toHaveBeenCalledWith('left', '甲')
  expect(view.host.querySelector('section[aria-label="待选项"]')?.textContent).not.toContain('丙')
  const all = checkbox(view.host, '全选待选项')
  all.click(); flush()
  expect(selection).toHaveBeenLastCalledWith([2, 0], [])
  expect(all.checked).toBe(true)
  input.value = ''; input.dispatchEvent(new InputEvent('input', { bubbles: true })); flush()
  expect(all.checked).toBe(true)
  expect(checkbox(view.host, '乙').disabled).toBe(true)
})

// 受控目标键与临时选中键只由父层写回；回调不能自行改变两侧 UI。
it('[transfer.render.controlled] waits for parent updates', () => {
  const [targets, setTargets] = createSignal<Array<string | number>>([], { ownedWrite: true })
  const [selected, setSelected] = createSignal<Array<string | number>>([], { ownedWrite: true })
  const change = vi.fn(), selection = vi.fn()
  const view = mount(() => <Transfer dataSource={data} targetKeys={targets()} selectedKeys={selected()}
    onChange={change} onSelectChange={selection} />); dispose = view.dispose
  checkbox(view.host, '甲').click(); flush()
  expect(selection).toHaveBeenCalledWith([0], [])
  expect(checkbox(view.host, '甲').checked).toBe(false)
  setSelected([0]); flush()
  expect(checkbox(view.host, '甲').checked).toBe(true)
  button(view.host, '移入右侧').click(); flush()
  expect(change).toHaveBeenCalledWith([0], 'right', [0])
  expect(view.host.querySelector('section[aria-label="待选项"]')?.textContent).toContain('甲')
  setTargets([0]); setSelected([]); flush()
  expect(view.host.querySelector('section[aria-label="已选项"]')?.textContent).toContain('甲')
})

// 单向模式应隐藏反向批量按钮，展示自定义内容与底部，并允许逐项移除。
it('[transfer.render.one-way] renders custom content and removes target rows', () => {
  const change = vi.fn()
  const view = mount(() => <Transfer dataSource={data} defaultTargetKeys={[0]} oneWay
    operations={['加入', '返回']} render={item => <strong>{item.title}成员</strong>}
    footer={direction => <small>{direction === 'left' ? '左侧说明' : '右侧说明'}</small>}
    onChange={change} />); dispose = view.dispose
  expect(button(view.host, '移回左侧')).toBeNull()
  expect(button(view.host, '移入右侧').textContent).toContain('加入')
  expect(view.host.querySelectorAll('strong')).toHaveLength(3)
  expect(view.host.textContent).toContain('左侧说明')
  expect(view.host.textContent).toContain('右侧说明')
  button(view.host, '移除 甲').click(); flush()
  expect(change).toHaveBeenCalledWith([], 'left', [0])
  expect(view.host.querySelector('section[aria-label="待选项"]')?.textContent).toContain('甲成员')
})

// 空态、自定义空文案、隐藏全选及整体禁用时的控件状态应与属性一致。
it('[transfer.render.empty-disabled] handles empty and disabled presentation', () => {
  const view = mount(() => <><Transfer dataSource={[]} showSelectAll={false} notFoundContent={<b>暂无资源</b>}
    listStyle={{ height: '150px' }} status="warning" />
    <Transfer dataSource={data} disabled showSearch /></>); dispose = view.dispose
  const groups = view.host.querySelectorAll<HTMLElement>('[role="group"]')
  expect(groups[0].querySelectorAll('input[type="checkbox"]')).toHaveLength(0)
  expect(groups[0].querySelectorAll('b')).toHaveLength(2)
  expect(groups[0].querySelector('section')?.className).toContain('border-[#faad14]')
  expect(groups[1].getAttribute('aria-disabled')).toBe('true')
  expect(groups[1].querySelectorAll('input:disabled').length).toBeGreaterThan(0)
  expect(button(groups[1], '移入右侧').disabled).toBe(true)
})
