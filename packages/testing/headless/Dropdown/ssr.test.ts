// @vitest-environment node
import { createRoot } from 'solid-js'
import { expect, it } from 'vitest'
import { createDropdown } from '../../../competence/src/dropdown'

// 旧兼容导出仍是公开 API，服务器无 document 时也能创建关闭状态并销毁。
it('[dropdown.legacy.ssr] initializes without browser globals', () => {
  let dispose = () => {}
  try {
    createRoot(cleanup => {
      dispose = cleanup
      expect(createDropdown().open()).toBe(false)
    })
  } finally { dispose() }
})
