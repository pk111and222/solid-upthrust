import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createTree, createTreeSelect, flattenTree, buildTreeIndex, branchKeysOf } from '../../../competence/src/tree'

const step = (fn: () => void) => { fn(); flush() }

// 浙江(杭州[西湖, 滨江], 宁波), 江苏(南京, 苏州(园区[禁用]))
const tree = [
  {
    value: 'zj', label: '浙江', children: [
      { value: 'hz', label: '杭州', children: [
        { value: 'xh', label: '西湖' },
        { value: 'bj', label: '滨江' },
      ] },
      { value: 'nb', label: '宁波' },
    ],
  },
  {
    value: 'js', label: '江苏', children: [
      { value: 'nj', label: '南京' },
      { value: 'sz', label: '苏州', children: [
        { value: 'yq', label: '园区', disabled: true },
      ] },
    ],
  },
]

describe('tree pure helpers', () => {
  it('flattenTree carries parent + path + level', () => {
    const flat = flattenTree(tree)
    expect(flat).toHaveLength(9)
    const xh = flat.find(e => e.node.value === 'xh')!
    expect(xh.path).toEqual(['zj', 'hz', 'xh'])
    expect(xh.level).toBe(2)
    expect(xh.parent?.value).toBe('hz')
  })

  it('buildTreeIndex maps every value', () => {
    const idx = buildTreeIndex(tree)
    expect(idx.size).toBe(9)
    expect(idx.get('nb')?.node.label).toBe('宁波')
  })

  it('branchKeysOf lists expandable keys', () => {
    expect(branchKeysOf(tree).sort()).toEqual(['hz', 'js', 'sz', 'zj'])
  })
})

describe('createTree — expand', () => {
  it('starts from defaultExpandedKeys / defaultExpandAll', () => {
    createRoot(() => {
      expect(createTree({ treeData: tree, defaultExpandedKeys: ['zj'] }).expandedKeys()).toEqual(['zj'])
      const all = createTree({ treeData: tree, defaultExpandAll: true })
      expect(all.expandedKeys().sort()).toEqual(['hz', 'js', 'sz', 'zj'])
    })
  })

  it('toggleExpand fires onExpand with the info', () => {
    createRoot(() => {
      const onExpand = vi.fn()
      const ins = createTree({ treeData: tree, onExpand })
      step(() => ins.toggleExpand('zj'))
      expect(ins.isExpanded('zj')).toBe(true)
      expect(onExpand).toHaveBeenCalledWith(['zj'], { node: expect.anything(), expanded: true })
      step(() => ins.toggleExpand('zj'))
      expect(ins.expandedKeys()).toEqual([])
      expect(onExpand).toHaveBeenLastCalledWith([], { node: expect.anything(), expanded: false })
    })
  })

  it('controlled expandedKeys wins', () => {
    createRoot(() => {
      const ins = createTree({ treeData: tree, expandedKeys: ['js'] })
      step(() => ins.toggleExpand('zj'))
      // Controlled prop holds ['js']; the mirror effect restores it.
      expect(ins.expandedKeys()).toEqual(['js'])
    })
  })

  it('toggling a leaf is a no-op', () => {
    createRoot(() => {
      const ins = createTree({ treeData: tree })
      step(() => ins.toggleExpand('xh'))
      expect(ins.expandedKeys()).toEqual([])
    })
  })
})

describe('createTree — select', () => {
  it('select toggles the row highlight', () => {
    createRoot(() => {
      const onSelect = vi.fn()
      const ins = createTree({ treeData: tree, onSelect })
      step(() => ins.select('xh'))
      expect(ins.selectedKeys()).toEqual(['xh'])
      expect(onSelect).toHaveBeenCalledWith(['xh'], { node: expect.anything(), selected: true })
      step(() => ins.select('xh'))
      expect(ins.selectedKeys()).toEqual([])
    })
  })

  it('selectable:false and disabled rows are inert', () => {
    createRoot(() => {
      const data = [
        { value: 'a', label: 'A', selectable: false },
        { value: 'b', label: 'B', disabled: true },
      ]
      const ins = createTree({ treeData: data })
      step(() => ins.select('a'))
      step(() => ins.select('b'))
      expect(ins.selectedKeys()).toEqual([])
    })
  })

  it('a disabled ancestor disables the branch', () => {
    createRoot(() => {
      const data = [
        { value: 'p', label: 'P', disabled: true, children: [{ value: 'c', label: 'C' }] },
      ]
      const ins = createTree({ treeData: data })
      expect(ins.isDisabled('c')).toBe(true)
      step(() => ins.select('c'))
      expect(ins.selectedKeys()).toEqual([])
    })
  })
})

describe('createTree — check linkage', () => {
  it('checking a parent checks every descendant', () => {
    createRoot(() => {
      const onCheck = vi.fn()
      const ins = createTree({ treeData: tree, onCheck })
      step(() => ins.toggleCheck('zj'))
      expect(ins.checkedKeys().sort()).toEqual(['bj', 'hz', 'nb', 'xh', 'zj'])
      expect(ins.checkState('zj')).toBe('checked')
      expect(ins.checkState('xh')).toBe('checked')
    })
  })

  it('unchecking a parent removes the whole subtree', () => {
    createRoot(() => {
      const ins = createTree({ treeData: tree, defaultCheckedKeys: ['zj'] })
      step(() => ins.toggleCheck('zj'))
      expect(ins.checkedKeys()).toEqual([])
    })
  })

  it('half-checked derives from partial children', () => {
    createRoot(() => {
      const ins = createTree({ treeData: tree })
      step(() => ins.toggleCheck('hz')) // 西湖 + 滨江 (both under 杭州)
      expect(ins.halfCheckedKeys().sort()).toEqual(['zj'])
      expect(ins.checkState('hz')).toBe('checked')
      expect(ins.checkState('zj')).toBe('indeterminate')
    })
  })

  it('a half-checked parent checks like an unchecked one', () => {
    createRoot(() => {
      const ins = createTree({ treeData: tree })
      step(() => ins.toggleCheck('xh')) // one leaf under 浙江
      expect(ins.checkState('zj')).toBe('indeterminate')
      step(() => ins.toggleCheck('zj')) // completes the subtree
      expect(ins.checkState('zj')).toBe('checked')
      expect(ins.isChecked('nb')).toBe(true)
    })
  })

  it('disabled descendants keep their prior state', () => {
    createRoot(() => {
      const ins = createTree({ treeData: tree })
      step(() => ins.toggleCheck('yq')) // disabled leaf — inert
      expect(ins.checkedKeys()).toEqual([])
      step(() => ins.toggleCheck('sz')) // parent of the disabled leaf
      expect(ins.checkedKeys().sort()).toEqual(['sz'])
      expect(ins.isChecked('yq')).toBe(false)
      // The only child is disabled and uncheckable — 苏州 behaves like a
      // checked leaf, NOT half-checked (nothing left to be partial about).
      expect(ins.checkState('sz')).toBe('checked')
    })
  })

  it('checkable:false subtree is skipped by parent checks', () => {
    createRoot(() => {
      const data = [
        { value: 'p', label: 'P', children: [
          { value: 'c', label: 'C', checkable: false },
          { value: 'd', label: 'D' },
        ] },
      ]
      const ins = createTree({ treeData: data })
      step(() => ins.toggleCheck('p'))
      expect(ins.checkedKeys().sort()).toEqual(['d', 'p'])
      expect(ins.isCheckableNode('c')).toBe(false)
    })
  })

  it('controlled checkedKeys wins', () => {
    createRoot(() => {
      const ins = createTree({ treeData: tree, checkedKeys: ['xh'] })
      step(() => ins.toggleCheck('zj'))
      expect(ins.checkedKeys()).toEqual(['xh'])
    })
  })
})

describe('createTree — search', () => {
  it('displayTree prunes to matching paths and force-expands', () => {
    createRoot(() => {
      const ins = createTree({ treeData: tree })
      step(() => ins.setSearchValue('西湖'))
      const shown = ins.displayTree()
      expect(shown).toHaveLength(1) // 浙江
      expect(shown[0].children).toHaveLength(1) // 杭州
      expect(shown[0].children![0].children).toHaveLength(1) // 西湖
      expect((shown[0] as any).__forceExpanded).toBe(true)
      expect(ins.matchSet().has('xh')).toBe(true)
    })
  })

  it('clearing search restores the full tree', () => {
    createRoot(() => {
      const ins = createTree({ treeData: tree })
      step(() => ins.setSearchValue('西湖'))
      step(() => ins.clear())
      expect(ins.displayTree()).toEqual(tree)
      expect(ins.searching()).toBe(false)
    })
  })

  it('no match shows an empty tree', () => {
    createRoot(() => {
      const ins = createTree({ treeData: tree })
      step(() => ins.setSearchValue('不存在'))
      expect(ins.displayTree()).toEqual([])
    })
  })
})

describe('createTreeSelect — single', () => {
  it('pickNode commits the key + node', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createTreeSelect({ treeData: tree, onChange })
      step(() => ins.pickNode('xh'))
      expect(ins.singleValue()).toBe('xh')
      expect(onChange).toHaveBeenCalledWith('xh', expect.objectContaining({ value: 'xh' }))
    })
  })

  it('clear empties (undefined)', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createTreeSelect({ treeData: tree, defaultValue: 'xh', onChange })
      step(() => ins.clear())
      expect(ins.singleValue()).toBeUndefined()
      expect(onChange).toHaveBeenCalledWith(undefined, undefined)
    })
  })

  it('controlled value wins', () => {
    createRoot(() => {
      const ins = createTreeSelect({ treeData: tree, value: 'nb' })
      step(() => ins.pickNode('xh'))
      expect(ins.singleValue()).toBe('nb')
    })
  })
})

describe('createTreeSelect — multiple + SHOW_PARENT', () => {
  it('checking a parent reports just the parent key', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createTreeSelect({ treeData: tree, mode: 'multiple', onChange })
      step(() => ins.toggleCheck('zj'))
      expect(ins.value()).toEqual(['zj'])
      expect(onChange).toHaveBeenCalledWith(['zj'], [expect.objectContaining({ value: 'zj' })])
    })
  })

  it('partial checks report the leaf keys', () => {
    createRoot(() => {
      const ins = createTreeSelect({ treeData: tree, mode: 'multiple' })
      step(() => ins.toggleCheck('xh'))
      expect(ins.value()).toEqual(['xh'])
      step(() => ins.toggleCheck('hz')) // 杭州全勾
      expect(ins.value()).toEqual(['hz']) // SHOW_PARENT 折叠
    })
  })

  it('a controlled parent value expands to the raw subtree', () => {
    createRoot(() => {
      const ins = createTreeSelect({ treeData: tree, mode: 'multiple', value: ['zj'] })
      expect(ins.rawChecked().sort()).toEqual(['bj', 'hz', 'nb', 'xh', 'zj'])
      expect(ins.value()).toEqual(['zj'])
    })
  })

  it('removeKey (tag ×) unchecks the subtree it represents', () => {
    createRoot(() => {
      const ins = createTreeSelect({ treeData: tree, mode: 'multiple', defaultValue: ['zj'] })
      step(() => ins.removeKey('zj'))
      expect(ins.value()).toEqual([])
    })
  })

  it('show all leaves via SHOW_ALL', () => {
    createRoot(() => {
      const ins = createTreeSelect({ treeData: tree, mode: 'multiple', treeCheckStrategy: 'SHOW_ALL' })
      step(() => ins.toggleCheck('zj'))
      expect(ins.value().sort()).toEqual(['bj', 'hz', 'nb', 'xh', 'zj'])
    })
  })

  it('SHOW_CHILD reports only leaf keys', () => {
    createRoot(() => {
      const ins = createTreeSelect({ treeData: tree, mode: 'multiple', treeCheckStrategy: 'SHOW_CHILD' })
      step(() => ins.toggleCheck('zj'))
      expect(ins.value().sort()).toEqual(['bj', 'nb', 'xh'])
    })
  })

  it('disabled subtree nodes are exempt and the parent stays indeterminate', () => {
    createRoot(() => {
      const ins = createTreeSelect({ treeData: tree, mode: 'multiple' })
      step(() => ins.toggleCheck('sz')) // 园区 disabled — only 苏州 stored
      expect(ins.value()).toEqual(['sz'])
      step(() => ins.toggleCheck('js')) // 江苏 whole subtree
      // 园区 (disabled) is skipped by covered() — a node whose subtree is
      // all-disabled/uncheckable collapses on its OWN membership (antd:
      // such a branch behaves like a leaf). So 江苏 IS fully covered and
      // reports alone.
      expect(ins.value()).toEqual(['js'])
      expect(ins.rawChecked().sort()).toEqual(['js', 'nj', 'sz']) // 园区 exempt
    })
  })
})

describe('createTreeSelect — checkStrictly', () => {
  it('no linkage: keys are independent', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createTreeSelect({ treeData: tree, mode: 'multiple', treeCheckStrictly: true, onChange })
      step(() => ins.toggleCheck('zj'))
      expect(ins.value()).toEqual(['zj']) // just the parent, no descendants
      expect(ins.rawChecked()).toEqual(['zj'])
      step(() => ins.toggleCheck('xh'))
      expect(ins.value().sort()).toEqual(['xh', 'zj'])
      step(() => ins.removeKey('zj'))
      expect(ins.value()).toEqual(['xh'])
    })
  })
})

describe('createTreeSelect — search & open', () => {
  it('setSearchValue delegates and reports onSearch', () => {
    createRoot(() => {
      const onSearch = vi.fn()
      const ins = createTreeSelect({ treeData: tree, onSearch })
      step(() => ins.setSearchValue('杭州'))
      expect(ins.searchValue()).toBe('杭州')
      expect(ins.tree().displayTree()).toHaveLength(1)
      expect(onSearch).toHaveBeenCalledWith('杭州')
    })
  })

  it('open resets the search', () => {
    createRoot(() => {
      const ins = createTreeSelect({ treeData: tree })
      step(() => ins.setSearchValue('西湖'))
      step(() => ins.setOpen(true))
      expect(ins.searchValue()).toBe('')
    })
  })

  it('disabled gates everything', () => {
    createRoot(() => {
      const ins = createTreeSelect({ treeData: tree, disabled: true })
      step(() => ins.setOpen(true))
      expect(ins.isOpen()).toBe(false)
      step(() => ins.pickNode('xh'))
      expect(ins.singleValue()).toBeUndefined()
      expect(ins.isWidgetDisabled()).toBe(true)
    })
  })
})

describe('Tree completion regressions', () => {
  it('promotes parents after checking all children and clears stale parents when unchecking a child', () => createRoot(() => {
    const ins = createTree({ treeData: tree })
    step(() => ins.toggleCheck('xh')); step(() => ins.toggleCheck('bj'))
    expect(ins.isChecked('hz')).toBe(true)
    expect(ins.checkState('zj')).toBe('indeterminate')
    step(() => ins.toggleCheck('nb')); expect(ins.isChecked('zj')).toBe(true)
    step(() => ins.toggleCheck('xh'))
    expect(ins.isChecked('zj')).toBe(false); expect(ins.isChecked('hz')).toBe(false)
    expect(ins.checkState('hz')).toBe('indeterminate')
    expect(ins.isChecked('bj')).toBe(true)
  }))
  it('never checks grandchildren below a disabled branch', () => createRoot(() => {
    const ins = createTree({ treeData: [{ value: 0, label: 'Root', children: [{ value: 1, label: 'Disabled', disabled: true, children: [{ value: 2, label: 'Child' }] }, { value: 3, label: 'Enabled' }] }] })
    step(() => ins.toggleCheck(0))
    expect(ins.checkedKeys()).toEqual([0, 3]); expect(ins.checkState(0)).toBe('checked')
  }))
  it('does not visually commit a controlled selection or check when the parent rejects it', () => createRoot(() => {
    const onCheck = vi.fn(), onSelect = vi.fn()
    const ins = createTree({ treeData: tree, checkedKeys: [], selectedKeys: [], onCheck, onSelect })
    flush()
    step(() => ins.select('xh')); step(() => ins.toggleCheck('zj'))
    expect(ins.selectedKeys()).toEqual([]); expect(ins.checkedKeys()).toEqual([])
    expect(onSelect).toHaveBeenCalled(); expect(onCheck).toHaveBeenCalled()
  }))
  it('supports multiple row selection and independent checkboxes', () => createRoot(() => {
    const ins = createTree({ treeData: tree, multiple: true, checkStrictly: true })
    step(() => ins.select('xh')); step(() => ins.select('nj'))
    expect(ins.selectedKeys()).toEqual(['xh', 'nj'])
    step(() => ins.select('xh')); expect(ins.selectedKeys()).toEqual(['nj'])
    step(() => ins.toggleCheck('zj')); expect(ins.checkedKeys()).toEqual(['zj'])
    expect(ins.halfCheckedKeys()).toEqual([])
  }))
  it('navigates only visible enabled nodes and activates with Enter/Space', () => createRoot(() => {
    const ins = createTree({ treeData: tree })
    expect(ins.activeKey()).toBe('zj')
    step(() => ins.navigate('ArrowRight')); expect(ins.isExpanded('zj')).toBe(true)
    step(() => ins.navigate('ArrowRight')); expect(ins.activeKey()).toBe('hz')
    step(() => ins.navigate('Enter')); expect(ins.selectedKeys()).toEqual(['hz'])
    step(() => ins.navigate(' ')); expect(ins.isChecked('hz')).toBe(true)
    step(() => ins.navigate('ArrowLeft')); expect(ins.activeKey()).toBe('zj')
    step(() => ins.navigate('ArrowLeft')); expect(ins.isExpanded('zj')).toBe(false)
    step(() => ins.navigate('End')); expect(ins.activeKey()).toBe('js')
    step(() => ins.navigate('Home')); expect(ins.activeKey()).toBe('zj')
  }))
  it('search treats whitespace as empty and restores normal expansion after clearing', () => createRoot(() => {
    const ins = createTree({ treeData: tree })
    step(() => ins.setSearchValue('西湖'))
    expect(ins.visibleKeys()).toEqual(['zj', 'hz', 'xh'])
    step(() => ins.setSearchValue('   '))
    expect(ins.visibleKeys()).toEqual(['zj', 'js'])
    expect(ins.displayTree()).toHaveLength(2)
  }))
})

describe('Tree disabled presentation', () => {
  it('retains linked defaults when the widget is disabled', () => createRoot(() => {
    const ins = createTree({ treeData: tree, disabled: true, defaultCheckedKeys: ['zj'] })
    expect(ins.isChecked('xh')).toBe(true)
    expect(ins.isChecked('zj')).toBe(true)
    step(() => ins.toggleCheck('xh'))
    expect(ins.isChecked('xh')).toBe(true)
  }))
})


describe('Tree reactive updates', () => {
  it('accepts controlled selection and expansion updates after mount', () => createRoot(() => {
    const [selected, setSelected] = createSignal<Array<string | number>>([], { ownedWrite: true })
    const [expanded, setExpanded] = createSignal<Array<string | number>>([], { ownedWrite: true })
    const ins = createTree({ treeData: tree, get selectedKeys() { return selected() }, get expandedKeys() { return expanded() }, onSelect: setSelected, onExpand: setExpanded })
    step(() => ins.select('xh')); expect(ins.selectedKeys()).toEqual(['xh'])
    step(() => ins.expand('zj')); expect(ins.visibleKeys()).toEqual(['zj', 'hz', 'nb', 'js'])
    step(() => { setSelected(['nj']); setExpanded(['js']) })
    expect(ins.selectedKeys()).toEqual(['nj']); expect(ins.visibleKeys()).toEqual(['zj', 'js', 'nj', 'sz'])
  }))
  it('refreshes search matches when treeData changes', () => createRoot(() => {
    const [nodes, setNodes] = createSignal([{ value: 0, label: 'Old' }], { ownedWrite: true })
    const ins = createTree({ get treeData() { return nodes() } })
    step(() => ins.setSearchValue('New')); expect(ins.displayTree()).toEqual([])
    step(() => setNodes([{ value: 0, label: 'New' }]))
    expect(ins.displayTree().map(node => node.label)).toEqual(['New'])
    expect(ins.matchSet().has(0)).toBe(true)
  }))
})
