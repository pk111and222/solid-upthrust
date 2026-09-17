import { expect, it } from 'vitest'
import createTheme from '../../../preset/src/theme'
// 主题必须生成完整调色板，不能把颜色解析失败静默变成空主题。
it('[preset.color.invalid] 无效种子颜色提供明确错误', () => {
  expect(() => createTheme({prefix:'--test',selectors:{},theme:{},colors:'not-a-color'})).toThrow('Invalid theme color')
})
