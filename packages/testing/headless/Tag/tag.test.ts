import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createCheckableTag, createCheckableTagGroup, createTag, normalizeCheckableTagOptions } from '../../../competence/src/tag'

describe('Tag interactions', () => {
  // onClose 中 preventDefault 可取消关闭；否则只关闭一次，已关闭后不再回调。
  it('allows a consumer to cancel close and closes once otherwise', () => createRoot(() => {
    const onClose = vi.fn((event: MouseEvent) => event.preventDefault())
    const tag = createTag({ onClose })
    tag.close(new MouseEvent('click', { cancelable: true })); flush()
    expect(tag.visible()).toBe(true)
    onClose.mockImplementation(() => {})
    tag.close(new MouseEvent('click')); flush()
    expect(tag.visible()).toBe(false)
    tag.close(new MouseEvent('click')); flush()
    expect(onClose).toHaveBeenCalledTimes(2)
  }))
  // 禁用时关闭与切换均无效，也不回调。
  it('ignores close and toggle on disabled tags', () => createRoot(() => {
    const onClose = vi.fn(), onChange = vi.fn()
    const tag = createTag({ disabled: true, onClose })
    const checkable = createCheckableTag({ disabled: true, onChange })
    tag.close(new MouseEvent('click')); checkable.toggle(); flush()
    expect(tag.visible()).toBe(true)
    expect(checkable.checked()).toBe(false)
    expect(onClose).not.toHaveBeenCalled(); expect(onChange).not.toHaveBeenCalled()
  }))
  // 非受控可切换；受控值被父级拒绝时保持原值，但回调收到期望值。
  it('toggles an uncontrolled tag and preserves a rejected controlled change', () => createRoot(() => {
    const tag = createCheckableTag({ defaultChecked: true })
    tag.toggle(); flush(); expect(tag.checked()).toBe(false)
    const onChange = vi.fn()
    const controlled = createCheckableTag({ checked: false, onChange })
    controlled.toggle(); flush()
    expect(controlled.checked()).toBe(false); expect(onChange).toHaveBeenCalledWith(true)
  }))
  // 受控：接受的变更与外部更新都被读取。
  it('tracks accepted and external controlled updates', () => createRoot(() => {
    const [checked, setChecked] = createSignal(false, { ownedWrite: true })
    const tag = createCheckableTag({ get checked() { return checked() }, onChange: setChecked })
    tag.toggle(); flush(); expect(tag.checked()).toBe(true)
    setChecked(false); flush(); expect(tag.checked()).toBe(false)
  }))
  // 禁用时与 antd 一致不拦截冒泡；可用时阻止冒泡，且 href 标签关闭时阻止链接默认跳转。
  it('[tag.close.propagation] stopPropagation only when enabled, href prevents navigation', () => createRoot(() => {
    const disabledEvent = new MouseEvent('click', { cancelable: true })
    const stop = vi.spyOn(disabledEvent, 'stopPropagation')
    createTag({ disabled: true }).close(disabledEvent)
    expect(stop).not.toHaveBeenCalled()
    const linkEvent = new MouseEvent('click', { cancelable: true })
    const linkStop = vi.spyOn(linkEvent, 'stopPropagation')
    const link = createTag({ href: '#x' }); link.close(linkEvent); flush()
    expect(linkStop).toHaveBeenCalled(); expect(linkEvent.defaultPrevented).toBe(true); expect(link.visible()).toBe(false)
    const plainEvent = new MouseEvent('click', { cancelable: true })
    createTag().close(plainEvent)
    expect(plainEvent.defaultPrevented).toBe(false)
  }))
  // 同一批次连续切换非受控标签，第二次基于第一次的结果（同步镜像）。
  it('[tag.checkable.batch] consecutive toggles in one batch compose', () => createRoot(() => {
    const onChange = vi.fn()
    const tag = createCheckableTag({ onChange })
    tag.toggle(); tag.toggle(); flush()
    expect(onChange.mock.calls).toEqual([[true], [false]])
    expect(tag.checked()).toBe(false)
  }))
})

describe('CheckableTagGroup state', () => {
  // 原始值选项归一为 value/label，对象保持原样，非数组为空。
  it('[tag.group.options] normalizes primitive and object options', () => {
    const object = { value: 'b', label: 'B', class: 'x' }
    expect(normalizeCheckableTagOptions(['a', 1, object])).toEqual([{ value: 'a', label: 'a' }, { value: 1, label: 1 }, object])
    expect(normalizeCheckableTagOptions(undefined)).toEqual([])
  })
  // 单选：选中另一个替换；再次点击已选项取消为 null。
  it('[tag.group.single] single selection replaces and clears to null', () => createRoot(() => {
    const onChange = vi.fn()
    const group = createCheckableTagGroup<string>({ defaultValue: 'a', onChange })
    expect(group.isChecked('a')).toBe(true)
    group.change('b', true); flush()
    expect(group.value()).toBe('b'); expect(group.isChecked('a')).toBe(false)
    group.change('b', false); flush()
    expect(group.value()).toBeNull(); expect(onChange.mock.calls).toEqual([['b'], [null]])
  }))
  // 多选：追加、移除、重复选中不重复写入；同批次连续变更可组合。
  it('[tag.group.multiple] multiple selection appends and removes', () => createRoot(() => {
    const onChange = vi.fn()
    const group = createCheckableTagGroup<string>({ multiple: true, onChange })
    expect(group.value()).toEqual([])
    group.change('a', true); group.change('b', true); flush()
    expect(group.value()).toEqual(['a', 'b'])
    group.change('a', true); group.change('a', false); flush()
    expect(group.value()).toEqual(['b'])
    expect(onChange.mock.calls.at(-1)).toEqual([['b']])
  }))
  // 受控（含 null）：不写内部状态，只回调；外部更新后读取新值。
  it('[tag.group.controlled] controlled value including null', () => createRoot(() => {
    const [value, setValue] = createSignal<string | null>(null, { ownedWrite: true })
    const onChange = vi.fn()
    const group = createCheckableTagGroup<string>({ get value() { return value() }, defaultValue: 'a', onChange })
    expect(group.isChecked('a')).toBe(false)
    group.change('b', true); flush()
    expect(group.value()).toBeNull(); expect(onChange).toHaveBeenCalledWith('b')
    setValue('b'); flush()
    expect(group.isChecked('b')).toBe(true)
  }))
  // 禁用：变更被忽略，不回调。
  it('[tag.group.disabled] disabled group ignores changes', () => createRoot(() => {
    const onChange = vi.fn()
    const group = createCheckableTagGroup<number>({ multiple: true, defaultValue: [1], disabled: true, onChange })
    group.change(2, true); flush()
    expect(group.value()).toEqual([1]); expect(onChange).not.toHaveBeenCalled()
  }))
})
