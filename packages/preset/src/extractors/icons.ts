import type { Extractor } from '@unocss/core'

const ICON_ID_RE = /["'`]([a-z][a-z0-9]*(?:-[a-z0-9]+)*):([a-z0-9]+(?:-[a-z0-9]+)*)["'`]/g

export function extractorIcons(): Extractor {
  return {
    name: 'upthrust-icon-extractor',
    order: -1,
    extract({ code }) {
      const results = new Set<string>()
      let match: RegExpExecArray | null
      ICON_ID_RE.lastIndex = 0
      while ((match = ICON_ID_RE.exec(code)) !== null) {
        const collection = match[1]
        const name = match[2]
        results.add(`i-${collection}-${name}`)
      }
      // Icon 的 mdi 简写同样需要在构建期可见；动态名称仍需调用方 safelist。
      const shorthand = /<Icon\b[^>]*?\bname\s*=\s*(?:["']([a-z0-9]+(?:-[a-z0-9]+)*)["']|\{\s*["']([a-z0-9]+(?:-[a-z0-9]+)*)["']\s*\})/g
      while ((match = shorthand.exec(code)) !== null) {
        results.add(`i-mdi-${match[1] ?? match[2]}`)
      }
      return results
    },
  }
}
