import { createSignal, flush } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Empty, { PRESENTED_IMAGE_DEFAULT, PRESENTED_IMAGE_SIMPLE } from '../../../components/lib/Empty'
import { mount } from '../../utils/mount'

let view: ReturnType<typeof mount>
afterEach(() => view?.dispose())
const root = (host: Element = view.host) => host.firstElementChild as HTMLElement
const parts = (el: HTMLElement) => [...el.children] as HTMLElement[]
const classes = (el: Element) => el.className.split(/\s+/)

describe('Empty DOM contracts', () => {
  // 默认：图片区（100px、下边距 8px、antd 6 默认插画）+ 描述「暂无数据」，无底部区；根节点居中、左右 8px。
  it('[empty.default] default illustration and description', () => {
    view = mount(() => <Empty />)
    const [image, description, ...others] = parts(root())
    expect(others).toEqual([])
    expect(classes(root())).toEqual(expect.arrayContaining(['mx-[8px]', 'text-[14px]', 'leading-[1.5714]', 'text-center']))
    expect(classes(root())).not.toContain('my-[32px]')
    expect(classes(image)).toEqual(expect.arrayContaining(['h-[100px]', 'mb-[8px]']))
    const svg = image.querySelector('svg')!
    expect([svg.dataset.emptyImage, svg.getAttribute('width'), svg.getAttribute('height'), svg.querySelector('title')?.textContent]).toEqual(['default', '184', '152', '暂无数据'])
    expect(description.textContent).toBe('暂无数据')
    expect(classes(description)).toContain('text-on-surface/45')
  })

  // 简洁插画：组件形式与 <PRESENTED_IMAGE_SIMPLE /> 节点形式都切换为 normal 样式（纵向 32px、图片高 40px、描述色）。
  it('[empty.simple] simple illustration switches to the normal layout', () => {
    view = mount(() => <>
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      <Empty image={<PRESENTED_IMAGE_SIMPLE />} />
      <Empty image={PRESENTED_IMAGE_DEFAULT} />
    </>)
    const [a, b, c] = [...view.host.children] as HTMLElement[]
    for (const el of [a, b]) {
      expect(classes(el)).toEqual(expect.arrayContaining(['my-[32px]', 'text-on-surface/45']))
      expect(classes(parts(el)[0])).toContain('h-[40px]')
      expect(classes(parts(el)[0])).not.toContain('h-[100px]')
      const svg = el.querySelector('svg')!
      expect([svg.dataset.emptyImage, svg.getAttribute('width'), svg.getAttribute('height')]).toEqual(['simple', '64', '41'])
    }
    expect(c.querySelector('svg')!.dataset.emptyImage).toBe('default')
    expect(classes(c)).not.toContain('my-[32px]')
  })

  // 字符串图片渲染 img：不可拖拽，alt 取字符串描述，描述为节点或关闭时为 'empty'；不切换简洁样式。
  it('[empty.image.src] string image renders an img with antd alt rules', () => {
    view = mount(() => <>
      <Empty image="/empty.svg" description="没有订单" />
      <Empty image="/empty.svg" description={<b>节点</b>} />
      <Empty image="/empty.svg" description={false} />
      <Empty image="/empty.svg" />
    </>)
    const imgs = [...view.host.querySelectorAll('img')]
    expect(imgs.map(img => img.getAttribute('src'))).toEqual(['/empty.svg', '/empty.svg', '/empty.svg', '/empty.svg'])
    expect(imgs.map(img => img.getAttribute('alt'))).toEqual(['没有订单', 'empty', 'empty', '暂无数据'])
    expect(imgs.every(img => img.getAttribute('draggable') === 'false')).toBe(true)
    expect(classes(root())).not.toContain('my-[32px]')
    expect(classes(imgs[0].parentElement!)).toContain('h-[100px]')
  })

  // image：null / undefined 回落默认插画，false 不渲染图片区域；自定义节点原样渲染且只创建一次。
  it('[empty.image.fallback] null, false and custom nodes', () => {
    const created = vi.fn()
    const Custom = (): JSX.Element => { created(); return <i data-custom /> }
    view = mount(() => <>
      <Empty image={null} />
      <Empty image={undefined} />
      <Empty image={false} />
      <Empty image={<Custom />} />
    </>)
    const [a, b, c, d] = [...view.host.children] as HTMLElement[]
    expect(a.querySelector('svg')!.dataset.emptyImage).toBe('default')
    expect(b.querySelector('svg')!.dataset.emptyImage).toBe('default')
    expect(parts(c).map(el => el.textContent)).toEqual(['暂无数据'])
    expect(c.querySelector('svg')).toBeNull()
    expect(parts(d)[0].querySelector('[data-custom]')).not.toBeNull()
    expect(created).toHaveBeenCalledTimes(1)
  })

  // 描述：false / null / '' 不渲染区域，0 与节点仍渲染；底部区只在 children 可渲染时出现，0 同样渲染。
  it('[empty.description.footer] renderable rules for description and footer', () => {
    view = mount(() => <>
      <Empty description={false} />
      <Empty description={null} />
      <Empty description="" />
      <Empty description={0} />
      <Empty description={<span>自定义</span>}>{0}</Empty>
      <Empty>{false}</Empty>
      <Empty><button type="button">立即创建</button></Empty>
    </>)
    const els = [...view.host.children] as HTMLElement[]
    for (const el of els.slice(0, 3)) expect(parts(el)).toHaveLength(1)
    expect(parts(els[3])[1].textContent).toBe('0')
    const [, desc, footer] = parts(els[4])
    expect(desc.innerHTML).toBe('<span>自定义</span>')
    expect(footer.textContent).toBe('0')
    expect(classes(footer)).toContain('mt-[16px]')
    expect(parts(els[5])).toHaveLength(2)
    expect(parts(els[6])[2].querySelector('button')?.textContent).toBe('立即创建')
  })

  // 语义化：classNames / styles 作用到四个节点；class/style 合并到根；imageStyle 兼容且被 styles.image 覆盖；其余属性透传。
  it('[empty.semantic] classNames, styles, deprecated imageStyle and attrs', () => {
    const onClick = vi.fn()
    view = mount(() => <Empty
      id="empty-1" aria-label="空" data-kind="list" onClick={onClick}
      class="root-a" style={{ color: 'red' }}
      imageStyle={{ height: '60px', opacity: '0.5' }}
      classNames={{ root: 'root-b', image: 'img-c', description: 'desc-c', footer: 'foot-c' }}
      styles={{ root: { color: 'blue', margin: '4px' }, image: { height: '80px' }, description: { 'font-weight': 'bold' }, footer: { padding: '2px' } }}
    >底部</Empty>)
    const el = root()
    const [image, description, footer] = parts(el)
    expect([el.id, el.getAttribute('aria-label'), el.dataset.kind]).toEqual(['empty-1', '空', 'list'])
    expect(classes(el)).toEqual(expect.arrayContaining(['root-a', 'root-b']))
    expect([el.style.color, el.style.margin]).toEqual(['red', '4px'])
    expect(classes(image)).toContain('img-c'); expect([image.style.height, image.style.opacity]).toEqual(['80px', '0.5'])
    expect(classes(description)).toContain('desc-c'); expect(description.style.fontWeight).toBe('bold')
    expect(classes(footer)).toContain('foot-c'); expect(footer.style.padding).toBe('2px')
    el.click(); expect(onClick).toHaveBeenCalledTimes(1)
  })

  // 响应式：image 在默认 / 简洁 / 地址 / false 之间切换，样式与结构同步；描述切换同步 alt。
  it('[empty.reactive] image and description updates', () => {
    const [image, setImage] = createSignal<JSX.Element | string | false | (() => JSX.Element) | undefined>(undefined, { ownedWrite: true })
    const [description, setDescription] = createSignal<JSX.Element>('初始', { ownedWrite: true })
    view = mount(() => <Empty image={image() as never} description={description()} />)
    expect(root().querySelector('svg')!.dataset.emptyImage).toBe('default')
    setImage(() => PRESENTED_IMAGE_SIMPLE); flush()
    expect(root().querySelector('svg')!.dataset.emptyImage).toBe('simple')
    expect(classes(root())).toContain('my-[32px]')
    setImage('/a.png'); flush()
    expect(root().querySelector('img')!.alt).toBe('初始')
    expect(classes(root())).not.toContain('my-[32px]')
    setDescription('更新'); flush()
    expect(root().querySelector('img')!.alt).toBe('更新')
    expect(parts(root())[1].textContent).toBe('更新')
    setImage(false); flush()
    expect(parts(root()).map(el => el.textContent)).toEqual(['更新'])
  })
})
