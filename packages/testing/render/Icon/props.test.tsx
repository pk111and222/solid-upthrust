import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Icon, { toIconClass, type IconProps } from '../../../components/lib/Icon'
import { mount } from '../../utils/mount'
let cleanup = () => {}
afterEach(() => cleanup())
function icon(props: IconProps) { const view = mount(() => <Icon {...props} />); cleanup = view.dispose; return view.host.querySelector('span')! }

// 基础入口与名称转换覆盖默认集合及带连字符的集合名。
it('[icon.name.dom] 默认图标节点与集合名称', () => {
  const el = icon({ name: 'home' })
  expect(el.classList.contains('i-mdi-home')).toBe(true)
  expect(el.classList.contains('text-[16px]')).toBe(true)
  expect(el.classList.contains('text-current')).toBe(true)
  expect(toIconClass('material-symbols:15mp-outline')).toBe('i-material-symbols-15mp-outline')
})
// 每个尺寸分支都验证真实 DOM，包括零值与 CSS 长度。
it.each([['small', '14'], ['middle', '16'], ['large', '20'], [0, '0px'], [28, '28px'], ['2rem', '2rem']] as const)('[icon.size.dom] 尺寸 %s', (size, expected) => {
  const el = icon({ name: 'mdi:home', size })
  if (typeof size === 'string' && ['small', 'middle', 'large'].includes(size)) expect(el.classList.contains(`text-[${expected}px]`)).toBe(true)
  else expect(el.style.fontSize).toBe(expected)
})
// 颜色和动画交叉覆盖，避免某一变体覆盖另一变体。
it.each([['primary','text-primary'],['secondary','text-on-surface-variant'],['success','text-green-600'],['warning','text-amber-600'],['danger','text-error'],['inherit','text-current']] as const)('[icon.color.spin] 颜色 %s 与旋转动画', (color, cls) => {
  const el = icon({ name: 'mdi:loading', color, spin: true, rotate: 90 })
  expect(el.classList.contains(cls)).toBe(true); expect(el.classList.contains('animate-spin')).toBe(true)
  expect(el.style.transform).toBe('rotate(90deg)')
})
// size/rotate 优先于 style；普通样式与点击事件保留。
it('[icon.style.event] 样式覆盖和点击回调', () => {
  const onClick = vi.fn()
  const el = icon({ name:'mdi:star', size:24, rotate:-90, class:'custom', style:{ 'font-size':'50px', transform:'scale(2)', opacity:0.5 }, onClick })
  expect(el.style.fontSize).toBe('24px'); expect(el.style.transform).toBe('rotate(-90deg)'); expect(el.style.opacity).toBe('0.5')
  expect(el.classList.contains('custom')).toBe(true); el.click(); expect(onClick).toHaveBeenCalledOnce(); expect(onClick.mock.calls[0][0]).toBeInstanceOf(MouseEvent)
})
// 响应式 props 更新不得保留旧名称、动画或尺寸样式。
it('[icon.reactive.dom] 更新后移除旧属性', () => {
  const [props, set] = createSignal<IconProps>({ name:'mdi:star', size:24, spin:true, rotate:90 }, { ownedWrite:true })
  const view = mount(() => <Icon {...props()} />); cleanup = view.dispose
  const el = view.host.querySelector('span')!
  set({ name:'mdi:home', size:'small', spin:false, rotate:0, style:{ transform:'scale(2)' } }); flush()
  expect(view.host.querySelector('span')).toBe(el); expect(el.classList.contains('i-mdi-star')).toBe(false)
  expect(el.classList.contains('animate-spin')).toBe(false); expect(el.style.fontSize).toBe(''); expect(el.style.transform).toBe('scale(2)')
})
