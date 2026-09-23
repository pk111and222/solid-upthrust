import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createCascader } from '../../../competence/src/cascader'

const step = (fn: () => void) => { fn(); flush() }

// 浙江/杭州(西湖, 滨江), 浙江/宁波, 江苏/南京, 江苏/苏州(园区[禁用])
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

describe('createCascader — tree model', () => {
  it('indexes every node with parent + trail', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree })
      expect(ins.getNode('xh')?.label).toBe('西湖')
      const idx = ins.nodeIndex().get('xh')
      expect(idx?.parent?.value).toBe('hz')
      expect(idx?.trail).toEqual(['zj', 'hz', 'xh'])
    })
  })

  it('trailOptions returns one column per level', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree })
      const cols = ins.trailOptions(['zj', 'hz'])
      expect(cols).toHaveLength(3)
      expect(cols[0]).toHaveLength(2)                      // root: 浙江, 江苏
      expect(cols[1].map(o => o.value)).toEqual(['hz', 'nb']) // 浙江's children
      expect(cols[2].map(o => o.value)).toEqual(['xh', 'bj']) // 杭州's children
    })
  })

  it('labelPath joins labels along a trail', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree })
      expect(ins.labelPath(['zj', 'hz', 'xh'])).toEqual(['浙江', '杭州', '西湖'])
    })
  })

  it('isLeaf inspects the final node', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree })
      expect(ins.isLeaf(['zj', 'hz', 'xh'])).toBe(true)
      expect(ins.isLeaf(['zj', 'hz'])).toBe(false)
    })
  })

  it('a node is disabled when IT or any ANCESTOR is disabled', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree })
      expect(ins.isDisabled('yq')).toBe(true)
      expect(ins.isDisabled('sz')).toBe(false)
      // nested disabled parent:
      const t2 = [
        { value: 'p', label: 'P', disabled: true, children: [
          { value: 'c', label: 'C' },
        ] },
      ]
      const ins2 = createCascader({ options: t2 })
      expect(ins2.isDisabled('c')).toBe(true)
    })
  })
})

describe('createCascader — single mode (default)', () => {
  it('picks a leaf trail and reports the path', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createCascader({ options: tree, onChange })
      step(() => ins.activate(['zj', 'hz', 'xh']))
      expect(ins.path()).toEqual(['zj', 'hz', 'xh'])
      expect(ins.labelText()).toBe('浙江 / 杭州 / 西湖')
      expect(onChange).toHaveBeenCalledWith(['zj', 'hz', 'xh'], [
        expect.objectContaining({ value: 'zj' }),
        expect.objectContaining({ value: 'hz' }),
        expect.objectContaining({ value: 'xh' }),
      ])
    })
  })

  it('an intermediate click does NOT commit without changeOnSelect', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createCascader({ options: tree, onChange })
      step(() => ins.activate(['zj', 'hz']))
      expect(ins.path()).toBeUndefined()
      expect(onChange).not.toHaveBeenCalled()
      // but the trail activated (menu columns advance)
      expect(ins.activeTrail()).toEqual(['zj', 'hz'])
    })
  })

  it('changeOnSelect commits intermediate picks', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree, changeOnSelect: true })
      step(() => ins.activate(['zj', 'hz']))
      expect(ins.path()).toEqual(['zj', 'hz'])
    })
  })

  it('picking another leaf replaces the previous path', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree })
      step(() => ins.activate(['zj', 'hz', 'xh']))
      step(() => ins.activate(['js', 'nj']))
      expect(ins.path()).toEqual(['js', 'nj'])
    })
  })

  it('a disabled node cannot be activated or committed', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree })
      step(() => ins.activate(['js', 'sz', 'yq']))
      expect(ins.path()).toBeUndefined()
      expect(ins.activeTrail()).toEqual([]) // activate was blocked entirely
    })
  })

  it('controlled value wins (mirror); picks still report', () => {
    createRoot(() => {
      const [v, setV] = createSignal<Array<string | number>>(['zj', 'nb'], { ownedWrite: true } as any)
      const onChange = vi.fn(p => setV(p as Array<string | number>))
      const ins = createCascader({
        options: tree,
        get value() { return v() as any },
        onChange,
      })
      expect(ins.path()).toEqual(['zj', 'nb'])
      step(() => ins.activate(['js', 'nj']))
      expect(onChange).toHaveBeenCalled()
      // parent accepted → mirrored
      flush()
      expect(ins.path()).toEqual(['js', 'nj'])
    })
  })

  it('seeding from defaultValue', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree, defaultValue: ['zj', 'nb'] })
      expect(ins.path()).toEqual(['zj', 'nb'])
      expect(ins.labelText()).toBe('浙江 / 宁波')
    })
  })
})

describe('createCascader — multiple mode', () => {
  it('accumulates paths without checkable (click commits each leaf)', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree, mode: 'multiple' })
      step(() => ins.activate(['zj', 'hz', 'xh']))
      step(() => ins.activate(['js', 'nj']))
      expect(ins.value()).toEqual([['zj', 'hz', 'xh'], ['js', 'nj']])
    })
  })

  it('clicking a stored path removes it (toggle semantics)', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree, mode: 'multiple' })
      step(() => ins.activate(['zj', 'hz', 'xh']))
      step(() => ins.activate(['zj', 'hz', 'xh']))
      expect(ins.value()).toEqual([])
    })
  })

  it('checkable: checking a parent stores every leaf under it', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree, mode: 'multiple', checkable: true })
      step(() => ins.toggleCheck(['zj', 'hz'])) // 杭州: 西湖+滨江
      expect(ins.value()).toEqual([['zj', 'hz', 'xh'], ['zj', 'hz', 'bj']])
      // parent shows checked via derivation
      expect(ins.isSelected(['zj', 'hz'])).toBe(true)
      expect(ins.parentState(['zj', 'hz'])).toBe('checked')
      // partial: uncheck one leaf
      step(() => ins.toggleCheck(['zj', 'hz', 'xh']))
      expect(ins.parentState(['zj', 'hz'])).toBe('indeterminate')
      expect(ins.isSelected(['zj', 'hz'])).toBe(false)
    })
  })

  it('checkable: parent with one child toggles together', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree, mode: 'multiple', checkable: true })
      step(() => ins.toggleCheck(['js', 'sz'])) // 苏州: 园区(disabled)
      // disabled leaf is still checkable via parent linkage (antd allows
      // parent-driven checks of disabled children)
      expect(ins.value()).toEqual([['js', 'sz', 'yq']])
      step(() => ins.toggleCheck(['js', 'sz']))
      expect(ins.value()).toEqual([])
    })
  })

  it('checkable root toggles every leaf in the tree', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree, mode: 'multiple', checkable: true })
      step(() => ins.toggleCheck(['zj'])) // all 浙江 leaves
      expect(ins.value()).toHaveLength(3) // xh, bj, nb
      expect(ins.parentState(['js'])).toBe('unchecked')
      expect(ins.parentState(['zj'])).toBe('checked')
    })
  })

  it('checkable click on a row does not commit (checkboxes own commit)', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree, mode: 'multiple', checkable: true })
      step(() => ins.activate(['zj', 'hz', 'xh'])) // click path
      expect(ins.value()).toEqual([])
      expect(ins.activeTrail()).toEqual(['zj', 'hz', 'xh']) // menu advanced
    })
  })
})

describe('createCascader — search', () => {
  it('matches nodes whose label contains the query (case-insensitive)', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree })
      step(() => ins.setSearchValue('西湖'))
      const m = ins.searchMatches()
      expect(m).toHaveLength(1)
      expect(m[0].path).toEqual(['zj', 'hz', 'xh'])
      expect(m[0].nodes.map(n => n.label)).toEqual(['浙江', '杭州', '西湖'])
    })
  })

  it('matches intermediate nodes too (superset of leaf-only)', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree })
      step(() => ins.setSearchValue('杭州'))
      const m = ins.searchMatches()
      expect(m.map(x => x.path[x.path.length - 1])).toEqual(['hz', 'xh', 'bj'])
    })
  })

  it('fires onSearch per keystroke', () => {
    createRoot(() => {
      const onSearch = vi.fn()
      const ins = createCascader({ options: tree, onSearch })
      step(() => ins.setSearchValue('苏'))
      expect(onSearch).toHaveBeenCalledWith('苏')
    })
  })

  it('searchFilterOption: false disables client filtering (matches everything)', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree, searchFilterOption: false })
      step(() => ins.setSearchValue('zzz'))
      // filter=null → every node matches
      expect(ins.searchMatches().length).toBeGreaterThan(0)
    })
  })

  it('custom predicate is honored', () => {
    createRoot(() => {
      const ins = createCascader({
        options: tree,
        searchFilterOption: (input, p) => p[p.length - 1] === input,
      })
      step(() => ins.setSearchValue('nb'))
      expect(ins.searchMatches().map(m => m.path)).toEqual([['zj', 'nb']])
    })
  })

  it('clearSearch resets', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree })
      step(() => ins.setSearchValue('西湖'))
      step(() => ins.clearSearch())
      expect(ins.searchValue()).toBe('')
      expect(ins.searchMatches()).toEqual([])
    })
  })
})

describe('createCascader — clear & disabled', () => {
  it('clear empties the selection and fires onClear', () => {
    createRoot(() => {
      const onClear = vi.fn()
      const ins = createCascader({
        options: tree,
        defaultValue: ['zj', 'nb'],
        onClear,
      })
      step(() => ins.clear())
      expect(ins.path()).toBeUndefined()
      expect(onClear).toHaveBeenCalledTimes(1)
    })
  })

  it('disabled gates everything', () => {
    createRoot(() => {
      const ins = createCascader({ options: tree, disabled: true })
      step(() => ins.activate(['zj', 'hz', 'xh']))
      expect(ins.path()).toBeUndefined()
      step(() => ins.clear())
      expect(ins.isWidgetDisabled()).toBe(true)
    })
  })
})

// 每次点击路径都应先通知 onSelect，再按 changeOnSelect 决定是否提交。
it('[cascader.events.select] reports intermediate and leaf paths', () => {
  createRoot(() => {
    const onSelect = vi.fn()
    const ins = createCascader({ options: tree, onSelect })
    step(() => ins.activate(['zj'], 'click'))
    step(() => ins.activate(['zj', 'hz', 'xh'], 'click'))
    expect(onSelect).toHaveBeenNthCalledWith(1, ['zj'], [expect.objectContaining({ value: 'zj' })])
    expect(onSelect).toHaveBeenNthCalledWith(2, ['zj', 'hz', 'xh'], [
      expect.objectContaining({ value: 'zj' }), expect.objectContaining({ value: 'hz' }), expect.objectContaining({ value: 'xh' }),
    ])
  })
})
