import { flush } from 'solid-js'
import { expect, it, vi } from 'vitest'
import Select from '../../../components/lib/Select'
import { mount } from '../../utils/mount'

// 分组标题只显示在相应选项前；点击子项仍提交值，过滤后空组不显示。
it('[select.group.render] headers follow visible grouped options', () => {
  const onChange = vi.fn()
  const view = mount(() => <Select defaultOpen showSearch virtual={false} onChange={onChange} options={[
    { label: '水果', options: [{ label: '苹果', value: 'apple' }, { label: '香蕉', value: 'banana' }] },
    { label: '饮料', options: [{ label: '茶', value: 'tea' }] },
  ]} />)
  try {
    expect([...document.querySelectorAll('[data-select-group]')].map(node => node.textContent)).toEqual(['水果', '饮料'])
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(3)
    const input = view.host.querySelector('input')!
    input.value = '茶'
    input.dispatchEvent(new Event('input', { bubbles: true })); flush()
    expect([...document.querySelectorAll('[data-select-group]')].map(node => node.textContent)).toEqual(['饮料'])
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(1)
    ;(document.querySelector('[role="option"]') as HTMLElement).click(); flush()
    expect(onChange).toHaveBeenCalledWith('tea')
  } finally { view.dispose() }
})
