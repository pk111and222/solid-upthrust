import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createTabs, type TabItem } from '../../../competence/src/tabs'
describe('editable and draggable tabs', () => {
  it('requests additions/removals while respecting disabled and closable items', () => createRoot(() => {
    const onEdit = vi.fn()
    const tabs = createTabs({editable:true, items:[{key:'a',label:'A'},{key:'b',label:'B',closable:false},{key:'c',label:'C',disabled:true}], onEdit})
    tabs.add(); tabs.remove('a'); tabs.remove('b'); tabs.remove('c'); tabs.remove('missing')
    expect(onEdit.mock.calls).toEqual([['','add'],['a','remove']])
  }))
  it('falls back to a live tab after the parent removes the active item', () => createRoot(() => {
    const [items, setItems] = createSignal<TabItem[]>([{key:'a',label:'A'},{key:'b',label:'B'}], {ownedWrite:true})
    const tabs = createTabs({ get items() { return items() }, defaultActiveKey:'b' })
    setItems([{key:'a',label:'A'}]); flush(); expect(tabs.activeKey()).toBe('a')
  }))
  it('reorders keys, keeps active key stable and blocks disabled targets', () => createRoot(() => {
    const onReorder = vi.fn()
    const tabs = createTabs({draggable:true, items:[{key:'a',label:'A'},{key:'b',label:'B'},{key:'c',label:'C',disabled:true}],onReorder})
    tabs.startDrag('a'); tabs.drop('b'); flush()
    expect(tabs.items().map(item=>item.key)).toEqual(['b','a','c']); expect(tabs.activeKey()).toBe('a')
    tabs.reorder('a','c'); expect(onReorder).toHaveBeenCalledOnce(); expect(tabs.draggingKey()).toBeUndefined()
  }))
})
