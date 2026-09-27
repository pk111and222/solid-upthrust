import { afterEach, expect, it } from 'vitest'
import Space, {
  Addon, Compact,
  type CompactProps, type SpaceAddonProps, type SpaceAlign, type SpaceCompactProps, type SpaceOrientation,
  type SpacePresetSize, type SpaceProps, type SpaceSemanticName, type SpaceSize,
} from '../../../components/lib/Space'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'

// 公开类型可从 barrel 取到，且与组件目录导出的类型一致（编译期校验）。
const preset: Public.SpacePresetSize = 'medium' satisfies SpacePresetSize
const size: Public.SpaceSize = 20 satisfies SpaceSize
const orientation: Public.SpaceOrientation = 'vertical' satisfies SpaceOrientation
const align: Public.SpaceAlign = 'baseline' satisfies SpaceAlign
const semantic: Public.SpaceSemanticName = 'separator' satisfies SpaceSemanticName
const props: Public.SpaceProps = { size: [preset, size], orientation, align, classNames: { [semantic]: 'x' } } satisfies SpaceProps
const compactProps: Public.SpaceCompactProps = { block: true } satisfies SpaceCompactProps
const legacyCompact: Public.CompactProps = compactProps satisfies CompactProps
const addonProps: Public.SpaceAddonProps = { title: 'unit' } satisfies SpaceAddonProps

let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })

// 静态子组件挂在 Space 上，且与具名导出、barrel 的 SpaceAddon/Compact 同一实现。
it('[space.exports.shape] Compact and Addon are attached statics', () => {
  const PublicSpace: typeof Public.Space = Space
  const PublicCompact: typeof Public.Compact = Compact
  const PublicAddon: typeof Public.SpaceAddon = Addon
  expect(PublicSpace.Compact).toBe(PublicCompact)
  expect(PublicSpace.Addon).toBe(PublicAddon)
})

// 公开组件真实挂载：每个子节点包一层 item，Compact/Addon 同时可用；卸载后宿主无残留。
it('[space.exports.mount] public Space, Compact and Addon mount and clean up', () => {
  const view = mount(() => (
    <>
      <Space {...props}><span>A</span><span>B</span></Space>
      <Space.Compact {...legacyCompact}><Space.Addon {...addonProps}>https://</Space.Addon><input /></Space.Compact>
    </>
  ))
  dispose = view.dispose
  const [space, compact] = [...view.host.children] as HTMLElement[]
  expect(space.className).toContain('flex-col')
  expect(space.querySelectorAll(':scope > .space-item')).toHaveLength(2)
  expect(space.style.rowGap).toBe('20px')
  expect(compact.firstElementChild?.getAttribute('title')).toBe('unit')
  expect(compact.textContent).toBe('https://')
  view.dispose(); dispose = () => {}
  expect(view.host.isConnected).toBe(false)
  expect(view.host.childNodes).toHaveLength(0)
})
