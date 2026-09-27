import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  QRCodeEcc, QRCodeSegment, createQRCodeMatrix, encodeQRCode, excavateQRCodeModules, generateQRCodePath, getQRCodeImageSettings,
  getQRCodeMarginSize,
} from '../../../competence/src'

const ANTD_PATH = readFileSync(resolve(import.meta.dirname, 'antd-path.txt'), 'utf8').trim()

describe('QRCode matrix (rc-component/qrcode port)', () => {
  // 与 antd 6.6.5 官网实测完全一致："https://ant.design/"、M 级、boostLevel 默认 → 25 模块，前景路径逐字相同。
  it('[qrcode.matrix.antd-parity] matches the measured antd svg path', () => {
    const m = createQRCodeMatrix({ value: 'https://ant.design/', level: 'M', size: 160 })
    expect(m.numCells).toBe(25)
    expect(m.margin).toBe(0)
    expect(m.path).toBe(ANTD_PATH)
    expect(m.path.startsWith('M0 0h7v1H0zM8 0h2v1H8zM11 0h5v1H11zM18,0 h7v1H18z')).toBe(true)
  })

  // UTF-8：中文按字节模式编码（qrcode-generator 默认截断 & 0xff 会损坏中文）；分段数组与字符串拼接编码结果不同但都合法。
  it('[qrcode.matrix.segments] chooses numeric / alphanumeric / byte modes and supports string[]', () => {
    expect(QRCodeSegment.makeSegments('0123456789')[0].mode.modeBits).toBe(0x1)
    expect(QRCodeSegment.makeSegments('HELLO WORLD')[0].mode.modeBits).toBe(0x2)
    const utf8 = QRCodeSegment.makeSegments('二维码')[0]
    expect([utf8.mode.modeBits, utf8.numChars]).toEqual([0x4, 9])
    const joined = createQRCodeMatrix({ value: ['0123456789', 'ABC', '中文'], size: 160 })
    expect(joined.cells.length).toBe(21 + 4 * (joined.version - 1))
    expect(createQRCodeMatrix({ value: [], size: 160 }).cells.length).toBe(21)
  })

  // boostLevel：默认在同版本内提升纠错；关闭后保持请求等级。
  it('[qrcode.matrix.boost] boostLevel raises error correction without growing the version', () => {
    const boosted = encodeQRCode('https://ant.design/', 'L')
    const plain = encodeQRCode('https://ant.design/', 'L', 1, false)
    expect(boosted.version).toBe(plain.version)
    expect(plain.errorCorrectionLevel).toBe(QRCodeEcc.LOW)
    expect(boosted.errorCorrectionLevel.ordinal).toBeGreaterThan(QRCodeEcc.LOW.ordinal)
    expect(encodeQRCode('https://ant.design/', 'H').version).toBeGreaterThan(encodeQRCode('https://ant.design/', 'L').version)
  })

  // 静区：marginSize 取整、不小于 0；路径坐标整体平移。
  it('[qrcode.matrix.margin] marginSize floors, clamps and offsets the path', () => {
    expect([getQRCodeMarginSize(false), getQRCodeMarginSize(true), getQRCodeMarginSize(false, 2.7), getQRCodeMarginSize(true, -3)]).toEqual([0, 4, 2, 0])
    const m = createQRCodeMatrix({ value: 'https://ant.design/', marginSize: 4, size: 160 })
    expect(m.numCells).toBe(33)
    expect(m.path.startsWith('M4 4h7v1H4z')).toBe(true)
  })

  // 行程编码：连续暗模块合并；行末分支使用逗号写法（与 rc 输出一致）。
  it('[qrcode.matrix.path] run-length path format', () => {
    expect(generateQRCodePath([[true, true, false, true], [false, true, true, true], [true, false, false, false]])).toBe(
      'M0 0h2v1H0zM3,0 h1v1H3zM1,1 h3v1H1zM0 2h1v1H0z',
    )
  })

  // 图标：默认 40px 在 160px / 25 模块下换算为 6.25 模块居中；挖空区向外取整；未开 excavate 不挖空。
  it('[qrcode.matrix.image] image settings and excavation', () => {
    const cells = encodeQRCode('https://ant.design/', 'M').getModules()
    const image = getQRCodeImageSettings(cells, 160, 0, { src: 'x', width: 40, height: 40, excavate: true })!
    expect([image.w, image.h, image.x, image.y, image.opacity]).toEqual([6.25, 6.25, 9.375, 9.375, 1])
    expect(image.excavation).toEqual({ x: 9, y: 9, w: 7, h: 7 })
    expect(getQRCodeImageSettings(cells, 160, 0, { src: 'x' })!.w).toBe(Math.floor(160 * 0.1) * 25 / 160)
    expect(getQRCodeImageSettings(cells, 160, 0, { src: 'x' })!.excavation).toBeNull()
    expect(getQRCodeImageSettings(cells, 160, 0)).toBeNull()
    const dug = excavateQRCodeModules(cells, image.excavation!)
    for (let y = 9; y < 16; y++) for (let x = 9; x < 16; x++) expect(dug[y][x]).toBe(false)
    expect(dug[0]).toBe(cells[0])
    const m = createQRCodeMatrix({ value: 'https://ant.design/', size: 160, imageSettings: { src: 'x', width: 40, height: 40, excavate: true } })
    expect(m.cellsToDraw[12][12]).toBe(false)
    expect(m.path).not.toBe(ANTD_PATH)
  })
})
