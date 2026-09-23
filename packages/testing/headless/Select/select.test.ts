import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createSelect } from '../../../competence/src/select'

const step = (fn: () => void) => { fn(); flush() }

const fruits = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '樱桃', value: 'cherry', disabled: true },
]

describe('createSelect — single mode (default)', () => {
  // 单选从空值开始，新选择覆盖旧值并通知原始键。
  it('starts empty; picking replaces; onChange reports the raw key', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createSelect({ options: fruits, onChange })
      expect(ins.singleValue()).toBeUndefined()
      step(() => ins.selectOption('apple'))
      expect(ins.singleValue()).toBe('apple')
      step(() => ins.selectOption('banana'))
      expect(ins.singleValue()).toBe('banana') // replaced
      expect(onChange).toHaveBeenLastCalledWith('banana')
    })
  })

  // 单选提交后关闭 headless 弹层状态。
  it('picking closes the dropdown in single mode', () => {
    createRoot(() => {
      const ins = createSelect({ options: fruits })
      step(() => ins.setOpen(true))
      expect(ins.isOpen()).toBe(true)
      step(() => ins.selectOption('apple'))
      expect(ins.isOpen()).toBe(false)
    })
  })

  // 禁用选项不能成为选择值。
  it('disabled options are unselectable', () => {
    createRoot(() => {
      const ins = createSelect({ options: fruits })
      step(() => ins.selectOption('cherry'))
      expect(ins.singleValue()).toBeUndefined()
      expect(ins.isDisabled('cherry')).toBe(true)
    })
  })

  // 重复点击单选当前项保持原值且不发变更。
  it('re-clicking the selected option keeps it (radio semantics)', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createSelect({ options: fruits, defaultValue: 'apple', onChange })
      step(() => ins.selectOption('apple'))
      expect(ins.singleValue()).toBe('apple')
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // 受控值由父层决定，用户操作只通过回调提出新值。
  it('controlled value wins; picks still report through onChange', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createSelect({ options: fruits, value: 'apple', onChange })
      step(() => ins.selectOption('banana'))
      expect(ins.singleValue()).toBe('apple') // still controlled
      expect(onChange).toHaveBeenCalledWith('banana')
    })
  })

  // labelInValue 单选回调包含选项标签和值。
  it('labelInValue reports { value, label } objects', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createSelect({ options: fruits, labelInValue: true, onChange })
      step(() => ins.selectOption('banana'))
      expect(onChange).toHaveBeenCalledWith({ value: 'banana', label: '香蕉' })
      expect(ins.selectedOptions()[0].label).toBe('香蕉')
    })
  })

  // 选中事件收到键和完整选项对象。
  it('onSelect fires with the full option', () => {
    createRoot(() => {
      const onSelect = vi.fn()
      const ins = createSelect({ options: fruits, onSelect })
      step(() => ins.selectOption('apple'))
      expect(onSelect).toHaveBeenCalledWith('apple', { label: '苹果', value: 'apple' })
    })
  })
})

describe('createSelect — multiple mode', () => {
  // 多选按成员切换并返回键数组。
  it('toggles membership and reports arrays', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createSelect({ options: fruits, mode: 'multiple', onChange })
      step(() => ins.selectOption('apple'))
      step(() => ins.selectOption('banana'))
      expect(ins.value()).toEqual(['apple', 'banana'])
      step(() => ins.selectOption('apple')) // toggle off
      expect(ins.value()).toEqual(['banana'])
      expect(onChange).toHaveBeenLastCalledWith(['banana'])
    })
  })

  // 多选提交保持弹层，取消选中发出 onDeselect。
  it('stays open after picking; onDeselect fires on toggle-off', () => {
    createRoot(() => {
      const onDeselect = vi.fn()
      const ins = createSelect({ options: fruits, mode: 'multiple', onDeselect })
      step(() => ins.setOpen(true))
      step(() => ins.selectOption('apple'))
      expect(ins.isOpen()).toBe(true)
      step(() => ins.selectOption('apple'))
      expect(onDeselect).toHaveBeenCalledWith('apple', { label: '苹果', value: 'apple' })
    })
  })

  // 标签移除只删除指定成员。
  it('deselectOption removes one key (tag ×)', () => {
    createRoot(() => {
      const ins = createSelect({ options: fruits, mode: 'multiple', defaultValue: ['apple', 'banana'] })
      step(() => ins.deselectOption('apple'))
      expect(ins.value()).toEqual(['banana'])
    })
  })

  // labelInValue 多选回调返回对象数组。
  it('labelInValue multiple reports object arrays', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createSelect({
        options: fruits, mode: 'multiple', labelInValue: true, onChange,
      })
      step(() => ins.selectOption('apple'))
      step(() => ins.selectOption('banana'))
      expect(onChange).toHaveBeenLastCalledWith([
        { value: 'apple', label: '苹果' },
        { value: 'banana', label: '香蕉' },
      ])
    })
  })
})

describe('createSelect — tags mode', () => {
  // 自由输入标签会加入选项并选中。
  it('commitSearchAsTag creates the option and picks it', () => {
    createRoot(() => {
      const onChange = vi.fn()
      const ins = createSelect({ options: fruits, mode: 'tags', onChange })
      step(() => ins.setSearchValue('自定义'))
      step(() => ins.commitSearchAsTag())
      expect(ins.value()).toEqual(['自定义'])
      expect(ins.options().map(o => o.label)).toContain('自定义')
      expect(onChange).toHaveBeenCalledWith(['自定义'])
    })
  })

  // 输入已有标签名称应复用已有选项。
  it('committing an existing label picks it instead of duplicating', () => {
    createRoot(() => {
      const ins = createSelect({ options: fruits, mode: 'tags' })
      step(() => ins.setSearchValue('苹果'))
      step(() => ins.commitSearchAsTag())
      expect(ins.value()).toEqual(['apple'])
      expect(ins.options().filter(o => o.label === '苹果')).toHaveLength(1)
    })
  })

  // 空搜索文本不会创建标签。
  it('empty search commits nothing', () => {
    createRoot(() => {
      const ins = createSelect({ options: fruits, mode: 'tags' })
      step(() => ins.commitSearchAsTag())
      expect(ins.value()).toEqual([])
    })
  })
})

describe('createSelect — search & filtering', () => {
  // 默认搜索忽略大小写并按标签包含匹配。
  it('search filters options by label (case-insensitive substring)', () => {
    createRoot(() => {
      const ins = createSelect({
        options: [
          { label: 'Apple', value: 'a' },
          { label: 'Banana', value: 'b' },
          { label: 'Grape', value: 'g' },
        ],
      })
      step(() => ins.setSearchValue('AN')) // case-insensitive
      expect(ins.filteredOptions().map(o => o.value)).toEqual(['b'])
      step(() => ins.setSearchValue('ap')) // apple + grape
      expect(ins.filteredOptions().map(o => o.value)).toEqual(['a', 'g'])
    })
  })

  // 搜索输入变化会发出 onSearch。
  it('onSearch fires on every keystroke', () => {
    createRoot(() => {
      const onSearch = vi.fn()
      const ins = createSelect({ options: fruits, onSearch })
      step(() => ins.setSearchValue('果'))
      expect(onSearch).toHaveBeenCalledWith('果')
    })
  })

  // filterOption=false 时保留全部候选给远端过滤使用。
  it('filterOption: false disables client filtering', () => {
    createRoot(() => {
      const ins = createSelect({ options: fruits, filterOption: false })
      step(() => ins.setSearchValue('zzz'))
      expect(ins.filteredOptions()).toHaveLength(3)
    })
  })

  // 自定义过滤函数决定可见选项。
  it('custom filterOption predicate is honored', () => {
    createRoot(() => {
      const ins = createSelect({
        options: fruits,
        filterOption: (input, option) => option.value === input,
      })
      step(() => ins.setSearchValue('banana'))
      expect(ins.filteredOptions().map(o => o.value)).toEqual(['banana'])
    })
  })

  // 关闭弹层时清空搜索缓冲。
  it('closing resets the search buffer', () => {
    createRoot(() => {
      const ins = createSelect({ options: fruits })
      step(() => ins.setOpen(true))
      step(() => ins.setSearchValue('苹'))
      step(() => ins.setOpen(false))
      expect(ins.searchValue()).toBe('')
    })
  })
})

describe('createSelect — active option (keyboard)', () => {
  // 打开时高亮第一个可用选项。
  it('resetActive anchors to the first enabled filtered option', () => {
    createRoot(() => {
      const ins = createSelect({ options: fruits })
      step(() => ins.setOpen(true))
      expect(ins.activeKey()).toBe('apple')
    })
  })

  // 当前选项可见时优先作为键盘候选。
  it('prefers the selected option when visible', () => {
    createRoot(() => {
      const ins = createSelect({ options: fruits, defaultValue: 'banana' })
      step(() => ins.setOpen(true))
      expect(ins.activeKey()).toBe('banana')
    })
  })

  // 方向键跳过禁用项并在边界循环。
  it('moveActive skips disabled options and wraps', () => {
    createRoot(() => {
      // enabled: apple, banana (cherry disabled)
      const ins = createSelect({ options: fruits })
      step(() => ins.setOpen(true))
      step(() => ins.moveActive(1))
      expect(ins.activeKey()).toBe('banana')
      step(() => ins.moveActive(1)) // wraps past cherry → apple
      expect(ins.activeKey()).toBe('apple')
      step(() => ins.moveActive(-1)) // wraps back
      expect(ins.activeKey()).toBe('banana')
    })
  })

  // Enter 提交当前高亮候选。
  it('commitActive picks the highlighted option (Enter)', () => {
    createRoot(() => {
      const ins = createSelect({ options: fruits })
      step(() => ins.setOpen(true))
      step(() => ins.moveActive(1))
      step(() => ins.commitActive())
      expect(ins.singleValue()).toBe('banana')
    })
  })

  // 过滤结果变化会重新定位高亮候选。
  it('searching re-anchors the active option', () => {
    createRoot(() => {
      const ins = createSelect({ options: fruits })
      step(() => ins.setOpen(true))
      step(() => ins.setSearchValue('香'))
      expect(ins.filteredOptions().map(o => o.value)).toEqual(['banana'])
      expect(ins.activeKey()).toBe('banana')
    })
  })

  // 无匹配结果时清空候选，提交不产生选择。
  it('no filtered options → active is undefined', () => {
    createRoot(() => {
      const ins = createSelect({ options: fruits })
      step(() => ins.setOpen(true))
      step(() => ins.setSearchValue('zzz'))
      expect(ins.activeKey()).toBeUndefined()
      step(() => ins.commitActive()) // no-op
      expect(ins.singleValue()).toBeUndefined()
    })
  })
})

describe('createSelect — open state & clear', () => {
  // 受控 open 拒绝变更时仍保持父层状态。
  it('controlled open wins over internal state', () => {
    createRoot(() => {
      const onOpenChange = vi.fn()
      const ins = createSelect({ options: fruits, open: false, onOpenChange })
      step(() => ins.setOpen(true))
      expect(ins.isOpen()).toBe(false) // still controlled
      expect(onOpenChange).toHaveBeenCalledWith(true)
    })
  })

  // 清空选择并触发 onClear。
  it('clear empties the selection and fires onClear', () => {
    createRoot(() => {
      const onClear = vi.fn()
      const ins = createSelect({ options: fruits, defaultValue: ['apple', 'banana'], mode: 'multiple', onClear })
      step(() => ins.clear())
      expect(ins.value()).toEqual([])
      expect(onClear).toHaveBeenCalledTimes(1)
    })
  })

  // 清空保留禁用选项的既有成员关系。
  it('clear keeps disabled options\' membership (selection-store semantics)', () => {
    createRoot(() => {
      const ins = createSelect({
        options: fruits,
        mode: 'multiple',
        defaultValue: ['banana', 'cherry'], // cherry disabled
      })
      step(() => ins.clear())
      expect(ins.value()).toEqual(['cherry'])
    })
  })

  // 整体禁用时开关和选择动作均无效。
  it('disabled gates every action', () => {
    createRoot(() => {
      const ins = createSelect({ options: fruits, disabled: true })
      step(() => ins.setOpen(true))
      expect(ins.isOpen()).toBe(false)
      step(() => ins.selectOption('apple'))
      expect(ins.singleValue()).toBeUndefined()
      expect(ins.isWidgetDisabled()).toBe(true)
    })
  })
})
