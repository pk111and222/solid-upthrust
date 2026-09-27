// 二维码矩阵与绘制几何：@rc-component/qrcode（MIT，部分逻辑源自 qrcode.react，ISC）的 utils / useQRCode 移植，
// 编码器为同源的 Nayuki qrcodegen（./qrcodegen）。纯函数，无信号、无 DOM。
import { Ecc, QrCode, QrSegment } from './qrcodegen'

export type QRCodeErrorLevel = 'L' | 'M' | 'Q' | 'H'
export type QRCodeModules = boolean[][]

export interface QRCodeExcavation { x: number; y: number; w: number; h: number }

export interface QRCodeImageSettings {
  src: string
  width?: number
  height?: number
  x?: number
  y?: number
  opacity?: number
  excavate?: boolean
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
}

export interface QRCodeCalculatedImage {
  x: number; y: number; w: number; h: number
  excavation: QRCodeExcavation | null
  opacity: number
  crossOrigin?: QRCodeImageSettings['crossOrigin']
}

export const QRCODE_ERROR_LEVEL_MAP: Record<QRCodeErrorLevel, Ecc> = { L: Ecc.LOW, M: Ecc.MEDIUM, Q: Ecc.QUARTILE, H: Ecc.HIGH }
export const QRCODE_SPEC_MARGIN_SIZE = 4
export const QRCODE_DEFAULT_IMG_SCALE = 0.1

/** 行程编码路径：每行连续暗模块合并为一个矩形（与 rc 输出逐字一致，包括行末分支的逗号写法）。 */
export const generateQRCodePath = (modules: QRCodeModules, margin = 0): string => {
  const ops: string[] = []
  modules.forEach((row, y) => {
    let start: number | null = null
    row.forEach((cell, x) => {
      if (!cell && start !== null) {
        ops.push(`M${start + margin} ${y + margin}h${x - start}v1H${start + margin}z`)
        start = null
        return
      }
      if (x === row.length - 1) {
        if (!cell) return
        if (start === null) ops.push(`M${x + margin},${y + margin} h1v1H${x + margin}z`)
        else ops.push(`M${start + margin},${y + margin} h${x + 1 - start}v1H${start + margin}z`)
        return
      }
      if (cell && start === null) start = x
    })
  })
  return ops.join('')
}

/** 把图标区域内的模块清空（excavate）。 */
export const excavateQRCodeModules = (modules: QRCodeModules, excavation: QRCodeExcavation): QRCodeModules =>
  modules.map((row, y) => y < excavation.y || y >= excavation.y + excavation.h
    ? row
    : row.map((cell, x) => (x < excavation.x || x >= excavation.x + excavation.w ? cell : false)))

/** 图标在模块坐标系里的位置与挖空区域；size 为绘制像素尺寸。 */
export const getQRCodeImageSettings = (
  cells: QRCodeModules, size: number, margin: number, imageSettings?: QRCodeImageSettings,
): QRCodeCalculatedImage | null => {
  if (imageSettings == null) return null
  const numCells = cells.length + margin * 2
  const defaultSize = Math.floor(size * QRCODE_DEFAULT_IMG_SCALE)
  const scale = numCells / size
  const w = (imageSettings.width || defaultSize) * scale
  const h = (imageSettings.height || defaultSize) * scale
  const x = imageSettings.x == null ? cells.length / 2 - w / 2 : imageSettings.x * scale
  const y = imageSettings.y == null ? cells.length / 2 - h / 2 : imageSettings.y * scale
  const opacity = imageSettings.opacity == null ? 1 : imageSettings.opacity
  let excavation: QRCodeExcavation | null = null
  if (imageSettings.excavate) {
    const floorX = Math.floor(x)
    const floorY = Math.floor(y)
    excavation = { x: floorX, y: floorY, w: Math.ceil(w + x - floorX), h: Math.ceil(h + y - floorY) }
  }
  return { x, y, h, w, excavation, opacity, crossOrigin: imageSettings.crossOrigin }
}

/** 静区：显式 marginSize 取整且不小于 0；否则 includeMargin ? 4 : 0。 */
export const getQRCodeMarginSize = (includeMargin: boolean, marginSize?: number): number =>
  marginSize != null ? Math.max(Math.floor(marginSize), 0) : includeMargin ? QRCODE_SPEC_MARGIN_SIZE : 0

export interface QRCodeMatrixOptions {
  /** 字符串或分段数组；每段自动选择数字 / 字母数字 / UTF-8 字节模式。 */
  value: string | string[]
  level?: QRCodeErrorLevel
  minVersion?: number
  /** 在不增大版本的前提下提升纠错等级，默认 true（与 antd 一致）。 */
  boostLevel?: boolean
  includeMargin?: boolean
  marginSize?: number
  /** 绘制像素尺寸，用于图标换算。 */
  size: number
  imageSettings?: QRCodeImageSettings
}

export interface QRCodeMatrix {
  cells: QRCodeModules
  margin: number
  numCells: number
  image: QRCodeCalculatedImage | null
  /** 已按 excavation 挖空后的待绘制模块。 */
  cellsToDraw: QRCodeModules
  /** 前景路径（viewBox 为 0 0 numCells numCells）。 */
  path: string
  version: number
}

export const encodeQRCode = (value: string | string[], level: QRCodeErrorLevel = 'M', minVersion = 1, boostLevel = true): QrCode => {
  const segments = (Array.isArray(value) ? value : [value]).flatMap(item => QrSegment.makeSegments(item))
  return QrCode.encodeSegments(segments, QRCODE_ERROR_LEVEL_MAP[level], minVersion, undefined, undefined, boostLevel)
}

export const createQRCodeMatrix = (options: QRCodeMatrixOptions): QRCodeMatrix => {
  const qr = encodeQRCode(options.value, options.level ?? 'M', options.minVersion ?? 1, options.boostLevel ?? true)
  const cells = qr.getModules()
  const margin = getQRCodeMarginSize(options.includeMargin ?? false, options.marginSize)
  const image = getQRCodeImageSettings(cells, options.size, margin, options.imageSettings)
  const cellsToDraw = image?.excavation ? excavateQRCodeModules(cells, image.excavation) : cells
  return {
    cells, margin, numCells: cells.length + margin * 2, image, cellsToDraw,
    path: generateQRCodePath(cellsToDraw, margin), version: qr.version,
  }
}

export { Ecc as QRCodeEcc, QrCode as QRCodeEncoder, QrSegment as QRCodeSegment } from './qrcodegen'
