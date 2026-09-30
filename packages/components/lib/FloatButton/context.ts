import { createContext } from 'solid-js'
import type { JSX } from '@solidjs/web'

export type FloatButtonType = 'default' | 'primary'
export type FloatButtonShape = 'circle' | 'square'

/** antd ButtonSemanticName 子集：FloatButton 的语义化节点。 */
export interface FloatButtonSemanticClassNames {
  root?: string
  icon?: string
  content?: string
}

export interface FloatButtonSemanticStyles {
  root?: JSX.CSSProperties
  icon?: JSX.CSSProperties
  content?: JSX.CSSProperties
}

/**
 * Group → 子按钮的注入（antd GroupContext）：shape 覆盖子按钮、individual 决定
 * 是否各自带阴影（circle）或并入 Compact 列表（square），语义化类名 / 样式映射到
 * item* 或 trigger* 节点。可选注入必须以 null 为默认值（Solid 2 无 Provider 时抛错）。
 */
export interface FloatButtonGroupContextValue {
  readonly shape: FloatButtonShape
  readonly individual: boolean
  readonly axis: 'vertical' | 'horizontal'
  readonly classNames: FloatButtonSemanticClassNames
  readonly styles: FloatButtonSemanticStyles
}

export const FloatButtonGroupContext = createContext<FloatButtonGroupContextValue | null>(null)
