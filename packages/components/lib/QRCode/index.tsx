import { Component, Show, createMemo, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import qrcode from 'qrcode-generator'
import {
  qrCodeClass,
  qrMaskClass,
  qrMaskTextClass,
  qrExpiredIconClass,
  qrScannedIconClass,
  qrLoadingIconClass,
  qrRefreshClass,
} from './styles'

export type QRCodeStatus = 'active' | 'expired' | 'loading' | 'scanned'
export type QRCodeErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export interface QRCodeProps {
  /** text/URL to encode */
  value: string
  /** rendered size in px (default 160) */
  size?: number
  /** module color */
  color?: string
  /** background color */
  bgColor?: string
  bordered?: boolean
  /** error correction level; higher = more damage-tolerant but denser */
  errorLevel?: QRCodeErrorCorrectionLevel
  /** small logo overlay in the center (autoSelect uses H) */
  icon?: string
  iconSize?: number | { width: number; height: number }
  status?: QRCodeStatus
  /** status=loading shows this mask content */
  loadingContent?: JSX.Element
  /** fired when the user clicks refresh in the expired mask */
  onRefresh?: (e: MouseEvent) => void
  class?: string
  style?: JSX.CSSProperties
}

type ModuleGrid = boolean[][]

function encode(value: string, level: QRCodeErrorCorrectionLevel): ModuleGrid {
  // typeNumber 0 = auto-detect the smallest version that fits
  const qr = qrcode(0, level)
  qr.addData(value)
  qr.make()
  const count = qr.getModuleCount()
  const grid: ModuleGrid = []
  for (let r = 0; r < count; r++) {
    const row: boolean[] = []
    for (let c = 0; c < count; c++) row.push(qr.isDark(r, c))
    grid.push(row)
  }
  return grid
}

const QRCode: Component<QRCodeProps> = (rawProps) => {
  const props = merge(
    {
      size: 160,
      color: '#000',
      bgColor: '#ffffff',
      bordered: true,
      errorLevel: 'M' as QRCodeErrorCorrectionLevel,
      status: 'active' as QRCodeStatus,
      iconSize: 36,
    },
    rawProps,
  )

  // Encode failures are derived, not signaled: the memo returns null on
  // failure and the mask shows. Writing a signal from inside a memo is
  // forbidden in Solid 2 (REACTIVE_WRITE_IN_OWNED_SCOPE).
  const encodeFailure = createMemo(() => {
    try {
      encode(props.value ?? '', props.icon ? 'H' : props.errorLevel)
      return null as string | null
    } catch (e) {
      return (e as Error)?.message || 'QR encode failed'
    }
  })

  const effectiveGrid = createMemo(() => {
    if (encodeFailure()) return null
    try {
      return encode(props.value ?? '', props.icon ? 'H' : props.errorLevel)
    } catch {
      return null
    }
  })

  const moduleCount = createMemo(() => effectiveGrid()?.length ?? 0)

  // Build one path of all dark modules: "M x y h1 v1 h-1 z" per module.
  const path = createMemo(() => {
    const g = effectiveGrid()
    if (!g) return ''
    let d = ''
    for (let r = 0; r < g.length; r++) {
      for (let c = 0; c < g.length; c++) {
        if (g[r][c]) d += `M${c} ${r}h1v1h-1z`
      }
    }
    return d
  })

  const iconDims = createMemo(() => {
    const s = props.iconSize as number | { width: number; height: number } | undefined
    if (typeof s === 'number') return { width: s, height: s }
    return s ?? { width: 36, height: 36 }
  })

  return (
    <div
      class={qrCodeClass({ bordered: props.bordered })}
      style={{ 'background-color': props.bgColor, ...props.style }}
      role="img"
      aria-label={props.value}
    >
      <Show when={effectiveGrid()} fallback={
        <div class={qrMaskClass({})}>
          <span class={qrLoadingIconClass({})} />
          <span class={qrMaskTextClass({})}>编码失败</span>
        </div>
      }>
        <svg
          width={props.size}
          height={props.size}
          viewBox={`0 0 ${moduleCount()} ${moduleCount()}`}
          shape-rendering="crispEdges"
        >
          <path d={path()} fill={props.color} />
        </svg>
      </Show>

      <Show when={props.icon && effectiveGrid()}>
        <span
          class="absolute left-1/2 top-1/2 z-1 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded bg-white p-[2px]"
          style={{ width: `${iconDims().width + 4}px`, height: `${iconDims().height + 4}px` }}
        >
          <img src={props.icon} class="max-h-full max-w-full object-contain" alt="" />
        </span>
      </Show>

      <Show when={props.status === 'expired' || encodeFailure()}>
        <div class={qrMaskClass({})}>
          <span class={qrExpiredIconClass({})} />
          <span class={qrMaskTextClass({})}>二维码已过期</span>
          <Show when={props.onRefresh}>
            <a class={qrRefreshClass({})} onClick={(e) => props.onRefresh?.(e)}>点击刷新</a>
          </Show>
        </div>
      </Show>

      <Show when={props.status === 'loading'}>
        <div class={qrMaskClass({})}>
          <Show when={!props.loadingContent} fallback={props.loadingContent}>
            <span class={qrLoadingIconClass({})} />
            <span class={qrMaskTextClass({})}>加载中…</span>
          </Show>
        </div>
      </Show>

      <Show when={props.status === 'scanned'}>
        <div class={qrMaskClass({})}>
          <span class={qrScannedIconClass({})} />
          <span class={qrMaskTextClass({})}>已扫描</span>
        </div>
      </Show>
    </div>
  )
}

export default QRCode
