import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Avatar, { AvatarGroup, type AvatarSize } from '../../../components/lib/Avatar'
import { mount } from '../../utils/mount'
let view: ReturnType<typeof mount>
afterEach(() => { view?.dispose(); vi.restoreAllMocks() })
// 外部类名必须传到真实根节点，头像组亦然。
it('[avatar.class] forwards both classes', () => {
  view = mount(() => <AvatarGroup class="team"><Avatar class="person">A</Avatar></AvatarGroup>)
  expect(view.host.querySelector('.team .person')).not.toBeNull()
})
// 图标是图片加载失败后的第一优先级，不能被文字抢占。
it('[avatar.image.priority] icon wins over children after failure', () => {
  view = mount(() => <Avatar src="/bad.png" icon={<b>icon</b>}>AB</Avatar>)
  view.host.querySelector('img')!.dispatchEvent(new Event('error')); flush()
  expect(view.host.textContent).toBe('icon')
})
// 失败只针对当前资源；更新 src 或 srcSet 后允许重新加载。
it('[avatar.image.retry] changing image source retries', () => {
  const [src, setSrc] = createSignal('/bad.png', { ownedWrite: true })
  view = mount(() => <Avatar src={src()}>AB</Avatar>)
  view.host.querySelector('img')!.dispatchEvent(new Event('error')); flush()
  setSrc('/good.png'); flush()
  expect(view.host.querySelector('img')?.getAttribute('src')).toBe('/good.png')
})
// 独立头像和固定尺寸组内的响应式成员都使用真实视口。
it('[avatar.responsive] standalone and member sizes track viewport', () => {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(400)
  view = mount(() => <><Avatar size={{ xs: 24, md: 60 }}>A</Avatar><AvatarGroup><Avatar size={{ xs: 24, md: 60 }}>B</Avatar></AvatarGroup></>)
  const boxes = () => [...view.host.querySelectorAll('span')].filter(el => el.style.width)
  expect(boxes().map(el => el.style.width)).toEqual(['24px', '24px'])
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(800); window.dispatchEvent(new Event('resize')); flush()
  expect(boxes().map(el => el.style.width)).toEqual(['60px', '60px'])
})
// 固定尺寸不监听 resize；切换尺寸类型、销毁时清理监听。
it('[avatar.responsive.cleanup] toggling responsive mode releases listeners', () => {
  const add = vi.spyOn(window, 'addEventListener'), remove = vi.spyOn(window, 'removeEventListener')
  const [size, setSize] = createSignal<AvatarSize>(40, { ownedWrite: true })
  view = mount(() => <Avatar size={size()}>A</Avatar>)
  const resizeCalls = () => add.mock.calls.filter(([name]) => name === 'resize')
  expect(resizeCalls()).toHaveLength(0)
  setSize({ xs: 24 }); flush(); expect(resizeCalls()).toHaveLength(1)
  setSize(40); flush(); expect(remove.mock.calls.some(([name, fn]) => name === 'resize' && fn === resizeCalls()[0][1])).toBe(true)
})
// JSX 不应该被强制转成对象字符串，字符截断不得切碎 Unicode 字符。
it('[avatar.children] preserves JSX and Unicode initials', () => {
  view = mount(() => <><Avatar><b>JSX</b></Avatar><Avatar maxCount={1}>A😀</Avatar><Avatar maxCount={0}>ABC</Avatar></>)
  expect(view.host.querySelector('b')?.textContent).toBe('JSX')
  expect(view.host.textContent).toBe('JSX😀')
})
// 计数表示可见头像个数，溢出按钮另占一位，零数量也不能负外边距。
it('[avatar.group.count] maxCount is the number of visible avatars', () => {
  view = mount(() => <AvatarGroup maxCount={2}><Avatar>A</Avatar><Avatar>B</Avatar><Avatar>C</Avatar><Avatar>D</Avatar></AvatarGroup>)
  expect(view.host.textContent).toBe('AB+2')
  expect(view.host.querySelector('button')?.getAttribute('aria-label')).toBe('查看其余 2 个头像')
})

// false 阻止自动回退，原始错误事件只传递一次。
it('[avatar.image.error] return false retains image', () => {
  const onError = vi.fn().mockReturnValue(false)
  view = mount(() => <Avatar src="/bad" srcSet="/bad-2x 2x" alt="name" onError={onError}>fallback</Avatar>)
  const img = view.host.querySelector('img')!, event = new Event('error')
  expect(img.alt).toBe('name'); expect(img.srcset).toBe('/bad-2x 2x')
  img.dispatchEvent(event); flush(); expect(onError).toHaveBeenCalledExactlyOnceWith(event); expect(view.host.querySelector('img')).toBe(img)
})
// srcSet 更新也会重试；空 src 直接采用字符回退。
it('[avatar.image.srcset] recovers when candidates change', () => {
  const [srcSet, setSrcSet] = createSignal('/bad 1x', { ownedWrite: true })
  view = mount(() => <Avatar src="/image" srcSet={srcSet()} alt="photo">字</Avatar>)
  view.host.querySelector('img')!.dispatchEvent(new Event('error')); flush(); expect(view.host.textContent).toBe('字')
  setSrcSet('/good 2x'); flush(); expect(view.host.querySelector('img')?.srcset).toBe('/good 2x')
})
// 外部回调同步更新资源时，旧资源错误不得污染新资源状态。
it('[avatar.image.race] onError can synchronously replace source', () => {
  const [src, setSrc] = createSignal('/bad', { ownedWrite: true })
  view = mount(() => <Avatar src={src()} onError={() => { setSrc('/good') }}>字</Avatar>)
  view.host.querySelector('img')!.dispatchEvent(new Event('error')); flush()
  expect(view.host.querySelector('img')?.getAttribute('src')).toBe('/good')
})
// size、颜色和 style 可动态覆盖，组默认值不掩盖成员显式设置。
it('[avatar.group.defaults] member overrides and group updates', () => {
  const [size, setSize] = createSignal(48, { ownedWrite: true })
  view = mount(() => <AvatarGroup size={size()} shape="square"><Avatar class="inherited">A</Avatar><Avatar class="explicit" size="small" shape="circle" color="red" textColor="blue" style={{ color: 'green' }}>B</Avatar></AvatarGroup>)
  const first = view.host.querySelector('.inherited') as HTMLElement, second = view.host.querySelector('.explicit') as HTMLElement
  expect(first.style.width).toBe('48px'); expect(first.className).toContain('rounded-lg')
  expect(second.style.width).toBe('28px'); expect(second.className).toContain('rounded-full'); expect(second.style.backgroundColor).toBe('red'); expect(second.style.color).toBe('green')
  setSize(60); flush(); expect(first.style.width).toBe('60px'); expect(second.style.width).toBe('28px')
})
// 零值、负值、小数、不限、空组及 children 变动具有稳定计数。
it.each([[0, '+3'], [-1, '+3'], [1.9, 'A+2'], [3, 'ABC'], [Infinity, 'ABC'], [undefined, 'ABC']] as const)('[avatar.group.limit.%s] normalizes counts', (maxCount, result) => {
  view = mount(() => <AvatarGroup maxCount={maxCount}><Avatar>A</Avatar><Avatar>B</Avatar><Avatar>C</Avatar></AvatarGroup>)
  expect(view.host.textContent).toBe(result)
  if (result === '+3') expect(view.host.querySelector('button')!.style.marginLeft).toBe('0px')
})
// 动态增加成员和调整数量后不会遗留旧的 +N。
it('[avatar.group.dynamic] handles empty and changing children', () => {
  const [names, setNames] = createSignal<string[]>([], { ownedWrite: true })
  const [count, setCount] = createSignal(1, { ownedWrite: true })
  view = mount(() => <AvatarGroup maxCount={count()}>{names().map(name => <Avatar>{name}</Avatar>)}</AvatarGroup>)
  expect(view.host.textContent).toBe(''); setNames(['A', 'B']); flush(); expect(view.host.textContent).toBe('A+1')
  setCount(2); flush(); expect(view.host.textContent).toBe('AB'); expect(view.host.querySelector('button')).toBeNull()
})
// 清理后所有当前 resize 监听均已移除。
it('[avatar.dispose] removes active responsive listeners', () => {
  const add = vi.spyOn(window, 'addEventListener'), remove = vi.spyOn(window, 'removeEventListener')
  view = mount(() => <AvatarGroup size={{ xs: 20 }}><Avatar>A</Avatar></AvatarGroup>); view.dispose()
  for (const [name, listener] of add.mock.calls.filter(([name]) => name === 'resize')) expect(remove).toHaveBeenCalledWith(name, listener)
})
// 已打开浮层后把可见数量降为零，四个成员都进入浮层，计数不能滞留。
it('[avatar.group.move] moves visible members into already mounted overflow', () => {
  const [count, setCount] = createSignal(2, { ownedWrite: true })
  view = mount(() => <AvatarGroup maxCount={count()} maxPopoverTrigger="click"><Avatar>A</Avatar><Avatar>B</Avatar><Avatar>C</Avatar><Avatar>D</Avatar></AvatarGroup>)
  view.host.querySelector('button')!.click(); flush()
  setCount(0); flush()
  expect(view.host.querySelector('button')?.textContent).toBe('+4')
  expect(document.querySelector('[role="dialog"]')?.textContent).toBe('ABCD')
  setCount(2); flush(); expect(view.host.textContent).toBe('AB+2')
  expect(document.querySelector('[role="dialog"]')?.textContent).toBe('CD')
  setCount(4); flush(); expect(view.host.textContent).toBe('ABCD')
  expect(document.querySelector('[role="dialog"]')).toBeNull()
})
