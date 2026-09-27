import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CheckableTag, CheckableTagGroup, type CheckableTagOption } from '../../../components/lib/Tag'
import { mount } from '../../utils/mount'

let view: ReturnType<typeof mount>
afterEach(() => view?.dispose())
const click = (el: Element) => { el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); flush() }
const key = (el: Element, init: KeyboardEventInit) => {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event); flush(); return event
}
const boxes = () => [...view.host.querySelectorAll<HTMLElement>('[role="checkbox"]')]
const checked = () => boxes().map(el => el.getAttribute('aria-checked'))

describe('CheckableTag', () => {
  // antd 语义：role=checkbox + aria-checked，可聚焦；点击切换，onChange 先于 onClick。
  it('[tag.checkable.click] checkbox semantics and click order', () => {
    const order: string[] = []
    view = mount(() => <CheckableTag onChange={value => order.push(`change:${value}`)} onClick={() => order.push('click')}>A</CheckableTag>)
    const [box] = boxes()
    expect([box.tabIndex, box.getAttribute('aria-checked'), box.hasAttribute('aria-disabled')]).toEqual([0, 'false', false])
    click(box)
    expect(order).toEqual(['change:true', 'click'])
    expect(box.getAttribute('aria-checked')).toBe('true')
    expect(box.className).toContain('bg-primary')
  })

  // 键盘：Space 切换并阻止页面滚动；按住重复不切换；Enter 不切换；onKeyDown 阻止默认后不切换。
  it('[tag.checkable.keyboard] Space toggles, Enter and repeats do not', () => {
    const onChange = vi.fn()
    view = mount(() => <>
      <CheckableTag onChange={onChange}>A</CheckableTag>
      <CheckableTag onKeyDown={event => event.preventDefault()} onChange={onChange}>B</CheckableTag>
    </>)
    const [a, b] = boxes()
    const space = key(a, { key: ' ' })
    expect(space.defaultPrevented).toBe(true); expect(onChange).toHaveBeenLastCalledWith(true)
    key(a, { key: ' ', repeat: true }); key(a, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledTimes(1)
    key(b, { key: ' ' })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(checked()).toEqual(['true', 'false'])
  })

  // 禁用：aria-disabled、移出 Tab 序列、点击/键盘均不切换且不触发 onClick。
  it('[tag.checkable.disabled] disabled tag is inert', () => {
    const onChange = vi.fn(), onClick = vi.fn()
    view = mount(() => <><CheckableTag disabled onChange={onChange} onClick={onClick}>A</CheckableTag><CheckableTag disabled checked>B</CheckableTag></>)
    const [a, b] = boxes()
    expect([a.tabIndex, a.getAttribute('aria-disabled')]).toEqual([-1, 'true'])
    click(a); key(a, { key: ' ' })
    expect(onChange).not.toHaveBeenCalled(); expect(onClick).not.toHaveBeenCalled()
    expect(a.className).toContain('text-on-surface/25')
    expect(b.className).toContain('bg-on-surface/4')
  })

  // 受控：父级拒绝时保持；接受后更新。非受控 defaultChecked 生效。
  it('[tag.checkable.controlled] controlled and default states', () => {
    const [value, setValue] = createSignal(false, { ownedWrite: true })
    view = mount(() => <><CheckableTag checked={false}>R</CheckableTag><CheckableTag checked={value()} onChange={setValue}>C</CheckableTag><CheckableTag defaultChecked>D</CheckableTag></>)
    const [rejected, accepted] = boxes()
    click(rejected); click(accepted)
    expect(checked()).toEqual(['false', 'true', 'true'])
  })

  // 原生属性与 ref 透传；图标与文字分开并保持 7px 间距。
  it('[tag.checkable.attrs] attributes, ref and icon spacing', () => {
    let element: HTMLElement | undefined
    view = mount(() => <CheckableTag ref={el => { element = el }} data-id="x" aria-label="标签" class="own" style={{ color: 'red' }} icon={<i class="ic" />}>A</CheckableTag>)
    const [box] = boxes()
    expect(element).toBe(box)
    expect([box.dataset.id, box.getAttribute('aria-label'), box.style.color]).toEqual(['x', '标签', 'red'])
    expect(box.className).toContain('own')
    expect(box.querySelector('.ic')).not.toBeNull()
    expect(box.lastElementChild!.className).toContain('ms-[7px]')
  })
})

describe('CheckableTagGroup', () => {
  // 单选：原始值选项、默认值、切换和再次点击取消为 null。
  it('[tag.group.single.dom] single selection with primitive options', () => {
    const onChange = vi.fn()
    view = mount(() => <CheckableTagGroup options={['电影', '图书', 1]} defaultValue="图书" onChange={onChange} />)
    expect(boxes().map(el => el.textContent)).toEqual(['电影', '图书', '1'])
    expect(checked()).toEqual(['false', 'true', 'false'])
    click(boxes()[2])
    expect(onChange).toHaveBeenLastCalledWith(1); expect(checked()).toEqual(['false', 'false', 'true'])
    click(boxes()[2])
    expect(onChange).toHaveBeenLastCalledWith(null); expect(checked()).toEqual(['false', 'false', 'false'])
  })

  // 多选：返回数组，取消移除；Space 键同样生效。
  it('[tag.group.multiple.dom] multiple selection by click and keyboard', () => {
    const onChange = vi.fn()
    view = mount(() => <CheckableTagGroup multiple options={['a', 'b', 'c']} defaultValue={['a']} onChange={onChange} />)
    click(boxes()[1]); key(boxes()[2], { key: ' ' }); click(boxes()[0])
    expect(onChange.mock.calls).toEqual([[['a', 'b']], [['a', 'b', 'c']], [['b', 'c']]])
    expect(checked()).toEqual(['false', 'true', 'true'])
  })

  // 受控：只回调不自行改变；父级更新后同步；受控 null 表示无选中。
  it('[tag.group.controlled.dom] controlled value', () => {
    const [value, setValue] = createSignal<string | null>(null, { ownedWrite: true })
    const onChange = vi.fn()
    view = mount(() => <CheckableTagGroup options={['a', 'b']} value={value()} defaultValue="a" onChange={onChange} />)
    expect(checked()).toEqual(['false', 'false'])
    click(boxes()[1])
    expect(onChange).toHaveBeenCalledWith('b'); expect(checked()).toEqual(['false', 'false'])
    setValue('b'); flush()
    expect(checked()).toEqual(['false', 'true'])
  })

  // 禁用整组：每项禁用、不可切换。
  it('[tag.group.disabled.dom] disabled group', () => {
    const onChange = vi.fn()
    view = mount(() => <CheckableTagGroup disabled options={['a', 'b']} onChange={onChange} />)
    click(boxes()[0])
    expect(onChange).not.toHaveBeenCalled()
    expect(boxes().map(el => el.getAttribute('aria-disabled'))).toEqual(['true', 'true'])
  })

  // 语义化类名/样式：root 合并 class/style；item 与选项自身 class/style 合并（选项优先）；原生属性透传。
  it('[tag.group.semantic] root/item slots and option overrides', () => {
    const options: CheckableTagOption<string>[] = [{ value: 'a', label: <b>A</b>, class: 'opt', style: { color: 'red' } }, { value: 'b', label: 'B' }]
    view = mount(() => <CheckableTagGroup
      aria-label="兴趣" data-kind="topic" id="g"
      options={options}
      class="own" style={{ padding: '4px' }}
      classNames={{ root: 'root-x', item: 'item-x' }}
      styles={{ root: { margin: '2px' }, item: { color: 'blue', 'font-weight': '600' } }}
    />)
    const group = view.host.firstElementChild as HTMLElement
    expect([group.id, group.dataset.kind, group.getAttribute('aria-label')]).toEqual(['g', 'topic', '兴趣'])
    expect(group.className).toEqual(expect.stringContaining('root-x')); expect(group.className).toContain('own'); expect(group.className).toContain('flex-wrap')
    expect([group.style.padding, group.style.margin]).toEqual(['4px', '2px'])
    const [a, b] = boxes()
    expect(a.className).toContain('opt'); expect(a.className).toContain('item-x')
    expect([a.style.color, a.style.fontWeight, b.style.color]).toEqual(['red', '600', 'blue'])
    expect(a.querySelector('b')?.textContent).toBe('A')
  })

  // 数字 0 作为选项值/标签必须显示（Solid 2 rc 会丢弃唯一动态子节点的数字 0），且 0 可被选中。
  it('[tag.group.zero] zero option renders and selects', () => {
    const onChange = vi.fn()
    view = mount(() => <CheckableTagGroup options={[0, 1]} onChange={onChange} />)
    expect(boxes().map(el => el.textContent)).toEqual(['0', '1'])
    click(boxes()[0])
    expect(onChange).toHaveBeenCalledWith(0); expect(checked()).toEqual(['true', 'false'])
  })

  // 选项动态变化后重新渲染；已选值保持按值匹配。
  it('[tag.group.dynamic] options update', () => {
    const [options, setOptions] = createSignal(['a', 'b'], { ownedWrite: true })
    view = mount(() => <CheckableTagGroup multiple options={options()} defaultValue={['b']} />)
    setOptions(['b', 'c', 'd']); flush()
    expect(boxes().map(el => el.textContent)).toEqual(['b', 'c', 'd'])
    expect(checked()).toEqual(['true', 'false', 'false'])
  })
})
