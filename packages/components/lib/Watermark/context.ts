import { createContext, createEffect, onCleanup, useContext, type Accessor } from 'solid-js'

/** antd WatermarkContext：Modal / Drawer 把面板元素登记给外层 Watermark，使弹层也带水印（inherit）。 */
export interface WatermarkContextValue {
  add: (el: HTMLElement) => void
  remove: (el: HTMLElement) => void
}

export const WatermarkContext = createContext<WatermarkContextValue | null>(null)

/**
 * 弹层面板登记：`open` 为真且元素已挂上时 add，关闭 / 卸载时 remove。
 * 元素通过 getter 读取（ref 在属性与插入之前执行，effect 阶段才稳定）。
 */
export function useWatermarkPanel(open: Accessor<boolean>, getElement: () => HTMLElement | undefined) {
  const watermark = useContext(WatermarkContext)
  if (!watermark) return
  let registered: HTMLElement | undefined
  const release = () => {
    if (registered) watermark.remove(registered)
    registered = undefined
  }
  createEffect(open, (isOpen) => {
    if (!isOpen) { release(); return }
    const el = getElement()
    if (el && el !== registered) {
      release()
      registered = el
      watermark.add(el)
    }
  })
  onCleanup(release)
}
