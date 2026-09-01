import { createMemo } from "solid-js";

/**
 * Headless logic for Watermark — derives the tile options for the UI
 * layer: text layout (multi-line), font shorthand, and the repeating
 * background-image CSS value from an inline SVG data URI.
 *
 * The UI renders a full-size absolutely-positioned div whose background
 * repeats this tile; pointer events pass through by default.
 */

export type WatermarkConfig = {
  /** Watermark text; multi-line supported via array (antd: `content`). */
  content?: string | string[]
  /** Between 0 and 1, applied to the tile opacity. */
  opacity?: number
  zIndex?: number
  rotate?: number
  width?: number
  height?: number
  /** Tile gap, px. antd: [gapX, gapY]; single number applies to both. */
  gap?: number | [number, number]
  offset?: [number, number]
  /** CSS font shorthand pieces. */
  fontColor?: string
  fontSize?: number | string
  fontWeight?: number | string
  fontStyle?: string
  fontFamily?: string
}

export type WatermarkTile = {
  /** Full background-image value: url("data:image/svg+xml,...") */
  backgroundImage: string
  backgroundSize: string
  width: number
  height: number
  rotate: number
  zIndex: number
}

const escapeXml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

/** encodeURIComponent every char that breaks a data URI in CSS url(). */
const encodeDataUri = (svg: string): string =>
  encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22')

export const createWatermark = (config: WatermarkConfig = {}) => {
  const lines = createMemo((): string[] => {
    const c = config.content
    if (c === undefined) return ['']
    return Array.isArray(c) ? c : [c]
  })

  /**
   * Build the SVG tile. Pure — exported for tests.
   * Layout: gap×gap tile with the (possibly rotated) text centered; a
   * little overflow padding so rotated text doesn't clip.
   */
  const buildTile = (): WatermarkTile => {
    const gap = config.gap ?? 100
    const [gapX, gapY] = Array.isArray(gap) ? gap : [gap, gap]
    const width = config.width ?? Math.max(gapX, 120)
    const height = config.height ?? Math.max(gapY, 64)
    const rotate = config.rotate ?? -22
    const zIndex = config.zIndex ?? 9
    const opacity = config.opacity ?? 1
    const fontSize = typeof config.fontSize === 'number' ? `${config.fontSize}px` : (config.fontSize ?? '14px')
    const fontWeight = String(config.fontWeight ?? 'normal')
    const fontFamily = config.fontFamily ?? 'sans-serif'
    const fontStyle = config.fontStyle ?? 'normal'
    // Default 'currentColor' — the SVG tile then inherits the
    // container's text-* theme token, so the watermark adapts to light/dark
    // themes. Callers can pass a fixed color for antd's exact default look
    // (antd pins rgba(0,0,0,0.15) regardless of theme).
    const fontColor = config.fontColor ?? 'currentColor'

    const texts = lines().map((line, i) => {
      // Vertically center the multi-line block: offset each line from center.
      const lineHeight = 1.2
      const count = lines().length
      const dy = (i - (count - 1) / 2) * lineHeight
      return `<text x="50%" y="50%" dy="${dy}em" text-anchor="middle" dominant-baseline="middle" fill="${fontColor}" font-size="${fontSize}" font-weight="${fontWeight}" font-style="${fontStyle}" font-family="${fontFamily}">${escapeXml(line)}</text>`
    }).join('')

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g transform="rotate(${rotate} ${width / 2} ${height / 2})" opacity="${opacity}">${texts}</g></svg>`

    return {
      backgroundImage: `url("data:image/svg+xml,${encodeDataUri(svg)}")`,
      backgroundSize: `${width}px ${height}px`,
      width,
      height,
      rotate,
      zIndex,
    }
  }

  const tile = createMemo(buildTile)

  return { lines, tile }
}

export const watermarkSplits: (keyof WatermarkConfig)[] = [
  'content', 'opacity', 'zIndex', 'rotate', 'width', 'height', 'gap', 'offset',
  'fontColor', 'fontSize', 'fontWeight', 'fontStyle', 'fontFamily',
]
