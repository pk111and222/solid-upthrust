import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it } from 'vitest'
import { Text, Title, Paragraph, Link } from '../../../components/lib/Typography'
import { mount } from '../../utils/mount'
let view: ReturnType<typeof mount>
afterEach(() => view?.dispose())
// disabled 必须真正禁止导航与键盘访问。
it('[typography.link.disabled] disables navigation', () => {
  view = mount(() => <Link href="/next" disabled>链接</Link>)
  const link = view.host.querySelector('a')!
  expect(link.hasAttribute('href')).toBe(false)
  expect(link.getAttribute('aria-disabled')).toBe('true')
  expect(link.tabIndex).toBe(-1)
})
// 公开基类中声明的复制、编辑和省略能力在 Link 上同样生效。
it('[typography.link.actions] wires inherited props', () => {
  view = mount(() => <Link href="/next" copyable editable ellipsis={{ rows: 2 }}>链接</Link>)
  expect(view.host.querySelectorAll('button')).toHaveLength(2)
  expect(view.host.querySelector('a')!.style.getPropertyValue('-webkit-line-clamp')).toBe('2')
})
// 对象形式缺省行数和 rows=1 都要提供单行截断。
it('[typography.ellipsis.single] object ellipsis handles one row', () => {
  view = mount(() => <><Text ellipsis={{}}>text</Text><Paragraph ellipsis={{ rows: 1 }}>paragraph</Paragraph></>)
  expect(view.host.children[0].className).toContain('text-ellipsis')
  expect(view.host.children[1].className).toContain('text-ellipsis')
})
// 标题不能被默认色覆盖，动态装饰和级别也必须更新。
it('[typography.title.dynamic] preserves semantic colors and changes level', () => {
  const [level, setLevel] = createSignal<1 | 3>(1, { ownedWrite: true })
  view = mount(() => <Title level={level()} type="danger" strong>标题</Title>)
  expect(view.host.querySelector('h1')!.className).toContain('text-error')
  setLevel(3); flush(); expect(view.host.querySelector('h3 strong')?.textContent).toBe('标题')
})

// 每个装饰属性渲染对应的语义标签，关掉属性时移除标签。
it.each([['strong', 'strong'], ['italic', 'em'], ['underline', 'u'], ['delete', 'del'], ['code', 'code'], ['mark', 'mark'], ['keyboard', 'kbd']] as const)('[typography.decoration.%s] updates semantic tags', (prop, tag) => {
  const [active, setActive] = createSignal(true, { ownedWrite: true })
  view = mount(() => <Text {...{ get [prop]() { return active() } }}>content</Text>)
  expect(view.host.querySelector(tag)?.textContent).toBe('content')
  setActive(false); flush(); expect(view.host.querySelector(tag)).toBeNull(); expect(view.host.textContent).toBe('content')
})
// 每种语义色在 Text/Title/Paragraph/Link 上都保留，不被默认字号和颜色覆盖。
it.each([['secondary', 'text-on-surface-variant'], ['success', 'text-green-600'], ['warning', 'text-amber-500'], ['danger', 'text-error']] as const)('[typography.type.%s] preserves color across variants', (type, token) => {
  view = mount(() => <><Text type={type}>text</Text><Title type={type}>title</Title><Paragraph type={type}>paragraph</Paragraph><Link type={type}>link</Link></>)
  for (const el of view.host.children) expect(el.className).toContain(token)
})
// 五个级别对应原生标题节点和各自的字号 token。
it.each([1, 2, 3, 4, 5] as const)('[typography.title.level.%s] exposes heading semantics', level => {
  view = mount(() => <Title level={level}>title</Title>)
  expect(view.host.querySelector(`h${level}`)?.className).toContain(`text-heading-${level}`)
})
// 任意 children、样式和类名更新保留在公开根节点。
it('[typography.attributes] dynamic children, classes and custom styles win', () => {
  const [text, setText] = createSignal('first', { ownedWrite: true })
  view = mount(() => <Paragraph class="custom mb-0" style={{ color: 'red', 'margin-bottom': '2px' }}>{text()}</Paragraph>)
  const el = view.host.firstElementChild as HTMLElement
  expect(el.className).toContain('custom'); expect(el.style.color).toBe('red'); expect(el.style.marginBottom).toBe('2px')
  setText('next'); flush(); expect(el.textContent).toBe('next')
})
// 新窗口自动安全 rel，显式 rel 保留；禁用动态切换恢复 href。
it('[typography.link.attributes] preserves explicit rel and toggles disabled', () => {
  const [disabled, setDisabled] = createSignal(true, { ownedWrite: true })
  view = mount(() => <><Link href="/next" target="_blank" disabled={disabled()}>one</Link><Link target="_blank" rel="nofollow">two</Link></>)
  const [first, second] = view.host.querySelectorAll('a')
  expect(first.rel).toBe('noopener noreferrer'); expect(second.rel).toBe('nofollow')
  setDisabled(false); flush(); expect(first.getAttribute('href')).toBe('/next'); expect(first.hasAttribute('aria-disabled')).toBe(false)
})
// 省略行数与开关动态变化时清除旧裁剪属性。
it('[typography.ellipsis.dynamic] clears multi-line styles when disabled', () => {
  const [ellipsis, setEllipsis] = createSignal<boolean | { rows: number }>({ rows: 3 }, { ownedWrite: true })
  view = mount(() => <Paragraph ellipsis={ellipsis()}>long text</Paragraph>)
  const el = view.host.firstElementChild as HTMLElement
  expect(el.style.getPropertyValue('-webkit-line-clamp')).toBe('3')
  setEllipsis(true); flush(); expect(el.className).toContain('whitespace-nowrap'); expect(el.style.getPropertyValue('-webkit-line-clamp')).toBe('')
  setEllipsis(false); flush(); expect(el.className).not.toContain('whitespace-nowrap')
})
