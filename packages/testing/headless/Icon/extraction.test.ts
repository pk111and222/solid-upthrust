import { expect, it } from 'vitest'
import { extractorIcons } from '../../../preset/src/extractors/icons'

// 简写名称也必须生成图标类，否则示例有 DOM 却没有实际图形。
it('[icon.name.extraction] 提取完整名称和静态简写', async () => {
  const extract = extractorIcons().extract!
  const result = await extract({ code: '<Icon name="home" /><Icon name={\'account\'} /><Icon name="mdi:star" />', id: 'demo.tsx', original: '', extracted: new Set() })
  expect([...result!]).toEqual(expect.arrayContaining(['i-mdi-home', 'i-mdi-account', 'i-mdi-star']))
})
