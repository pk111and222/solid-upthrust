import { expect, it } from 'vitest'
import { resolveAvatarSize } from '../../../competence/src/avatar'
// 命名档位保持本库既有尺寸，非法数值回退 middle。
it.each([[undefined, 40], ['small', 28], ['middle', 40], ['large', 64], [52, 52], [0, 40], [-1, 40], [NaN, 40], [Infinity, 40]] as const)('[avatar.size] resolves %s to %s', (size, px) => {
  expect(resolveAvatarSize(size, 1000)).toBe(px)
})
// 每个断点在边界前后采用最近已配置档位；不合成意外的默认尺寸。
it.each([[575, 20], [576, 30], [767, 30], [768, 40], [991, 40], [992, 50], [1199, 50], [1200, 60], [1599, 60], [1600, 70]])('[avatar.breakpoints] width %s maps to %s', (width, px) => {
  expect(resolveAvatarSize({ xs: 20, sm: 30, md: 40, lg: 50, xl: 60, xxl: 70 }, width)).toBe(px)
})
// 稀疏对象和空对象采用明示值或 middle 回退。
it('[avatar.sparse] uses only configured sizes', () => {
  expect(resolveAvatarSize({ xs: 22, lg: 80 }, 800)).toBe(22)
  expect(resolveAvatarSize({ md: 64 }, 400)).toBe(40)
  expect(resolveAvatarSize({}, 1600)).toBe(40)
})
