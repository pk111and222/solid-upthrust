import { createEffect, createMemo, createSignal, merge, omit, onCleanup, untrack } from 'solid-js'
import type { JSX } from '@solidjs/web'
import {
  createWatermark, drawWatermarkClips, getWatermarkMarkSize, watermarkNeedsRerender,
  type WatermarkContent, type WatermarkFont, type WatermarkText,
} from 'upthrust-competence'
import { mergeClass } from '../../common/merge'
import { WatermarkContext, type WatermarkContextValue } from './context'

export type { WatermarkContent, WatermarkFont, WatermarkText }

export interface WatermarkProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'content' | 'children' | 'class' | 'style'> {
  /** 追加的水印元素的 z-index，默认 999。 */
  zIndex?: number
  /** 旋转角度（°），默认 -22。 */
  rotate?: number
  /** 单个水印宽度；图片默认 120，文字默认按内容测量。 */
  width?: number
  /** 单个水印高度；图片默认 64，文字默认按内容测量。 */
  height?: number
  /** 图片源（优先于文字；加载失败回退文字）。 */
  image?: string
  /** 文字内容；数组为多行，`{ text, font }` 可单独设置某行字体。 */
  content?: WatermarkContent | WatermarkContent[]
  /** 文字样式，默认 rgba(0,0,0,.15) / 16px / normal / sans-serif / center。 */
  font?: WatermarkFont
  /** 水印之间的间距，默认 [100, 100]。 */
  gap?: [number, number]
  /** 水印距容器左上角的偏移，默认 [gap[0]/2, gap[1]/2]。 */
  offset?: [number, number]
  /** 是否把水印传导给 Modal / Drawer 等弹层，默认 true。 */
  inherit?: boolean
  /** 水印因 DOM 变更被移除（并已自动恢复）时触发。 */
  onRemove?: () => void
  children?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
  ref?: (el: HTMLDivElement) => void
}

/** 容器固定样式：被外部篡改时恢复（antd fixedStyle）。 */
const FIXED_STYLE = { position: 'relative', overflow: 'hidden' } as const

const OWN = [
  'zIndex', 'rotate', 'width', 'height', 'image', 'content', 'font', 'gap', 'offset', 'inherit', 'onRemove', 'children', 'class', 'style', 'ref',
] as const

const styleText = (style: Record<string, string | number>) => Object.entries(style).map(([k, v]) => `${k}: ${v};`).join(' ')

const Watermark = (rawProps: WatermarkProps): JSX.Element => {
  const props = merge({ inherit: true } as const, rawProps)
  const rest = omit(rawProps, ...OWN)
  const wm = createWatermark({
    get zIndex() { return props.zIndex }, get rotate() { return props.rotate }, get content() { return props.content },
    get font() { return props.font }, get gap() { return props.gap }, get offset() { return props.offset },
  })

  const [container, setContainer] = createSignal<HTMLDivElement>()
  const [subElements, setSubElements] = createSignal<ReadonlySet<HTMLElement>>(new Set())
  const targets = createMemo(() => {
    const root = container()
    return [...(root ? [root] : []), ...subElements()]
  })

  // ============================ 绘制 ============================
  // 每次绘制生成新元组（与 antd 一致），即使内容相同也会重新挂载水印元素——这是篡改后恢复的途径。
  const [info, setInfo] = createSignal<readonly [url: string, width: number]>()
  let renderId = 0
  const renderWatermark = () => {
    if (typeof document === 'undefined') return
    const ctx = document.createElement('canvas').getContext('2d')
    if (!ctx) return
    const id = ++renderId
    const ratio = window.devicePixelRatio || 1
    const lines = wm.lines()
    const [markWidth, markHeight] = getWatermarkMarkSize(ctx, lines, props.image, props.width, props.height)
    const [gapX, gapY] = wm.gap()
    const draw = (content: typeof lines | HTMLImageElement) => {
      if (id !== renderId) return
      const [url, width] = drawWatermarkClips(document, content, wm.rotate(), ratio, markWidth, markHeight, gapX, gapY)
      setInfo([url, width] as const)
    }
    if (props.image) {
      const img = new Image()
      img.onload = () => draw(img)
      img.onerror = () => draw(lines)
      img.crossOrigin = 'anonymous'
      img.referrerPolicy = 'no-referrer'
      img.src = props.image
    } else {
      draw(lines)
    }
  }

  // DOM 变更触发的重绘按帧去重（antd useRafDebounce：同一帧只执行第一次）。
  let rafPending = false
  let rafId = 0
  const syncWatermark = () => {
    if (rafPending) return
    rafPending = true
    untrack(renderWatermark)
    rafId = requestAnimationFrame(() => { rafPending = false })
  }

  createEffect(
    () => [wm.rotate(), wm.zIndex(), props.width, props.height, props.image, wm.lines(), wm.gap(), wm.markStyle()],
    () => untrack(renderWatermark),
  )

  // ============================ 挂载 ============================
  const marks = new Map<HTMLElement, HTMLDivElement>()
  let observer: MutationObserver | undefined
  const isWatermark = (node: Node) => [...marks.values()].includes(node as HTMLDivElement)

  const appendWatermark = (url: string, markWidth: number, holder: HTMLElement) => {
    const exist = marks.get(holder)
    const mark = exist ?? document.createElement('div')
    if (!exist) marks.set(holder, mark)
    mark.setAttribute('style', styleText({
      ...wm.markStyle(),
      'background-image': `url('${url}')`,
      'background-size': `${Math.floor(markWidth)}px`,
      // 防止外部隐藏样式（浏览器「隐藏元素」等）。
      visibility: 'visible !important',
    }))
    mark.removeAttribute('class')
    mark.removeAttribute('hidden')
    if (mark.parentElement !== holder) {
      if (exist) props.onRemove?.()
      holder.append(mark)
    }
  }

  const removeWatermark = (holder: HTMLElement) => {
    const mark = marks.get(holder)
    if (mark && mark.parentElement === holder) holder.removeChild(mark)
    marks.delete(holder)
  }

  createEffect(
    () => ({ current: info(), list: targets(), style: wm.markStyle() }),
    ({ current, list }) => {
      if (!current) return
      untrack(() => list.forEach(holder => appendWatermark(current[0], current[1], holder)))
      // 丢弃自身写入产生的变更记录，避免把自己的挂载当成篡改。
      observer?.takeRecords()
    },
  )

  // ============================ 防篡改 ============================
  const onMutate = (mutations: MutationRecord[]) => untrack(() => {
    const root = container()
    for (const mutation of mutations) {
      if (watermarkNeedsRerender(mutation, isWatermark)) {
        syncWatermark()
      } else if (root && mutation.target === root && mutation.attributeName === 'style') {
        // 只保护容器自身的定位与裁剪（不含嵌套弹层）。
        for (const key of Object.keys(FIXED_STYLE) as (keyof typeof FIXED_STYLE)[]) {
          const expected = (props.style?.[key] as string | undefined) ?? FIXED_STYLE[key]
          if (root.style[key] !== expected) root.style[key] = expected
        }
      }
    }
  })

  createEffect(targets, (list) => {
    if (typeof MutationObserver === 'undefined' || list.length === 0) return
    const instance = new MutationObserver(onMutate)
    observer = instance
    list.forEach(el => instance.observe(el, { subtree: true, childList: true, attributeFilter: ['style', 'class'] }))
    return () => {
      instance.takeRecords()
      instance.disconnect()
      if (observer === instance) observer = undefined
    }
  })

  onCleanup(() => {
    cancelAnimationFrame(rafId)
    marks.forEach((mark) => mark.remove())
    marks.clear()
  })

  // ============================ 弹层传导 ============================
  const context: WatermarkContextValue = {
    add: (el) => setSubElements((prev) => (prev.has(el) ? prev : new Set([...prev, el]))),
    remove: (el) => {
      removeWatermark(el)
      setSubElements((prev) => {
        if (!prev.has(el)) return prev
        const next = new Set(prev)
        next.delete(el)
        return next
      })
    },
  }

  return (
    <div
      {...rest}
      ref={(el) => { setContainer(el); props.ref?.(el) }}
      class={mergeClass(props.class)}
      style={{ ...FIXED_STYLE, ...props.style }}
    >
      {props.inherit ? <WatermarkContext value={context}>{props.children}</WatermarkContext> : props.children}
    </div>
  )
}

export default Watermark
