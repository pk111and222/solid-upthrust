// @vitest-environment node
import { createRoot } from 'solid-js'
import { expect, it } from 'vitest'
import { createTrigger } from '../../../../competence/src/trigger'
// SSR 创建菜单触发器时没有 document/window，不能注册浏览器监听。
it('[trigger.ssr.initialize] 无 DOM 环境可初始化与清理', () => {
  let dispose = () => {}
  try {
    createRoot(cleanup => {
      dispose = cleanup
      const trigger = createTrigger({action:'click'})
      expect(trigger.open()).toBe(false)
    })
  } finally { dispose() }
})
