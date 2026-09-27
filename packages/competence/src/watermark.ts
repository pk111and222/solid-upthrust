import { createMemo } from "solid-js";

/**
 * Headless logic for Watermark — antd 6 `components/watermark` 的纯逻辑移植：
 * 字体合并、多行内容展开、canvas 字体串、偏移换算出的水印层样式，以及
 * useClips 的旋转 + 交错平铺绘制（canvas 由调用方的 document 创建，无 JSX / 样式）。
 */

export interface WatermarkFont {
  color?: string
  fontSize?: number | string
  fontWeight?: 'normal' | 'lighter' | 'bold' | 'bolder' | number
  fontStyle?: 'none' | 'normal' | 'italic' | 'oblique'
  fontFamily?: string
  textAlign?: CanvasTextAlign
}

export interface WatermarkText { text: string; font?: WatermarkFont }
export type WatermarkContent = string | WatermarkText

export interface WatermarkContentLine { text: string; font: Required<WatermarkFont> }

export type WatermarkConfig = {
  zIndex?: number
  rotate?: number
  width?: number
  height?: number
  image?: string
  content?: WatermarkContent | WatermarkContent[]
  font?: WatermarkFont
  gap?: [number, number]
  offset?: [number, number]
}

/** antd 默认：colorFill、fontSizeLG、zIndexPopupBase - 1。 */
export const WATERMARK_DEFAULT_FONT: Required<WatermarkFont> = {
  color: 'rgba(0, 0, 0, 0.15)', fontSize: 16, fontWeight: 'normal', fontStyle: 'normal', fontFamily: 'sans-serif', textAlign: 'center',
}
export const WATERMARK_DEFAULT_Z_INDEX = 999
export const WATERMARK_DEFAULT_GAP = 100
export const WATERMARK_FONT_GAP = 3

/** 只保留已定义的字段，避免 `{ color: undefined }` 覆盖默认值（rc mergeProps 语义）。 */
const defined = <T extends object>(value: T | undefined): Partial<T> =>
  Object.fromEntries(Object.entries(value ?? {}).filter(([, v]) => v !== undefined)) as Partial<T>

export const mergeWatermarkFont = (font?: WatermarkFont): Required<WatermarkFont> => ({ ...WATERMARK_DEFAULT_FONT, ...defined(font) })

export const getWatermarkFontSize = (font: Required<WatermarkFont>, ratio = 1) => Number.parseFloat(String(font.fontSize)) * ratio

export const getWatermarkCanvasFont = (font: Required<WatermarkFont>, ratio = 1, lineHeight?: number) =>
  `${font.fontStyle} normal ${font.fontWeight} ${getWatermarkFontSize(font, ratio)}px${lineHeight === undefined ? '' : `/${lineHeight}px`} ${font.fontFamily}`

/** 内容展开为行：字符串沿用全局字体，`{ text, font }` 与全局字体合并；空值跳过（toList skipEmpty）。 */
export const getWatermarkContentLines = (
  content: WatermarkContent | WatermarkContent[] | undefined, font: Required<WatermarkFont>,
): WatermarkContentLine[] =>
  (Array.isArray(content) ? content : [content])
    .filter((item): item is WatermarkContent => item !== undefined && item !== null)
    .map(item => (typeof item === 'object'
      ? { text: item.text ?? '', font: { ...font, ...defined(item.font) } }
      : { text: item ?? '', font }))

/** 水印层样式：offset 超出 gap/2 的部分转为 left/top 位移并收缩宽高，其余进 background-position。 */
export const getWatermarkMarkStyle = (zIndex: number, gap: [number, number], offset?: [number, number]): Record<string, string | number> => {
  const [gapX, gapY] = gap
  const offsetLeft = offset?.[0] ?? gapX / 2
  const offsetTop = offset?.[1] ?? gapY / 2
  const style: Record<string, string | number> = {
    'z-index': zIndex, position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', 'pointer-events': 'none', 'background-repeat': 'repeat',
  }
  let left = offsetLeft - gapX / 2
  let top = offsetTop - gapY / 2
  if (left > 0) { style.left = `${left}px`; style.width = `calc(100% - ${left}px)`; left = 0 }
  if (top > 0) { style.top = `${top}px`; style.height = `calc(100% - ${top}px)`; top = 0 }
  style['background-position'] = `${left}px ${top}px`
  return style
}

/** 单个水印尺寸：图片默认 120×64；文字按测量宽度与字高累加（行间 3px）；无内容为 0。 */
export const getWatermarkMarkSize = (
  ctx: Pick<CanvasRenderingContext2D, 'font' | 'measureText'> | null,
  lines: WatermarkContentLine[], image?: string, width?: number, height?: number,
): [number, number] => {
  let w = 120
  let h = 64
  if (!image && ctx?.measureText) {
    if (lines.length) {
      const sizes = lines.map(({ text, font }) => {
        ctx.font = getWatermarkCanvasFont(font)
        const m = ctx.measureText(text)
        return [m.width, m.fontBoundingBoxAscent + m.fontBoundingBoxDescent]
      })
      w = Math.ceil(Math.max(...sizes.map(s => s[0])))
      h = Math.ceil(sizes.reduce((total, s) => total + s[1], 0)) + (lines.length - 1) * WATERMARK_FONT_GAP
    } else {
      w = 0
      h = 0
    }
  }
  return [width ?? w, height ?? h]
}

/** 旋转后内容矩形的包围盒（以中心为原点）。 */
export const getWatermarkRotatedBounds = (width: number, height: number, rotate: number) => {
  const angle = (Math.PI / 180) * Number(rotate)
  let left = 0, right = 0, top = 0, bottom = 0
  const hw = width / 2, hh = height / 2
  for (const [x, y] of [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]]) {
    const tx = x * Math.cos(angle) - y * Math.sin(angle)
    const ty = x * Math.sin(angle) + y * Math.cos(angle)
    left = Math.min(left, tx); right = Math.max(right, tx); top = Math.min(top, ty); bottom = Math.max(bottom, ty)
  }
  return { left, top, width: right - left, height: bottom - top }
}

const prepareCanvas = (doc: Document, width: number, height: number, ratio = 1) => {
  const canvas = doc.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const realWidth = width * ratio
  const realHeight = height * ratio
  canvas.setAttribute('width', `${realWidth}px`)
  canvas.setAttribute('height', `${realHeight}px`)
  ctx.save()
  return [ctx, canvas, realWidth, realHeight] as const
}

/**
 * antd useClips：绘制内容 → 旋转 → 裁出包围盒 → 交错平铺（一列 + 右侧上下半格错位两份）。
 * 返回 [dataURL, 平铺宽, 平铺高]（CSS 像素）。
 */
export const drawWatermarkClips = (
  doc: Document, content: WatermarkContentLine[] | HTMLImageElement, rotate: number, ratio: number,
  width: number, height: number, gapX: number, gapY: number,
): [string, number, number] => {
  const [ctx, canvas, contentWidth, contentHeight] = prepareCanvas(doc, width, height, ratio)
  if (Array.isArray(content)) {
    ctx.textBaseline = 'top'
    let top = 0
    for (const { text, font } of content) {
      ctx.font = getWatermarkCanvasFont(font, ratio, height)
      ctx.fillStyle = font.color
      ctx.textAlign = font.textAlign
      ctx.fillText(text, contentWidth / 2, top)
      top += getWatermarkFontSize(font, ratio) + WATERMARK_FONT_GAP * ratio
    }
  } else {
    ctx.drawImage(content, 0, 0, contentWidth, contentHeight)
  }

  const angle = (Math.PI / 180) * Number(rotate)
  const maxSize = Math.max(width, height)
  const [rCtx, rCanvas, realMaxSize] = prepareCanvas(doc, maxSize, maxSize, ratio)
  rCtx.translate(realMaxSize / 2, realMaxSize / 2)
  rCtx.rotate(angle)
  if (contentWidth > 0 && contentHeight > 0) rCtx.drawImage(canvas, -contentWidth / 2, -contentHeight / 2)

  const bounds = getWatermarkRotatedBounds(contentWidth, contentHeight, rotate)
  const cutLeft = bounds.left + realMaxSize / 2
  const cutTop = bounds.top + realMaxSize / 2
  const realGapX = gapX * ratio
  const realGapY = gapY * ratio
  const filledWidth = (bounds.width + realGapX) * 2
  const filledHeight = bounds.height + realGapY
  const [fCtx, fCanvas] = prepareCanvas(doc, filledWidth, filledHeight)
  const drawImg = (x = 0, y = 0) => {
    if (bounds.width <= 0 || bounds.height <= 0) return
    fCtx.drawImage(rCanvas, cutLeft, cutTop, bounds.width, bounds.height, x, y, bounds.width, bounds.height)
  }
  drawImg()
  drawImg(bounds.width + realGapX, -bounds.height / 2 - realGapY / 2)
  drawImg(bounds.width + realGapX, +bounds.height / 2 + realGapY / 2)
  return [fCanvas.toDataURL(), filledWidth / ratio, filledHeight / ratio]
}

/** 被移除的节点或被改属性的节点是水印元素时需要重绘（antd reRendering）。 */
export const watermarkNeedsRerender = (mutation: MutationRecord, isWatermark: (node: Node) => boolean) =>
  (mutation.removedNodes.length > 0 && Array.from(mutation.removedNodes).some(isWatermark))
  || (mutation.type === 'attributes' && isWatermark(mutation.target))

export const createWatermark = (config: WatermarkConfig = {}) => {
  const font = createMemo(() => mergeWatermarkFont(config.font))
  const lines = createMemo(() => getWatermarkContentLines(config.content, font()))
  const gap = createMemo((): [number, number] => [config.gap?.[0] ?? WATERMARK_DEFAULT_GAP, config.gap?.[1] ?? WATERMARK_DEFAULT_GAP])
  const zIndex = () => config.zIndex ?? WATERMARK_DEFAULT_Z_INDEX
  const rotate = () => config.rotate ?? -22
  const markStyle = createMemo(() => getWatermarkMarkStyle(zIndex(), gap(), config.offset))
  return { font, lines, gap, zIndex, rotate, markStyle }
}

export const watermarkSplits: (keyof WatermarkConfig)[] = ['zIndex', 'rotate', 'width', 'height', 'image', 'content', 'font', 'gap', 'offset']
