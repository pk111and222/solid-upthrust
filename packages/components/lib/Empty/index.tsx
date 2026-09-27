import { Show, children as resolveChildren, createMemo, omit } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { numberToText } from '../../common/renderable'
import { mergeClass } from '../../common/merge'
import { emptyClass, emptyDescriptionClass, emptyFooterClass, emptyImageClass, emptyImageColors as c } from './styles'

/** antd zh_CN 语言包的 Empty.description。 */
const DEFAULT_DESCRIPTION = '暂无数据'

/**
 * antd 6 内置插画（components/empty/empty.tsx），路径与尺寸一致；
 * 颜色由 antd 的 getAsSolidColor 预混实色改为主题类，随明暗主题变化。
 */
const DefaultImage = (): JSX.Element => (
  <svg width="184" height="152" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg" data-empty-image="default">
    <title>{DEFAULT_DESCRIPTION}</title>
    <g fill="none" fill-rule="evenodd">
      <g transform="translate(24 31.7)">
        <ellipse fill-opacity=".8" class={c.fill6} cx="67.8" cy="106.9" rx="67.8" ry="12.7" />
        <path class={c.fill25} d="M122 69.7 98.1 40.2a6 6 0 0 0-4.6-2.2H42.1a6 6 0 0 0-4.6 2.2l-24 29.5V85H122z" />
        <path class={c.fill4} d="M33.8 0h68a4 4 0 0 1 4 4v93.3a4 4 0 0 1-4 4h-68a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4" />
        <path
          class={c.fill15}
          d="M42.7 10h50.2a2 2 0 0 1 2 2v25a2 2 0 0 1-2 2H42.7a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2m.2 39.8h49.8a2.3 2.3 0 1 1 0 4.5H42.9a2.3 2.3 0 0 1 0-4.5m0 11.7h49.8a2.3 2.3 0 1 1 0 4.6H42.9a2.3 2.3 0 0 1 0-4.6m79 43.5a7 7 0 0 1-6.8 5.4H20.5a7 7 0 0 1-6.7-5.4l-.2-1.8V69.7h26.3c2.9 0 5.2 2.4 5.2 5.4s2.4 5.4 5.3 5.4h34.8c2.9 0 5.3-2.4 5.3-5.4s2.3-5.4 5.2-5.4H122v33.5q0 1-.2 1.8"
        />
      </g>
      <path class={c.fill15} d="m149.1 33.3-6.8 2.6a1 1 0 0 1-1.3-1.2l2-6.2q-4.1-4.5-4.2-10.4c0-10 10.1-18.1 22.6-18.1S184 8.1 184 18.1s-10.1 18-22.6 18q-6.8 0-12.3-2.8" />
      <g class={c.surface} transform="translate(149.7 15.4)">
        <circle cx="20.7" cy="3.2" r="2.8" />
        <path d="M5.7 5.6H0L2.9.7zM9.3.7h5v5h-5z" />
      </g>
    </g>
  </svg>
)

/** antd 6 简洁插画（components/empty/simple.tsx）。 */
const SimpleImage = (): JSX.Element => (
  <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg" data-empty-image="simple">
    <title>{DEFAULT_DESCRIPTION}</title>
    <g transform="translate(0 1)" fill="none" fill-rule="evenodd">
      <ellipse class={c.fill4} cx="32" cy="33" rx="32" ry="7" />
      <g fill-rule="nonzero" class={c.stroke15}>
        <path d="M55 12.8 44.9 1.3Q44 0 42.9 0H21.1q-1.2 0-2 1.3L9 12.8V22h46z" />
        <path
          d="M41.6 16c0-1.7 1-3 2.2-3H55v18.1c0 2.2-1.3 3.9-3 3.9H12c-1.7 0-3-1.7-3-3.9V13h11.2c1.2 0 2.2 1.3 2.2 3s1 2.9 2.2 2.9h14.8c1.2 0 2.2-1.4 2.2-3"
          class={c.fill2}
        />
      </g>
    </g>
  </svg>
)

/**
 * 内置插画是组件（Solid 的 DOM 节点不能在多处复用），推荐 `image={PRESENTED_IMAGE_SIMPLE}`；
 * 写成 `<PRESENTED_IMAGE_SIMPLE />` 也可以，同样会切换为简洁样式。
 */
export const PRESENTED_IMAGE_DEFAULT = DefaultImage
export const PRESENTED_IMAGE_SIMPLE = SimpleImage

/** 内置插画组件类型（PRESENTED_IMAGE_DEFAULT / PRESENTED_IMAGE_SIMPLE）。 */
export type EmptyPresentedImage = () => JSX.Element

export interface EmptySemanticClassNames {
  root?: string
  image?: string
  description?: string
  footer?: string
}

export interface EmptySemanticStyles {
  root?: JSX.CSSProperties
  image?: JSX.CSSProperties
  description?: JSX.CSSProperties
  footer?: JSX.CSSProperties
}

export interface EmptyProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children'> {
  /**
   * 图片：节点、内置插画组件，或图片地址（渲染 `<img>`）。默认 PRESENTED_IMAGE_DEFAULT；
   * undefined / null 回落默认插画（与 antd 一致）；false 不渲染图片区域（本库扩展）。
   */
  image?: JSX.Element | EmptyPresentedImage | string | false | null
  /** @deprecated 请使用 styles.image */
  imageStyle?: JSX.CSSProperties
  /** 描述内容，默认「暂无数据」；false / null / '' 不渲染描述区域。 */
  description?: JSX.Element
  /** 底部内容（如操作按钮）。 */
  children?: JSX.Element
  classNames?: EmptySemanticClassNames
  styles?: EmptySemanticStyles
  class?: string
  style?: JSX.CSSProperties
}

const OWN = ['image', 'imageStyle', 'description', 'children', 'classNames', 'styles', 'class', 'style'] as const

/** antd isReactRenderable：只有 undefined / null / false / '' 视为空，0 与 true 仍渲染区域。 */
const isRenderable = (node: unknown) =>
  node !== undefined && node !== null && node !== false && node !== '' && !(Array.isArray(node) && node.length === 0)

const isSimpleNode = (node: unknown) =>
  typeof Element !== 'undefined' && node instanceof Element && node.getAttribute('data-empty-image') === 'simple'

const Empty = (props: EmptyProps) => {
  const rest = omit(props, ...OWN)

  // JSX 属性每次读取都会新建节点：描述与底部各解析一次，判定与渲染共用同一份结果。
  const description = resolveChildren(() => props.description === undefined ? DEFAULT_DESCRIPTION : props.description)
  const footer = resolveChildren(() => props.children)

  const image = createMemo(() => {
    const raw = props.image
    if (raw === false) return { kind: 'none' as const }
    if (raw === undefined || raw === null || raw === DefaultImage) return { kind: 'component' as const, Image: DefaultImage, simple: false }
    if (raw === SimpleImage) return { kind: 'component' as const, Image: SimpleImage, simple: true }
    if (typeof raw === 'string') return { kind: 'src' as const, src: raw }
    return { kind: 'node' as const, node: raw as JSX.Element }
  })
  // 自定义节点只解析一次；<PRESENTED_IMAGE_SIMPLE /> 形式按插画标记识别。
  const customImage = resolveChildren(() => {
    const current = image()
    return current.kind === 'node' ? current.node : undefined
  })
  const simple = createMemo(() => {
    const current = image()
    return current.kind === 'component' ? current.simple : current.kind === 'node' && isSimpleNode(customImage())
  })
  // antd：描述为字符串时作为图片 alt，否则为 'empty'。
  const alt = () => {
    const value = description()
    return typeof value === 'string' ? value : 'empty'
  }

  return (
    <div
      {...rest}
      class={mergeClass(emptyClass({ simple: simple() }), props.class, props.classNames?.root)}
      style={{ ...props.styles?.root, ...props.style }}
    >
      <Show when={image().kind !== 'none'}>
        <div
          class={mergeClass(emptyImageClass({ simple: simple() }), props.classNames?.image)}
          style={{ ...props.imageStyle, ...props.styles?.image }}
        >
          {(() => {
            const current = image()
            if (current.kind === 'component') { const Image = current.Image; return <Image /> }
            if (current.kind === 'src') return <img draggable="false" alt={alt()} src={current.src} />
            return customImage()
          })()}
        </div>
      </Show>
      <Show when={isRenderable(description())}>
        <div class={mergeClass(emptyDescriptionClass({}), props.classNames?.description)} style={props.styles?.description}>
          {numberToText(description())}
        </div>
      </Show>
      <Show when={footer.toArray().some(isRenderable)}>
        <div class={mergeClass(emptyFooterClass({}), props.classNames?.footer)} style={props.styles?.footer}>
          {numberToText(footer())}
        </div>
      </Show>
    </div>
  )
}

export default /* @__PURE__ */ Object.assign(Empty, {
  PRESENTED_IMAGE_DEFAULT: DefaultImage,
  PRESENTED_IMAGE_SIMPLE: SimpleImage,
})
