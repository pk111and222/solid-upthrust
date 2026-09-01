import { createRoot, flush } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { createWatermark } from './watermark'

describe('createWatermark', () => {
  it('builds an SVG data-URI tile with encoded content', () => {
    createRoot((dispose) => {
      const wm = createWatermark({ content: '水印' })
      flush()
      const tile = wm.tile()
      expect(tile.backgroundImage).toMatch(/^url\("data:image\/svg\+xml,/)
      // Chinese text is percent-encoded
      expect(tile.backgroundImage).toContain(encodeURIComponent('水印'))
      // Default tile: max(gap=100, 120) × max(gap=100, 64)
      expect(tile.backgroundSize).toBe('120px 100px')
      dispose()
    })
  })

  it('multi-line content produces one <text> per line', () => {
    createRoot((dispose) => {
      const wm = createWatermark({ content: ['a', 'b', 'c'] })
      flush()
      expect(wm.lines()).toEqual(['a', 'b', 'c'])
      // Decode and count text nodes
      const uri = wm.tile().backgroundImage
      const svg = decodeURIComponent(uri.slice('url("data:image/svg+xml,'.length, -2))
      expect((svg.match(/<text/g) || []).length).toBe(3)
      // Middle line has dy 0; outer lines ±1.2em
      expect(svg).toContain('dy="1.2em"')
      expect(svg).toContain('dy="-1.2em"')
      expect(svg).toContain('dy="0em"')
      dispose()
    })
  })

  it('escapes XML specials in content', () => {
    createRoot((dispose) => {
      const wm = createWatermark({ content: '<script>"&</script>' })
      flush()
      const uri = wm.tile().backgroundImage
      const svg = decodeURIComponent(uri.slice('url("data:image/svg+xml,'.length, -2))
      expect(svg).not.toContain('<script>')
      expect(svg).toContain('&lt;script&gt;')
      dispose()
    })
  })

  it('applies rotate, opacity, gap and font options', () => {
    createRoot((dispose) => {
      const wm = createWatermark({ content: 'x', rotate: 45, opacity: 0.5, gap: [200, 100], fontSize: 20, fontColor: '#333' })
      flush()
      const uri = wm.tile().backgroundImage
      const svg = decodeURIComponent(uri.slice('url("data:image/svg+xml,'.length, -2))
      expect(svg).toContain('rotate(45 ')
      expect(svg).toContain('opacity="0.5"')
      expect(svg).toContain('font-size="20px"')
      expect(svg).toContain('fill="#333"')
      // Explicit color overrides the currentColor default
      // width/height default to max(gap, 120/64)
      expect(wm.tile().width).toBe(200)
      expect(wm.tile().height).toBe(100)
      expect(wm.tile().backgroundSize).toBe('200px 100px')
      dispose()
    })
  })

  it('default rotate is -22 (antd parity)', () => {
    createRoot((dispose) => {
      const wm = createWatermark({ content: 'x' })
      flush()
      expect(wm.tile().rotate).toBe(-22)
      dispose()
    })
  })

  it('default fill is currentColor so the tile follows the theme', () => {
    createRoot((dispose) => {
      const wm = createWatermark({ content: 'x' })
      flush()
      const uri = wm.tile().backgroundImage
      const svg = decodeURIComponent(uri.slice('url("data:image/svg+xml,'.length, -2))
      expect(svg).toContain('fill="currentColor"')
      dispose()
    })
  })
})
