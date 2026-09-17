import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import { skeletonElementClass } from '../../../components/lib/Skeleton/styles'
// 动画渐变必须引用主题变量，不能固定为浅色；减少动态偏好也应生成停动画规则。
it('[skeleton.theme.wave] uses theme colors and reduced motion',async()=>{
  const uno=await createGenerator({presets:[presetWind4(),presetUpthrust()]})
  const {css}=await uno.generate(skeletonElementClass({active:true}))
  expect(css).toMatch(/background-image:[^;]*var\(--upthrust-colors-outline-variant\)/)
  expect(css).toContain('prefers-reduced-motion: reduce')
})
