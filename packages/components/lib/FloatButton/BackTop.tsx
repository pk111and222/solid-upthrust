import { Component, merge } from 'solid-js'
import FloatButton, { type FloatButtonProps } from './index'

/**
 * BackTop — FloatButton's BackTop preset (antd keeps both entries; the
 * standalone BackTop is a FloatButton with the up glyph + threshold).
 */
export type BackTopProps = Omit<FloatButtonProps, 'backTop' | 'icon' | 'ref'> & {
  /** Visibility threshold override. Default 400. */
  visibilityHeight?: number
}

const BackTop: Component<BackTopProps> = (rawProps) => {
  const props = merge({}, rawProps)
  return (
    <FloatButton
      {...props}
      backTop
      visibilityHeight={props.visibilityHeight ?? 400}
    />
  )
}

export default BackTop

