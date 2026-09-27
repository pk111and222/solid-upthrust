import { Show, createEffect, createMemo, createSignal, merge, omit } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createQRCodeMatrix, generateQRCodePath, type QRCodeErrorLevel, type QRCodeImageSettings } from 'upthrust-competence'
import { ReloadOutlined } from '../../common/antIcons'
import { mergeClass } from '../../common/merge'
import { resolveSemantic, type SemanticInput } from '../../common/semantic'
import Button from '../Button'
import Spin from '../Spin'
import { qrCanvasClass, qrCodeClass, qrCoverClass, qrStatusTextClass, qrSvgClass } from './styles'

export type QRCodeStatus = 'active' | 'expired' | 'loading' | 'scanned'
export type QRCodeErrorCorrectionLevel = QRCodeErrorLevel
export type QRCodeType = 'canvas' | 'svg'

export interface QRCodeLocale { expired?: string; refresh?: string; scanned?: string }

export interface QRCodeStatusRenderInfo {
  status: Exclude<QRCodeStatus, 'active'>
  locale: QRCodeLocale
  onRefresh?: () => void
}

export interface QRCodeSemanticClassNames { root?: string; cover?: string }
export interface QRCodeSemanticStyles { root?: JSX.CSSProperties; cover?: JSX.CSSProperties }
export interface QRCodeSemanticInfo { props: QRCodeProps }

export interface QRCodeProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'color' | 'children' | 'class' | 'style'> {
  /** 编码内容；数组时按分段编码。为空时不渲染。 */
  value: string | string[]
  /** 渲染方式，默认 'canvas'。 */
  type?: QRCodeType
  /** 中心图标地址。 */
  icon?: string
  /** 图标尺寸，默认 40。 */
  iconSize?: number | { width: number; height: number }
  /** 尺寸（px），默认 160。 */
  size?: number
  /** 前景色，默认文字色 rgba(0, 0, 0, 0.88)。 */
  color?: string
  /** 背景色，默认 transparent。 */
  bgColor?: string
  bordered?: boolean
  /** 纠错等级，默认 'M'。 */
  errorLevel?: QRCodeErrorCorrectionLevel
  /** 不增大版本时自动提升纠错等级，默认 true。 */
  boostLevel?: boolean
  /** 静区模块数，默认 0。 */
  marginSize?: number
  status?: QRCodeStatus
  /** 过期状态点击刷新的回调；未提供时不显示刷新按钮。 */
  onRefresh?: () => void
  /** 自定义遮罩内容。 */
  statusRender?: (info: QRCodeStatusRenderInfo) => JSX.Element
  /** 覆盖内置文案（默认中文）。 */
  locale?: QRCodeLocale
  classNames?: SemanticInput<QRCodeSemanticClassNames, QRCodeSemanticInfo>
  styles?: SemanticInput<QRCodeSemanticStyles, QRCodeSemanticInfo>
  class?: string
  style?: JSX.CSSProperties
}

/** antd zh_CN locale.QRCode。 */
const DEFAULT_LOCALE: Required<QRCodeLocale> = { expired: '二维码过期', refresh: '点击刷新', scanned: '已扫描' }
const DEFAULT_COLOR = 'rgba(0, 0, 0, 0.88)'

const OWN = [
  'value', 'type', 'icon', 'iconSize', 'size', 'color', 'bgColor', 'bordered', 'errorLevel', 'boostLevel', 'marginSize',
  'status', 'onRefresh', 'statusRender', 'locale', 'classNames', 'styles', 'class', 'style',
] as const

const px = (value: number | string | undefined) => (typeof value === 'number' ? `${value}px` : value)

const defaultStatusRender = (info: QRCodeStatusRenderInfo): JSX.Element => {
  if (info.status === 'loading') return <Spin />
  if (info.status === 'scanned') return <p class={qrStatusTextClass} data-qrcode-part="scanned">{info.locale.scanned}</p>
  return <>
    <p class={qrStatusTextClass} data-qrcode-part="expired">{info.locale.expired}</p>
    <Show when={info.onRefresh}>
      <Button type="link" color="primary" icon={<ReloadOutlined />} onClick={() => info.onRefresh?.()}>{info.locale.refresh}</Button>
    </Show>
  </>
}

const QRCode = (rawProps: QRCodeProps): JSX.Element => {
  const props = merge({
    type: 'canvas', size: 160, color: DEFAULT_COLOR, bgColor: 'transparent', bordered: true, errorLevel: 'M', status: 'active', boostLevel: true,
  } as const, rawProps)
  const rest = omit(rawProps, ...OWN)
  const classNames = createMemo(() => resolveSemantic(props.classNames, { props }))
  const styles = createMemo(() => resolveSemantic(props.styles, { props }))
  const locale = createMemo(() => ({ ...DEFAULT_LOCALE, ...props.locale }))

  const hasValue = () => (Array.isArray(props.value) ? props.value.length > 0 : !!props.value)
  const imageSettings = createMemo((): QRCodeImageSettings | undefined => {
    if (!props.icon) return undefined
    const s = props.iconSize
    return {
      src: props.icon,
      width: typeof s === 'number' ? s : (s?.width ?? 40),
      height: typeof s === 'number' ? s : (s?.height ?? 40),
      excavate: true,
      crossOrigin: 'anonymous',
    }
  })
  const matrix = createMemo(() => hasValue()
    ? createQRCodeMatrix({
      value: props.value, level: props.errorLevel, boostLevel: props.boostLevel, marginSize: props.marginSize,
      size: props.size, imageSettings: imageSettings(),
    })
    : null)

  // antd 把 { width: style?.width, height: style?.height } 传给本体：未设置时为 undefined，覆盖掉 rc 的 size 内联尺寸，
  // 于是 canvas 靠 flex 拉伸到内容盒（160 - 2×12 - 2×1 = 134），svg 仅按 width/height 属性参与 flex。
  const codeStyle = () => ({ width: px(props.style?.width), height: px(props.style?.height) })

  // ===== canvas：图标加载后才挖空并绘制（与 rc QRCodeCanvas 相同）。=====
  let canvas: HTMLCanvasElement | undefined
  let image: HTMLImageElement | undefined
  const [imageLoaded, setImageLoaded] = createSignal(0)
  createEffect(
    () => ({ m: matrix(), type: props.type, size: props.size, bg: props.bgColor, fg: props.color, loaded: imageLoaded() }),
    ({ m, type, size, bg, fg }) => {
      if (!m || type !== 'canvas' || !canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const readyImage = m.image != null && image != null && image.complete && image.naturalWidth !== 0 && image.naturalHeight !== 0
      const ratio = window.devicePixelRatio || 1
      canvas.height = canvas.width = size * ratio
      const scale = (size / m.numCells) * ratio
      ctx.scale(scale, scale)
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, m.numCells, m.numCells)
      ctx.fillStyle = fg
      // 图标未就绪时不挖空（rc 行为）：挖空路径仅在图片可绘制时使用。
      const cells = readyImage ? m.cellsToDraw : m.cells
      if (typeof Path2D === 'function') {
        ctx.fill(new Path2D(readyImage ? m.path : generateQRCodePath(m.cells, m.margin)))
      } else {
        cells.forEach((row, y) => row.forEach((cell, x) => { if (cell) ctx.fillRect(x + m.margin, y + m.margin, 1, 1) }))
      }
      if (m.image) ctx.globalAlpha = m.image.opacity
      if (readyImage && m.image && image) ctx.drawImage(image, m.image.x + m.margin, m.image.y + m.margin, m.image.w, m.image.h)
    },
  )

  const cover = () => props.status !== 'active'
  const statusInfo = (): QRCodeStatusRenderInfo => ({
    status: props.status as QRCodeStatusRenderInfo['status'], locale: locale(), onRefresh: props.onRefresh,
  })

  return (
    <Show when={matrix()}>
      {(m) => (
        <div
          {...rest}
          class={mergeClass(qrCodeClass({ bordered: !!props.bordered }), props.class, classNames().root)}
          style={{
            'background-color': props.bgColor, ...styles().root, ...props.style,
            width: px(props.style?.width) ?? `${props.size}px`, height: px(props.style?.height) ?? `${props.size}px`,
          }}
          data-qrcode-type={props.type}
          data-qrcode-status={props.status}
        >
          <Show when={cover()}>
            <div class={mergeClass(qrCoverClass(), classNames().cover)} style={styles().cover} data-qrcode-part="cover">
              {(props.statusRender ?? defaultStatusRender)(statusInfo())}
            </div>
          </Show>
          <Show
            when={props.type === 'svg'}
            fallback={<>
              <canvas ref={el => { canvas = el }} class={qrCanvasClass} style={codeStyle()} width={props.size} height={props.size} role="img" />
              <Show when={props.icon}>
                <img
                  ref={el => { image = el }} src={props.icon} alt="QR-Code" style={{ display: 'none' }} crossorigin="anonymous"
                  onLoad={() => setImageLoaded(n => n + 1)}
                />
              </Show>
            </>}
          >
            <svg class={qrSvgClass} style={codeStyle()} width={props.size} height={props.size} viewBox={`0 0 ${m().numCells} ${m().numCells}`} role="img">
              <path fill={props.bgColor} d={`M0,0 h${m().numCells}v${m().numCells}H0z`} shape-rendering="crispEdges" />
              <path fill={props.color} d={m().path} shape-rendering="crispEdges" />
              <Show when={m().image}>
                {(img) => (
                  <image
                    href={props.icon} width={img().w} height={img().h} x={img().x + m().margin} y={img().y + m().margin}
                    preserveAspectRatio="none" opacity={img().opacity} {...({ crossorigin: 'anonymous' } as {})}
                  />
                )}
              </Show>
            </svg>
          </Show>
        </div>
      )}
    </Show>
  )
}

export default QRCode
