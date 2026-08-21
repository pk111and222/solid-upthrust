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
      return results
    },
  }
}
