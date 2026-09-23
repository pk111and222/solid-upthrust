import { createRoot, flush } from 'solid-js'
import { expect, it, vi } from 'vitest'
import { createSelect } from '../../../competence/src/select'

// 嵌套组选项应按组顺序扁平化，并在搜索后保留子项所属分组。
it('[select.group.nested] nested options preserve group labels', () => {
  let dispose = () => {}
  try {
    createRoot(cleanup => {
      dispose = cleanup
      const onChange = vi.fn()
      const select = createSelect({
        options: [
          { label: '水果', options: [{ label: '苹果', value: 'apple' }, { label: '香蕉', value: 'banana' }] },
          { label: '饮料', options: [{ label: '茶', value: 'tea' }] },
        ],
        onChange,
      })
      expect(select.options().map(option => `${option.group}:${option.label}`)).toEqual(['水果:苹果', '水果:香蕉', '饮料:茶'])
      select.setSearchValue('茶'); flush()
      expect(select.filteredOptions().map(option => `${option.group}:${option.label}`)).toEqual(['饮料:茶'])
      select.selectOption('tea'); flush()
      expect(onChange).toHaveBeenCalledWith('tea')
    })
  } finally { dispose() }
})

// 平铺选项的 group 字段也应支持相邻项分组，而未分组项仍可选择。
it('[select.group.flat] flat group field remains selectable', () => {
  let dispose = () => {}
  try {
    createRoot(cleanup => {
      dispose = cleanup
      const select = createSelect({ options: [
        { label: '甲', value: 'a', group: '第一组' },
        { label: '乙', value: 'b', group: '第二组' },
        { label: '丙', value: 'c' },
      ] })
      expect(select.options().map(option => option.group)).toEqual(['第一组', '第二组', undefined])
      select.selectOption('b'); flush()
      expect(select.singleValue()).toBe('b')
    })
  } finally { dispose() }
})
