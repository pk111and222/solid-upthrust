import { createRoot, flush } from 'solid-js'
import { describe, expect, it } from 'vitest'
import {
  createWatermark, getWatermarkCanvasFont, getWatermarkContentLines, getWatermarkMarkSize, getWatermarkMarkStyle,
  getWatermarkRotatedBounds, mergeWatermarkFont, watermarkNeedsRerender, WATERMARK_DEFAULT_FONT,
} from '../../../competence/src/watermark'
import {
  pickAlertCloseAttrs, resolveAlertClosable, resolveAlertCloseIcon, resolveAlertShowIcon, resolveAlertType, createAlert,
} from '../../../competence/src/alert'

describe('watermark headless (antd 6.6.5 utils / useClips parity)', () => {
  // 默认字体：rgba(0,0,0,.15) / 16 / normal / normal / sans-serif / center；未定义字段不覆盖默认值。
  it('[watermark.font] default font and undefined-safe merge', () => {
    expect(WATERMARK_DEFAULT_FONT).toEqual({ color: 'rgba(0, 0, 0, 0.15)', fontSize: 16, fontWeight: 'normal', fontStyle: 'normal', fontFamily: 'sans-serif', textAlign: 'center' })
    expect(mergeWatermarkFont({ color: undefined, fontSize: 20 })).toEqual({ ...WATERMARK_DEFAULT_FONT, fontSize: 20 })
    // canvas 字体串与 antd getCanvasFont 一致：style normal weight size[/lineHeight] family。
    expect(getWatermarkCanvasFont(WATERMARK_DEFAULT_FONT)).toBe('normal normal normal 16px sans-serif')
    expect(getWatermarkCanvasFont({ ...WATERMARK_DEFAULT_FONT, fontSize: '12px' }, 2, 30)).toBe('normal normal normal 24px/30px sans-serif')
  })

  // 多行：字符串用全局字体，{ text, font } 与全局字体合并；空值跳过。
  it('[watermark.lines] string and WatermarkText lines', () => {
    const font = mergeWatermarkFont({ color: 'red' })
    const lines = getWatermarkContentLines(['Ant Design', { text: 'Happy Working', font: { fontSize: 12 } }, undefined as never], font)
    expect(lines).toEqual([
      { text: 'Ant Design', font },
      { text: 'Happy Working', font: { ...font, fontSize: 12 } },
    ])
    expect(getWatermarkContentLines(undefined, font)).toEqual([])
    expect(getWatermarkContentLines('x', font)).toEqual([{ text: 'x', font }])
  })

  // 偏移：默认 gap/2 → 层铺满、背景位置 0 0；offset 大于 gap/2 时转为 left/top 并收缩宽高；小于时进 background-position。
  it('[watermark.offset] mark style from gap and offset', () => {
    expect(getWatermarkMarkStyle(999, [100, 100])).toEqual({
      'z-index': 999, position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', 'pointer-events': 'none',
      'background-repeat': 'repeat', 'background-position': '0px 0px',
    })
    const shifted = getWatermarkMarkStyle(1, [100, 100], [80, 20])
    expect([shifted.left, shifted.width, shifted.top, shifted.height, shifted['background-position']])
      .toEqual(['30px', 'calc(100% - 30px)', 0, '100%', '0px -30px'])
  })

  // 尺寸：图片默认 120×64；文字按测量宽与 ascent+descent 累加、行间 3px；无内容 0×0；width / height 优先。
  it('[watermark.size] mark size from measured text', () => {
    const ctx = { font: '', measureText: (text: string) => ({ width: text.length * 7.3, fontBoundingBoxAscent: 15, fontBoundingBoxDescent: 3.4 }) as TextMetrics }
    const lines = getWatermarkContentLines(['Ant Design', 'Happy'], WATERMARK_DEFAULT_FONT)
    expect(getWatermarkMarkSize(ctx, lines)).toEqual([73, 37 + 3])
    expect(getWatermarkMarkSize(ctx, [])).toEqual([0, 0])
    expect(getWatermarkMarkSize(ctx, lines, 'img.png')).toEqual([120, 64])
    expect(getWatermarkMarkSize(ctx, lines, 'img.png', 130, 30)).toEqual([130, 30])
  })

  // 旋转包围盒：0° 为原尺寸，90° 宽高互换，-22° 为 |w cos| + |h sin| 等。
  it('[watermark.rotate] rotated bounding box', () => {
    const r0 = getWatermarkRotatedBounds(100, 40, 0)
    expect([r0.width, r0.height, r0.left, r0.top]).toEqual([100, 40, -50, -20])
    const r90 = getWatermarkRotatedBounds(100, 40, 90)
    expect([Math.round(r90.width), Math.round(r90.height)]).toEqual([40, 100])
    const a = (22 * Math.PI) / 180
    const r22 = getWatermarkRotatedBounds(100, 40, -22)
    expect(r22.width).toBeCloseTo(100 * Math.cos(a) + 40 * Math.sin(a), 6)
    expect(r22.height).toBeCloseTo(100 * Math.sin(a) + 40 * Math.cos(a), 6)
  })

  // 防篡改判定：删除水印节点、或水印节点属性被改时需要重绘；其它变更不需要。
  it('[watermark.tamper] rerender decision', () => {
    const mark = {} as Node
    const other = {} as Node
    const isMark = (node: Node) => node === mark
    const record = (patch: Partial<MutationRecord>) => ({ type: 'childList', removedNodes: [] as unknown as NodeList, target: other, ...patch }) as MutationRecord
    expect(watermarkNeedsRerender(record({ removedNodes: [mark] as unknown as NodeList }), isMark)).toBe(true)
    expect(watermarkNeedsRerender(record({ type: 'attributes', target: mark }), isMark)).toBe(true)
    expect(watermarkNeedsRerender(record({ type: 'attributes', target: other }), isMark)).toBe(false)
    expect(watermarkNeedsRerender(record({ removedNodes: [other] as unknown as NodeList }), isMark)).toBe(false)
  })

  // createWatermark：默认 rotate -22、zIndex 999、gap [100,100]；gap 可部分缺省。
  it('[watermark.create] reactive defaults', () => {
    createRoot((dispose) => {
      const wm = createWatermark({ content: 'x', gap: [40, undefined as never] })
      flush()
      expect([wm.rotate(), wm.zIndex(), wm.gap()]).toEqual([-22, 999, [40, 100]])
      expect(wm.lines()).toHaveLength(1)
      expect(wm.markStyle()['background-position']).toBe('0px 0px')
      dispose()
    })
  })
})

describe('alert headless (antd 6.6.5 Alert parity)', () => {
  // 类型：未指定时 banner 为 warning、否则 info；图标：banner 未设置时默认显示，普通默认不显示。
  it('[alert.defaults] type and showIcon defaults', () => {
    expect([resolveAlertType(undefined), resolveAlertType(undefined, true), resolveAlertType('error', true)]).toEqual(['info', 'warning', 'error'])
    expect([resolveAlertShowIcon(undefined), resolveAlertShowIcon(undefined, true), resolveAlertShowIcon(false, true), resolveAlertShowIcon(true)])
      .toEqual([false, true, false, true])
  })

  // 可关闭：对象 / closeText / 布尔 / 非空 closeIcon（0 与 '' 也算）；closeIcon=false 或未设不可关闭。
  it('[alert.closable] closable resolution and close icon priority', () => {
    expect(resolveAlertClosable({ closable: {} })).toBe(true)
    expect(resolveAlertClosable({ closeText: 'x' })).toBe(true)
    expect(resolveAlertClosable({ closable: false, closeIcon: 'x' })).toBe(false)
    expect(resolveAlertClosable({ closeIcon: 0 })).toBe(true)
    expect(resolveAlertClosable({ closeIcon: '' })).toBe(true)
    expect(resolveAlertClosable({ closeIcon: false })).toBe(false)
    expect(resolveAlertClosable({})).toBe(false)
    expect(resolveAlertCloseIcon({ closable: { closeIcon: 'A' }, closeText: 'B', closeIcon: 'C' })).toBe('A')
    expect(resolveAlertCloseIcon<unknown, unknown>({ closable: { closeIcon: true }, closeText: 'B' })).toBe(true)
    expect(resolveAlertCloseIcon({ closeText: 'B', closeIcon: 'C' })).toBe('B')
    expect(resolveAlertCloseIcon({ closable: true })).toBeUndefined()
    expect(pickAlertCloseAttrs({ 'aria-label': 'close', 'data-x': '1', closeIcon: true } as never)).toEqual({ 'aria-label': 'close', 'data-x': '1' })
    expect(pickAlertCloseAttrs(true)).toEqual({})
  })

  // 关闭：closable.onClose 优先于 onClose，只触发一次；afterClose 同理优先 closable.afterClose。
  it('[alert.close] close callbacks run once with closable priority', () => {
    createRoot((dispose) => {
      const calls: string[] = []
      const alert = createAlert<string>({
        closable: { onClose: e => calls.push(`closable:${e}`), afterClose: () => calls.push('closable:after') },
        onClose: () => calls.push('legacy'), afterClose: () => calls.push('legacy:after'),
      })
      alert.close('a'); flush(); alert.close('b')
      alert.afterClose()
      expect(calls).toEqual(['closable:a', 'closable:after'])
      expect(alert.closed()).toBe(true)
      const legacy = createAlert<string>({ closable: true, onClose: e => calls.push(`legacy:${e}`) })
      legacy.close('c')
      expect(calls.at(-1)).toBe('legacy:c')
      dispose()
    })
  })
})
