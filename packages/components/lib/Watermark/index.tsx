import { Component, createMemo, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createWatermark } from 'upthrust-competence'
import { watermarkLayerClass, watermarkContainerClass } from './styles'
import { twMerge } from 'tailwind-merge'

export interface WatermarkProps {
  /** Watermark text; array renders multi-line. */
  content?: string | string[]
  /** Tile opacity 0–1. */
  opacity?: number
  zIndex?: number
  /** Rotation degrees; default -22 (antd parity). */
  rotate?: number
  /** Tile width/height px. */
  width?: number
  height?: number
  /** Tile gap; [x, y] or single number. */
  gap?: number | [number, number]
  offset?: [number, number]
  fontColor?: string
  fontSize?: number | string
  fontWeight?: number | string
  fontStyle?: string
  fontFamily?: string
  /**
   * Content covered by the watermark (the layer sits on top; pointer events
   * pass through). Not a custom tile — custom text goes through `content`.
   */
  children?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
}

const Watermark: Component<WatermarkProps> = (rawProps) => {
  const props = merge({} as const, rawProps)

  const wm = createWatermark({
    get content() { return props.content },
    get opacity() { return props.opacity },
    get zIndex() { return props.zIndex },
    get rotate() { return props.rotate },
    get width() { return props.width },
    get height() { return props.height },
    get gap() { return props.gap },
    get fontColor() { return props.fontColor },
    get fontSize() { return props.fontSize },
    get fontWeight() { return props.fontWeight },
    get fontStyle() { return props.fontStyle },
    get fontFamily() { return props.fontFamily },
  })

  const tile = createMemo(() => wm.tile())

  return (
    // text-on-surface/25 sets the `currentColor` the SVG tile's fill uses,
    // so the default watermark adapts to light/dark themes. A caller-supplied
    // fontColor bakes a fixed color into the tile and ignores this class.
    <div class={twMerge(watermarkContainerClass({}), 'text-on-surface/25', props.class)} style={props.style}>
      <div
        class={watermarkLayerClass({})}
        style={{
          'background-image': tile().backgroundImage,
          'background-size': tile().backgroundSize,
          'background-repeat': 'repeat',
          'z-index': String(tile().zIndex),
          ...(props.offset ? {
            'background-position': `${props.offset[0]}px ${props.offset[1]}px`,
          } : {}),
        }}
      />
      {props.children}
    </div>
  )
}

export default Watermark
