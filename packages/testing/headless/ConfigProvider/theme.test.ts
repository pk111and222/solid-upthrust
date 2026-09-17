import type { ConfigProviderProps } from '../../../components/lib/ConfigProvider'
import { expect, expectTypeOf, it } from 'vitest'
import { themeStyle } from '../../../components/lib/ConfigProvider'
// B08 颜色解析的 C01 使用边界：空主题不生成变量。
it('[config-provider.theme.empty] 空主题与非法颜色', () => {
  expect(themeStyle()).toEqual({})
  expect(themeStyle({colors:{primary:'invalid'}})).toEqual({})
})
// 不同颜色语法的通道和透明度都写入 preset 消费的变量。
it.each([
  ['#f008','255 0 0',136/255],
  ['rgb(0 128 255 / 50%)','0 128 255',0.5],
  ['hsl(120, 100%, 50%)','0 255 0',1],
  ['transparent','0 0 0',0],
] as const)('[config-provider.theme.channels] 颜色 %s', (color,channels,alpha) => {
  const style = themeStyle({prefix:'--brand',colors:{onPrimary:color}})
  expect(style['--brand-colors-on-primary']).toBe(channels)
  expect(Number(style['--brand-colors-on-primary--alpha'])).toBeCloseTo(alpha)
  expect(style['--colors-on-primary']).toMatch(/^rgba?\(/)
})

// 无容器分支不允许局部样式，避免传入主题却没有 DOM 承载点。
it('[config-provider.wrapper.types] 无容器模式限制主题属性', () => {
  expectTypeOf<{wrapper:false;componentDisabled:true}>().toExtend<ConfigProviderProps>()
  expectTypeOf<{wrapper:false;theme:{colors:{primary:string}}}>().not.toExtend<ConfigProviderProps>()
  expectTypeOf<{wrapper:false;class:string}>().not.toExtend<ConfigProviderProps>()
})
